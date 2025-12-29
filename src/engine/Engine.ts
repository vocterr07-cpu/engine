import Camera from "./Camera";
import Gizmo from "./Gizmo";
import InputManager from "./InputManager";
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
    public gizmo: Gizmo;

    public lastTime = 0;
    public fps = 0;
    public mode: "camera" | "player" = "camera";
    private frameId: number = 0;
    private isDestroyed: boolean = false;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const gl = canvas.getContext("webgl2");
        if (!gl) throw new Error("WebGL2 not supported");
        this.gl = gl;

        this.input = new InputManager(canvas);
        this.player = new Player([0, 0, 0]);
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
        this.loop();
    }

    private loop = () => {
        const now = performance.now();
        const dt = now - this.lastTime;
        this.lastTime = now;
        this.fps = Math.round(1000 / dt) || 0;
        if (this.isDestroyed) return;

        if (this.canvas.width !== this.canvas.clientWidth || this.canvas.height !== this.canvas.clientHeight) {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
        
        if (this.mode === "player") this.player.update(this.input, this.camera.yaw);
        
        // Obsługa dragu Gizma
        if (this.input.mouse[0]) {
             const x = this.input.mouseX;
             const y = this.input.mouseY;
             const ray = this.camera.getRay(x, y);
             this.gizmo.onMouseMove(ray);
             this.gizmo.checkHit(ray); // update hover color
        }
        
        this.camera.update();
        this.gizmo.update(this.camera);

        this.renderer.render(this.scene.children, this.camera);
        this.renderer.renderGizmo(this.gizmo.root, this.camera);
        
        this.frameId = requestAnimationFrame(this.loop);
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