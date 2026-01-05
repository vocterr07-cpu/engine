import Component from "./Component";
import { sub, dot } from "../math";
import { state, storeActions } from "./store";
import GameObject from "./GameObject";

export default class MouseEventComponent extends Component {
    public isHovered: boolean = false;
    public debounce = 0;

    // --- LOGIC FLAGS ---
    public duplicateOnClick: boolean = false;
    public destroyOnClick: boolean = false;
    public logInConsole: boolean = false;
    public logText: string = "";

    // --- COLOR ---
    public clickColorChange: boolean = false;
    public clickChangedColor: boolean = false;
    public targetColor: [number, number, number] = [1, 1, 0];
    private originalColor: [number, number, number] = [1, 1, 1];

    // --- AUDIO ---
    public clickPlayAudio: boolean = false; // Uwaga: w UI używasz nazwy clickPlayAudio
    public audioUrl: string = "";
    public repeatAudio: boolean = false;
    public repeatInterval: number = 1.0;
    
    private audioInstance: HTMLAudioElement | null = null;
    private lastTriggerTime: number = 0;

    update() {
        if (this.debounce > 0) this.debounce--;
        if (state.mode === "camera") return;

        const engine = this.gameObject?.scene?.engine;
        if (!engine) return;

        const input = engine.input;
        const camera = engine.camera;
        if (!input || !camera) return;

        // 1. Raycasting
        const ray = camera.getRay(input.mouseX, input.mouseY);
        const isHit = this.checkIntersection(ray, this.gameObject);

        // 2. Hover
        if (isHit && !this.isHovered) {
            this.isHovered = true;
            this.onEnter();
        } else if (!isHit && this.isHovered) {
            this.isHovered = false;
            this.onLeave();
        }

        // 3. Click (Mouse Hold)
        if (isHit && input.mouse[0]) {
            // Jeśli mamy włączone powtarzanie audio, ignorujemy główny debounce dla audio
            // (audio ma swój własny timer), ale reszta akcji (destroy/duplicate) musi mieć debounce
            
            this.onClick(this.debounce <= 0);

            if (this.debounce <= 0) {
                this.debounce = 30; // Reset debounce dla akcji niszczących/tworzących
            }
        }
    }

    private onEnter() {
        document.body.style.cursor = "pointer";
    }

    private onLeave() {
        document.body.style.cursor = "default";
    }

    private onClick(canExecuteDestructiveActions: boolean) {
        // --- AUDIO LOGIC ---
        if (this.clickPlayAudio && this.audioUrl) {
            if (!this.audioInstance || this.audioInstance.src !== this.audioUrl) {
                this.audioInstance = new Audio(this.audioUrl);
            }

            const now = performance.now();

            if (this.audioInstance) {
                // Scenariusz A: Powtarzanie (Loop)
                if (this.repeatAudio) {
                    if (now - this.lastTriggerTime >= this.repeatInterval * 1000) {
                        this.audioInstance.currentTime = 0;
                        this.audioInstance.play().catch(e => console.warn(e));
                        this.lastTriggerTime = now;
                    }
                } 
                // Scenariusz B: Pojedynczy strzał (tylko gdy minął główny debounce)
                else if (canExecuteDestructiveActions) {
                    this.audioInstance.currentTime = 0;
                    this.audioInstance.play().catch(e => console.warn(e));
                }
            }
        }
        
        // Poniższe akcje wykonujemy tylko "raz na kliknięcie" (wg debounce)
        if (!canExecuteDestructiveActions) return;

        console.log("Clicked object:", this.gameObject?.name);

        if (this.duplicateOnClick && this.gameObject && this.gameObject.scene && state.mode === "player") {
            const newObject = this.gameObject.clone();
            storeActions.addObject(newObject);
        }

        if (this.clickColorChange && this.gameObject && this.gameObject.scene) {
            if (!this.clickChangedColor) {
                this.originalColor = [...this.gameObject.color];
                this.gameObject.color = this.targetColor;
                this.clickChangedColor = true;
            } else {
                this.gameObject.color = this.originalColor;
                this.clickChangedColor = false;
            }
        }

        if (this.destroyOnClick && this.gameObject && this.gameObject.scene) {
            storeActions.removeObject(this.gameObject);
        }
    }

    private checkIntersection(ray: { rayOrigin: any, rayDir: any }, obj: any): boolean {
        if (!obj) return false;
        const oc = sub(ray.rayOrigin, obj.position);
        const radius = Math.max(obj.scale[0], obj.scale[1], obj.scale[2]) * 0.8;
        const b = dot(oc, ray.rayDir);
        const c = dot(oc, oc) - radius * radius;
        const h = b * b - c;
        return h >= 0;
    }
}