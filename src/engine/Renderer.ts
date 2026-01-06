import type Camera from "./Camera";
import type Engine from "./Engine";
import type GameObject from "./GameObject";
import Terrain from "./Terrain";

export default class Renderer {
    private gl: WebGL2RenderingContext;
    public mainProgram!: WebGLProgram;

    // Lokacje Uniformów - Standardowe
    public locMainModel!: WebGLUniformLocation;
    public locMainView!: WebGLUniformLocation;
    public locMainProj!: WebGLUniformLocation;
    public locMainColor!: WebGLUniformLocation;
    private locMainTexture!: WebGLUniformLocation;
    private locMainUseTexture!: WebGLUniformLocation;

    // Lokacje Uniformów - Teren
    public locIsTerrain!: WebGLUniformLocation;
    public locTerrainTex0!: WebGLUniformLocation;
    public locTerrainTex1!: WebGLUniformLocation;
    public locTerrainTex2!: WebGLUniformLocation;

    constructor(engine: Engine) {
        this.gl = engine.gl;
        this.setupMainProgram();
    }

    public render(objects: GameObject[], camera: Camera) {
        // Czyścimy ekran i bufor głębi
        this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.useProgram(this.mainProgram);

        // Ustawiamy macierze kamery raz na klatkę
        this.gl.uniformMatrix4fv(this.locMainView, false, camera.viewMatrix);
        this.gl.uniformMatrix4fv(this.locMainProj, false, camera.projMatrix);

        // 1. Rysowanie obiektów stałych (Nieprzezroczystych)
        const drawOpaque = (obj: GameObject) => {
            if (obj.mesh) {
                obj.mesh.bind();
                
                // Przekazujemy macierz modelu i kolor obiektu
                this.gl.uniformMatrix4fv(this.locMainModel, false, obj.getMatrixModel());
                this.gl.uniform3fv(this.locMainColor, obj.color);

                // --- LOGIKA TERENU ---
                if (obj instanceof Terrain) {
                    // Włączamy tryb terenu w shaderze
                    this.gl.uniform1i(this.locIsTerrain, 1);

                    // Bindujemy 3 tekstury warstw do slotów 1, 2 i 3
                    if (obj.textureLayers[0]) {
                        obj.textureLayers[0].bind(1);
                        this.gl.uniform1i(this.locTerrainTex0, 1);
                    }
                    if (obj.textureLayers[1]) {
                        obj.textureLayers[1].bind(2);
                        this.gl.uniform1i(this.locTerrainTex1, 2);
                    }
                    if (obj.textureLayers[2]) {
                        obj.textureLayers[2].bind(3);
                        this.gl.uniform1i(this.locTerrainTex2, 3);
                    }
                } 
                // --- LOGIKA ZWYKŁYCH OBIEKTÓW ---
                else {
                    // Wyłączamy tryb terenu
                    this.gl.uniform1i(this.locIsTerrain, 0);

                    if (obj.useTexture && obj.texture) {
                        obj.texture.bind(0); // Standardowe obiekty na slocie 0
                        this.gl.uniform1i(this.locMainTexture, 0);
                        this.gl.uniform1i(this.locMainUseTexture, 1);
                    } else {
                        this.gl.uniform1i(this.locMainUseTexture, 0);
                    }
                }

                // Wykonujemy rysowanie (Indeksowane lub tablicowe)
                if (obj.mesh.indexCount > 0) {
                    this.gl.drawElements(this.gl.TRIANGLES, obj.mesh.indexCount, this.gl.UNSIGNED_INT, 0);
                } else {
                    this.gl.drawArrays(this.gl.TRIANGLES, 0, obj.mesh.vertexCount);
                }
            }
            
            // Rekurencyjne rysowanie dzieci
            obj.children.forEach(child => drawOpaque(child));
        };

        // Renderujemy główną scenę
        objects.forEach(obj => drawOpaque(obj));

        // 2. Rysowanie efektów (Particles)
        const drawEffects = (obj: GameObject) => {
            if (obj.particleSystem) {
                obj.particleSystem.render(this.gl, {
                    model: this.locMainModel,
                    color: this.locMainColor,
                    texture: this.locMainTexture,
                    useTexture: this.locMainUseTexture
                });
            }
            obj.children.forEach(child => drawEffects(child));
        };
        objects.forEach(obj => drawEffects(obj));
    }

    public renderGizmo(gizmoRoot: GameObject, camera: Camera) {
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
        this.gl.useProgram(this.mainProgram);
        this.gl.uniformMatrix4fv(this.locMainView, false, camera.viewMatrix);
        this.gl.uniformMatrix4fv(this.locMainProj, false, camera.projMatrix);

        const drawRecursive = (obj: GameObject) => {
            if (obj.mesh) {
                obj.mesh.bind();
                this.gl.uniformMatrix4fv(this.locMainModel, false, obj.getMatrixModel());
                this.gl.uniform3fv(this.locMainColor, obj.color);
                this.gl.uniform1i(this.locMainUseTexture, 0);
                this.gl.uniform1i(this.locIsTerrain, 0); // Gizmo to nie teren
                this.gl.drawArrays(this.gl.TRIANGLES, 0, obj.mesh.vertexCount);
            }
            obj.children.forEach(child => drawRecursive(child));
        };
        gizmoRoot.children.forEach(child => drawRecursive(child));
    }

    private setupMainProgram() {
        this.mainProgram = this.gl.createProgram()!;

        const vs = `#version 300 es
            layout(location = 0) in vec3 pos;
            layout(location = 1) in vec2 a_texCoord;
            layout(location = 2) in vec3 a_normal;
            layout(location = 3) in vec3 a_weights; // Wagi splattingu

            uniform mat4 u_model;
            uniform mat4 u_view;
            uniform mat4 u_proj;

            out vec2 v_texCoord;
            out vec3 v_normal;
            out vec3 v_fragPos;
            out vec3 v_weights;

            void main() {
                v_texCoord = a_texCoord;
                v_normal = mat3(transpose(inverse(u_model))) * a_normal;
                v_fragPos = vec3(u_model * vec4(pos, 1.0));
                v_weights = a_weights;
                gl_Position = u_proj * u_view * u_model * vec4(pos, 1.0);
            }
        `;

        const fs = `#version 300 es
            precision highp float;

            in vec2 v_texCoord;
            in vec3 v_normal;
            in vec3 v_fragPos;
            in vec3 v_weights;

            uniform sampler2D u_texture;
            uniform sampler2D u_terrainTex0;
            uniform sampler2D u_terrainTex1;
            uniform sampler2D u_terrainTex2;

            uniform bool u_useTexture;
            uniform bool u_isTerrain;
            uniform vec3 u_color;

            out vec4 outColor;

            void main() {
                vec3 norm = normalize(v_normal);
                vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
                float diff = max(dot(norm, lightDir), 0.0);
                float ambient = 0.3;
                vec3 lighting = (diff + ambient) * vec3(1.0, 1.0, 1.0);
                
                vec4 baseColor = vec4(u_color, 1.0);

                if (u_isTerrain) {
                    vec4 t0 = texture(u_terrainTex0, v_texCoord);
                    vec4 t1 = texture(u_terrainTex1, v_texCoord);
                    vec4 t2 = texture(u_terrainTex2, v_texCoord);
                    // Splatting na podstawie wag RGB
                    baseColor = t0 * v_weights.r + t1 * v_weights.g + t2 * v_weights.b;
                    baseColor *= vec4(u_color, 1.0);
                } 
                else if (u_useTexture) {
                    baseColor = texture(u_texture, v_texCoord) * vec4(u_color, 1.0);
                }

                outColor = vec4(baseColor.rgb * lighting, baseColor.a);
            }
        `;

        const createShader = (type: number, src: string) => {
            const shader = this.gl.createShader(type)!;
            this.gl.shaderSource(shader, src);
            this.gl.compileShader(shader);
            if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                console.error("Shader Error:", this.gl.getShaderInfoLog(shader));
            }
            this.gl.attachShader(this.mainProgram, shader);
        };

        createShader(this.gl.VERTEX_SHADER, vs);
        createShader(this.gl.FRAGMENT_SHADER, fs);

        this.gl.linkProgram(this.mainProgram);
        if (!this.gl.getProgramParameter(this.mainProgram, this.gl.LINK_STATUS)) {
            console.error("Program Link Error:", this.gl.getProgramInfoLog(this.mainProgram));
        }

        // Pobieranie lokacji uniformów
        this.locMainModel = this.gl.getUniformLocation(this.mainProgram, "u_model")!;
        this.locMainView = this.gl.getUniformLocation(this.mainProgram, "u_view")!;
        this.locMainProj = this.gl.getUniformLocation(this.mainProgram, "u_proj")!;
        this.locMainColor = this.gl.getUniformLocation(this.mainProgram, "u_color")!;
        this.locMainTexture = this.gl.getUniformLocation(this.mainProgram, "u_texture")!;
        this.locMainUseTexture = this.gl.getUniformLocation(this.mainProgram, "u_useTexture")!;
        this.locIsTerrain = this.gl.getUniformLocation(this.mainProgram, "u_isTerrain")!;
        this.locTerrainTex0 = this.gl.getUniformLocation(this.mainProgram, "u_terrainTex0")!;
        this.locTerrainTex1 = this.gl.getUniformLocation(this.mainProgram, "u_terrainTex1")!;
        this.locTerrainTex2 = this.gl.getUniformLocation(this.mainProgram, "u_terrainTex2")!;
    }
}