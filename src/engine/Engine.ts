import Camera from "./Camera";
import Gizmo from "./Gizmo";
import InputManager from "./InputManager";
import { Logger } from "./Logger";
import Player from "./Player";
import Renderer from "./Renderer";
import Scene from "./Scene";
import { state } from "./store";
export default class Engine {
    public canvas: HTMLCanvasElement;
    public gl: WebGL2RenderingContext;
    public input: InputManager;
    private player: Player;
    public camera: Camera;
    public scene: Scene;
    public renderer: Renderer;
    public gizmo: Gizmo;;

    public fps = 0;
    
    private frameId: number = 0;
    private isDestroyed: boolean = false;
    public editMode: "move" | "rotate" = "move"; 

    public lastTime: number = 0;


    constructor(canvas: HTMLCanvasElement) {
        Logger.init();
        console.log("Engine initialization started...")
        this.canvas = canvas;
        const gl = canvas.getContext("webgl2");
        if (!gl) throw new Error("WebGL2 not supported");
        this.gl = gl;
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.disable(this.gl.CULL_FACE)
        this.gl.depthFunc(this.gl.LEQUAL);
        this.input = new InputManager(canvas);
        this.player = new Player();
        this.camera = new Camera(canvas, this.input, this);
        this.scene = new Scene(this);
        this.renderer = new Renderer(this);
        this.gizmo = new Gizmo(this);

        
        this.setupGizmoInput();
    }

    private setupGizmoInput() {
        this.input.onMouseDown = (e) => {
             const rect = this.canvas.getBoundingClientRect();
             const x = e.clientX - rect.left;
             const y = e.clientY - rect.top;
             const ray = this.camera.getRay(x, y);

             // Najpierw Gizmo
             const hitGizmo = this.gizmo.onMouseDown(ray);

             // Jak nie Gizmo, to wybór obiektu
             if (!hitGizmo && e.button === 0) {
                 this.camera.handleEditorClick(ray);
             }
        };

        this.input.onMouseUp = () => {
            this.gizmo.onMouseUp();
        };
    }

    public start() {
        if (this.isDestroyed) return;
        this.player.position = [...this.camera.position];
        const currentTime = performance.now();
        this.loop(currentTime);
    }

    private loop = (currentTime: number) => {
        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;
        state.deltaTime = dt;
        this.fps = Math.round(1 / dt) || 0;
        if (this.isDestroyed) return;

        if (this.canvas.width !== this.canvas.clientWidth || this.canvas.height !== this.canvas.clientHeight) {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
        if (state.mode === "player") {
            this.player.update(this.input, this.camera.yaw);
            if (!state.gameStarted) {
                state.gameStarted = true;
                this.scene.children.forEach(obj => {
                    obj.start();
                })
            }
        }
        
        // Obsługa dragu Gizma
        if (this.input.mouse[0]) {
             const x = this.input.mouseX;
             const y = this.input.mouseY;
             const ray = this.camera.getRay(x, y);
             const rect = this.canvas.getBoundingClientRect();
             const globalX = x + rect.left;
             const globalY = y + rect.top;

             this.gizmo.onMouseMove(ray, globalX, globalY);
             this.gizmo.checkHit(ray);
        }
        
        this.camera.update();
        this.gizmo.update(this.camera);

        this.renderer.render(this.scene.children, this.camera);
        this.renderer.renderGizmo(this.gizmo.root, this.camera);
        
        
        this.frameId = requestAnimationFrame((time) => this.loop(time));
    }
    
    // ... getPlayer i destroy bez zmian ...
    public getPlayer() { return this.player; }
    public destroy() {
        this.isDestroyed = true;
        cancelAnimationFrame(this.frameId);
        this.input.destroy();
        this.camera.destroy();
        console.log("Engine: Zniszczony.");
    }
}
