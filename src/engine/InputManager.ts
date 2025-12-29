export default class InputManager {
    public keys: Record<string, boolean> = {};
    public mouse: Record<number, boolean> = {};
    public mouseX: number = 0;
    public mouseY: number = 0;

    public onMouseDown: ((e: MouseEvent) => void) | null = null;
    public onMouseUp: ((e: MouseEvent) => void) | null = null;

    // Magazyn na listenery, żeby móc je potem usunąć
    private handlers: { target: EventTarget, type: string, fn: any }[] = [];

    constructor(canvas: HTMLCanvasElement) {
        // Klawiatura (Globalnie)
        this.addEvent(window, "keydown", (e: KeyboardEvent) => {
            if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
            this.keys[e.code] = true;
        });

        this.addEvent(window, "keyup", (e: KeyboardEvent) => {
            this.keys[e.code] = false;
        });

        // Myszka (Na Canvasie)
        this.addEvent(canvas, "mousedown", (e: MouseEvent) => {
            this.mouse[e.button] = true;
            if (e.button === 2) {
                canvas.requestPointerLock();
            }
            if (this.onMouseDown) this.onMouseDown(e);
        });

        this.addEvent(canvas, "mouseup", (e: MouseEvent) => {
            this.mouse[e.button] = false;
            if (e.button === 2) {
                document.exitPointerLock();
            }
            if (this.onMouseUp) this.onMouseUp(e);
        });

        this.addEvent(canvas, "mousemove", (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });

        // Blokada menu kontekstowego
        this.addEvent(canvas, "contextmenu", (e: Event) => e.preventDefault());
    }

    // Pomocnicza funkcja do rejestrowania zdarzeń
    private addEvent(target: EventTarget, type: string, fn: any) {
        target.addEventListener(type, fn);
        this.handlers.push({ target, type, fn });
    }

    public isKeyDown(code: string) {
        return !!this.keys[code];
    }

    // TĘ METODĘ WYWOŁUJE ENGINE PRZY ZAMYKANIU
    public destroy() {
        console.log("InputManager: czyszczenie listenerów...");
        this.handlers.forEach(({ target, type, fn }) => {
            target.removeEventListener(type, fn);
        });
        // Czyścimy tablice
        this.handlers = [];
        this.keys = {};
        this.mouse = {};
    }
}