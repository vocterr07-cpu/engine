import type Camera from "./Camera";
import type Engine from "./Engine";
import type GameObject from "./GameObject";

export default class Renderer {
    private gl: WebGL2RenderingContext;
    public mainProgram!: WebGLProgram;
    public locMainModel!: WebGLUniformLocation;
    public locMainView!: WebGLUniformLocation;
    public locMainProj!: WebGLUniformLocation;
    public locMainColor!: WebGLUniformLocation;
    private locMainTexture!: WebGLUniformLocation;
    private locMainUseTexture!: WebGLUniformLocation
    
    constructor(engine: Engine) {
        this.gl = engine.gl;;
        this.setupMainProgram();
    }

    public render(objects: GameObject[], camera: Camera) {
        this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.useProgram(this.mainProgram);
        this.gl.uniformMatrix4fv(this.locMainView, false, camera.viewMatrix);
        this.gl.uniformMatrix4fv(this.locMainProj, false, camera.projMatrix);
        
        // 1. Rysowanie obiektów stałych (Nieprzezroczystych)
        const drawOpaque = (obj: GameObject) => {     
            if (obj.mesh) {
                obj.mesh.bind();
                obj.update(); // Update logiki
                this.gl.uniformMatrix4fv(this.locMainModel, false, obj.getMatrixModel());
                this.gl.uniform3fv(this.locMainColor, obj.color);
                
                if (obj.useTexture && obj.texture) {
                    obj.texture.bind(0);
                    this.gl.uniform1i(this.locMainTexture, 0);
                    this.gl.uniform1i(this.locMainUseTexture, 1);
                } else {
                    this.gl.uniform1i(this.locMainUseTexture, 0);
                }
                if (obj.mesh.indexCount > 0) {
                    this.gl.drawElements(this.gl.TRIANGLES, obj.mesh.indexCount, this.gl.UNSIGNED_INT, 0);
                } else {
                    this.gl.drawArrays(this.gl.TRIANGLES, 0, obj.mesh.vertexCount)
                }
            }
            obj.children.forEach(child => drawOpaque(child));
        };
        objects.forEach(obj => drawOpaque(obj));

        // 2. Rysowanie Particlesów (Przezroczystych - na wierzchu)
        // Robimy to w drugim przebiegu, żeby blending działał poprawnie na tle obiektów
        const drawEffects = (obj: GameObject) => {
            if (obj.particleSystem) {
                // Przekazujemy lokacje uniformów do systemu cząsteczek
                obj.particleSystem.render(this.gl, {
                    model: this.locMainModel,
                    color: this.locMainColor,
                    texture: this.locMainTexture,
                    useTexture: this.locMainUseTexture
                });
            }
            obj.children.forEach(child => drawEffects(child));
        }
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
                this.gl.drawArrays(this.gl.TRIANGLES, 0, obj.mesh.vertexCount);
            }
            obj.children.forEach(child => drawRecursive(child));
        }
        gizmoRoot.children.forEach(child => drawRecursive(child));
    }

    private setupMainProgram() {
        // (Kod shadera bez zmian - jest poprawny)
        this.mainProgram = this.gl.createProgram()!;
        const vs = `#version 300 es
            layout(location = 0) in vec3 pos;
            layout(location = 1) in vec2 a_texCoord;
            layout(location = 2) in vec3 a_normal;
            uniform mat4 u_model;
            uniform mat4 u_view;
            uniform mat4 u_proj;
            out vec2 v_texCoord;
            out vec3 v_normal;
            out vec3 v_fragPos;
            void main() {
                v_texCoord = a_texCoord;
                v_normal = mat3(transpose(inverse(u_model))) * a_normal;
                v_fragPos = vec3(u_model * vec4(pos, 1.0));
                gl_Position = u_proj * u_view * u_model * vec4(pos, 1.0);
            }
        `;
        const fs = `#version 300 es
            precision highp float;
            in vec2 v_texCoord;
            in vec3 v_normal;
            in vec3 v_fragPos;
            uniform sampler2D u_texture;
            uniform bool u_useTexture;
            uniform vec3 u_color;
            out vec4 outColor;
            void main() {
            vec3 norm = normalize(v_normal);
            vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
            float diff = max(dot(norm, lightDir), 0.0);
            float ambient = 0.3;
            vec3 lighting = (diff + ambient) * vec3(1.0,1.0,1.0);
            vec4 baseColor = vec4(u_color, 1.0);
                if (u_useTexture) {
                    baseColor = texture(u_texture, v_texCoord) * vec4(u_color, 1.0);
                } 
                outColor = vec4(baseColor.rgb * lighting, baseColor.a);
            }
        `;
        const createShader = (type: number, src: string) => {
            const shader = this.gl.createShader(type)!;
            this.gl.shaderSource(shader, src);
            this.gl.compileShader(shader);
            this.gl.attachShader(this.mainProgram, shader);
        };
        createShader(this.gl.VERTEX_SHADER, vs);
        createShader(this.gl.FRAGMENT_SHADER, fs);
        this.gl.linkProgram(this.mainProgram);
        this.gl.useProgram(this.mainProgram);
        this.locMainModel = this.gl.getUniformLocation(this.mainProgram, "u_model")!;
        this.locMainView = this.gl.getUniformLocation(this.mainProgram, "u_view")!;
        this.locMainProj = this.gl.getUniformLocation(this.mainProgram, "u_proj")!;
        this.locMainColor = this.gl.getUniformLocation(this.mainProgram, "u_color")!;
        this.locMainTexture = this.gl.getUniformLocation(this.mainProgram, "u_texture")!;
        this.locMainUseTexture = this.gl.getUniformLocation(this.mainProgram, "u_useTexture")!;
    }
}