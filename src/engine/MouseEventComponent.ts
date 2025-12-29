import Component from "./Component";
import { sub, dot } from "../math";
import { storeActions } from "./store";

export default class MouseEventComponent extends Component {
    public isHovered: boolean = false;
    public debounce = 0;

    // Parametry sterowane z UI
    public hoverColorChange: boolean = false;
    public targetColor: [number, number, number] = [1, 1, 0]; // Domyślnie żółty
    public destroyOnClick: boolean = false;
    public playAudio: boolean = false;
    public audioUrl: string = ""; 
    public logInConsole: boolean = false;
    public logText: string = "";

    // Pamięć stanu
    private originalColor: [number, number, number] = [1, 1, 1];
    private audioInstance: HTMLAudioElement | null = null;

     update() {
        if (this.debounce > 0) this.debounce--;

        const engine = this.gameObject?.scene?.engine;
        if (!engine) return;

        const input = engine.input;
        const camera = engine.camera;
        if (!input || !camera) return;

        // 1. Raycasting (czy myszka celuje w obiekt)
        const ray = camera.getRay(input.mouseX, input.mouseY);
        const isHit = this.checkIntersection(ray, this.gameObject);

        // 2. Obsługa HOVER (Najechanie myszką)
        if (isHit && !this.isHovered) {
            this.isHovered = true;
            this.onEnter();
        } else if (!isHit && this.isHovered) {
            this.isHovered = false;
            this.onLeave();
        }

        // 3. Obsługa CLICK (Kliknięcie)
        if (isHit && input.mouse[0] && this.debounce <= 0) {
            this.onClick();
            this.debounce = 30; // 0.5 sekundy przerwy między kliknięciami
        }
    }

    public reloadAudio() {
        if (this.audioUrl) {
            this.audioInstance = new Audio(this.audioUrl);
            this.audioInstance.preload = "auto";
        }
    }

    private onEnter() {
        if (this.hoverColorChange && this.gameObject) {
            // Zapisujemy stary kolor, żeby mieć do czego wrócić
            this.originalColor = [...this.gameObject.color];
            this.gameObject.color = [...this.targetColor];
        }
        if (this.logInConsole && this.gameObject) {
            console.log(this.logText);
        }
        document.body.style.cursor = "pointer";
    }

    private onLeave() {
        if (this.hoverColorChange && this.gameObject) {
            // Przywracamy kolor
            this.gameObject.color = [...this.originalColor];
        }
        document.body.style.cursor = "default";
    }

    private onClick() {
        console.log("Clicked object:", this.gameObject?.name);

        if (this.playAudio && this.audioUrl) {
            if (!this.audioInstance || this.audioInstance.src !== this.audioUrl) {
                this.reloadAudio();
            }
            if (this.audioInstance) {
                this.audioInstance.currentTime = 0;
                this.audioInstance.play().catch(e => console.error(`Audio error: ${e}`));
            }
        }

        if (this.destroyOnClick && this.gameObject && this.gameObject.scene) {
            const removeObject = storeActions.removeObject;
            removeObject(this.gameObject);
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