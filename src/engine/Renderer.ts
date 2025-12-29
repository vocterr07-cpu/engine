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
        this.gl = engine.gl;
        this.setupMainProgram();
    }

    public render(objects: GameObject[], camera: Camera) {
        this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.useProgram(this.mainProgram);
        this.gl.uniformMatrix4fv(this.locMainView, false, camera.viewMatrix);
        this.gl.uniformMatrix4fv(this.locMainProj, false, camera.projMatrix);

        // Funkcja rysująca (bez rekurencji dla głównej sceny, chyba że chcesz)
        // W twoim przykładzie było płasko, ale tutaj dodajemy obsługę getMatrixModel()
        const draw = (obj: GameObject) => {
            // obj.position[0] += 0.0001; // Usuń ten auto-ruch, bo psuje edytor!
            
            if (obj.mesh) {
                obj.mesh.bind();
                obj.update();
                this.gl.uniformMatrix4fv(this.locMainModel, false, obj.getMatrixModel());
                this.gl.uniform3fv(this.locMainColor, obj.color);
                
                if (obj.useTexture && obj.texture) {
                    obj.texture.bind(0);
                    this.gl.uniform1i(this.locMainTexture, 0);
                    this.gl.uniform1i(this.locMainUseTexture, 1);
                } else {
                    this.gl.uniform1i(this.locMainUseTexture, 0);
                }
                this.gl.drawArrays(this.gl.TRIANGLES, 0, obj.mesh.vertexCount);
            }
            // Rekurencja dla dzieci
            obj.children.forEach(child => draw(child));
        };

        objects.forEach(obj => draw(obj));
    }

    public renderGizmo(gizmoRoot: GameObject, camera: Camera) {
        // Czyść tylko głębokość = rysuj na wierzchu
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
        
        // Rysujemy dzieci roota (osie), samego roota można pominąć jeśli jest pusty
        gizmoRoot.children.forEach(child => drawRecursive(child));
    }

    private setupMainProgram() {
        this.mainProgram = this.gl.createProgram()!;
        const vs = `#version 300 es
            layout(location = 0) in vec3 pos;
            layout(location = 1) in vec2 a_texCoord;
            uniform mat4 u_model;
            uniform mat4 u_view;
            uniform mat4 u_proj;
            out vec2 v_texCoord;
            void main() {
                v_texCoord = a_texCoord;
                gl_Position = u_proj * u_view * u_model * vec4(pos, 1.0);
            }
        `;
        const fs = `#version 300 es
            precision highp float;
            in vec2 v_texCoord;
            uniform sampler2D u_texture;
            uniform bool u_useTexture;
            uniform vec3 u_color;
            out vec4 outColor;
            void main() {
                if (u_useTexture) {
                    vec4 texColor = texture(u_texture, v_texCoord);
                    outColor = texColor * vec4(u_color, 1.0);
                } else {
                    outColor = vec4(u_color, 1.0);
                }
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