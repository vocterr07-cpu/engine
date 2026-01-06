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
    public locTerrainArray!: WebGLUniformLocation;

    constructor(engine: Engine) {
        this.gl = engine.gl;
        this.setupMainProgram();
    }

    public render(objects: GameObject[], camera: Camera) {
        this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.useProgram(this.mainProgram);

        this.gl.uniformMatrix4fv(this.locMainView, false, camera.viewMatrix);
        this.gl.uniformMatrix4fv(this.locMainProj, false, camera.projMatrix);

        const drawOpaque = (obj: GameObject) => {
            if (obj.mesh) {
                obj.mesh.bind();
                
                this.gl.uniformMatrix4fv(this.locMainModel, false, obj.getMatrixModel());
                this.gl.uniform3fv(this.locMainColor, obj.color);

                // --- LOGIKA TERENU ---
                if (obj instanceof Terrain) {
                    this.gl.uniform1i(this.locIsTerrain, 1);
                    
                    // Bindujemy TextureArray do slotu 1
                    // (Slot 0 jest zajęty przez u_texture, nawet jeśli go nie używamy)
                    if (obj.textureArray) {
                        obj.textureArray.bind(1);
                        // Nie musimy tu ustawiać uniform1i, bo zrobiliśmy to w setupMainProgram
                        // ale dla pewności można zostawić:
                        this.gl.uniform1i(this.locTerrainArray, 1);
                    }
                } 
                // --- LOGIKA ZWYKŁYCH OBIEKTÓW ---
                else {
                    this.gl.uniform1i(this.locIsTerrain, 0);

                    if (obj.useTexture && obj.texture) {
                        obj.texture.bind(0); // Slot 0
                        // To też jest ustawione na sztywno w setup, ale bind jest konieczny
                        this.gl.uniform1i(this.locMainUseTexture, 1);
                    } else {
                        this.gl.uniform1i(this.locMainUseTexture, 0);
                    }
                }

                if (obj.mesh.indexCount > 0) {
                    this.gl.drawElements(this.gl.TRIANGLES, obj.mesh.indexCount, this.gl.UNSIGNED_INT, 0);
                } else {
                    this.gl.drawArrays(this.gl.TRIANGLES, 0, obj.mesh.vertexCount);
                }
            }
            
            obj.children.forEach(child => drawOpaque(child));
        };

        objects.forEach(obj => drawOpaque(obj));

        // Rysowanie efektów
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
                this.gl.uniform1i(this.locIsTerrain, 0);
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
            layout(location = 3) in vec4 a_w1;
            layout(location = 4) in vec4 a_w2;
            uniform mat4 u_model, u_view, u_proj;
            out vec2 v_uv; out vec3 v_norm; out vec4 v_w1; out vec4 v_w2;
            void main() {
                v_uv = a_texCoord; v_w1 = a_w1; v_w2 = a_w2;
                v_norm = mat3(transpose(inverse(u_model))) * a_normal;
                gl_Position = u_proj * u_view * u_model * vec4(pos, 1.0);
            }`;
        const fs = `#version 300 es
    precision highp float;
    precision highp sampler2DArray;

    in vec2 v_uv;
    in vec3 v_norm;
    in vec4 v_w1;
    in vec4 v_w2;

    uniform sampler2D u_tex;
    uniform sampler2DArray u_terArray;

    uniform bool u_useTex;
    uniform bool u_isTer;
    uniform vec3 u_color; // ZMIENIONO Z u_col NA u_color, żeby pasowało do JS

    out vec4 fCol;

    void main() {
        vec3 n = normalize(v_norm);
        vec3 l = normalize(vec3(0.5, 1.0, 0.3));
        
        // --- TESTOWE OŚWIETLENIE (Zwiększony ambient, żeby nie było czarno) ---
        float d = max(dot(n, l), 0.0) * 0.7 + 0.4; 
        
        vec4 baseColor = vec4(u_color, 1.0);

        if (u_isTer) {
            // Pobieramy próbki
            vec4 c0 = texture(u_terArray, vec3(v_uv, 0.0));
            vec4 c1 = texture(u_terArray, vec3(v_uv, 1.0));
            vec4 c2 = texture(u_terArray, vec3(v_uv, 2.0));
            vec4 c3 = texture(u_terArray, vec3(v_uv, 3.0));
            vec4 c4 = texture(u_terArray, vec3(v_uv, 4.0));
            vec4 c5 = texture(u_terArray, vec3(v_uv, 5.0));
            vec4 c6 = texture(u_terArray, vec3(v_uv, 6.0));
            vec4 c7 = texture(u_terArray, vec3(v_uv, 7.0));

            // MIESZANIE - sprawdzamy czy suma wag nie jest zerem
            vec4 mix1 = c0 * v_w1.r + c1 * v_w1.g + c2 * v_w1.b + c3 * v_w1.a;
            vec4 mix2 = c4 * v_w2.r + c5 * v_w2.g + c6 * v_w2.b + c7 * v_w2.a;
            
            baseColor = (mix1 + mix2);
            
            // Jeśli wszystko jest czarne, wymuś kolor testowy, żeby sprawdzić czy to wina wag
            if(baseColor.a < 0.1) baseColor = vec4(1.0, 0.0, 1.0, 1.0); // Fioletowy = błąd wag
            
            baseColor *= vec4(u_color, 1.0);
        } else if (u_useTex) {
            baseColor = texture(u_tex, v_uv) * vec4(u_color, 1.0);
        }

        fCol = vec4(baseColor.rgb * d, baseColor.a);
    }
`;

        const compile = (t: number, s: string) => {
            const sh = this.gl.createShader(t)!;
            this.gl.shaderSource(sh, s); this.gl.compileShader(sh);
            this.gl.attachShader(this.mainProgram, sh);
        };
        compile(this.gl.VERTEX_SHADER, vs); compile(this.gl.FRAGMENT_SHADER, fs);
        this.gl.linkProgram(this.mainProgram);

        this.locMainModel = this.gl.getUniformLocation(this.mainProgram, "u_model")!;
        this.locMainView = this.gl.getUniformLocation(this.mainProgram, "u_view")!;
        this.locMainProj = this.gl.getUniformLocation(this.mainProgram, "u_proj")!;
        this.locMainColor = this.gl.getUniformLocation(this.mainProgram, "u_color")!;
        this.locMainTexture = this.gl.getUniformLocation(this.mainProgram, "u_tex")!;
        this.locMainUseTexture = this.gl.getUniformLocation(this.mainProgram, "u_useTex")!;
        this.locIsTerrain = this.gl.getUniformLocation(this.mainProgram, "u_isTer")!;
        this.locTerrainArray = this.gl.getUniformLocation(this.mainProgram, "u_terArray")!;

        this.gl.useProgram(this.mainProgram);
        this.gl.uniform1i(this.locMainTexture, 0);
        this.gl.uniform1i(this.locTerrainArray, 1);
    }
}