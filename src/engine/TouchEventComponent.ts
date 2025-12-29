import Component from "./Component";

export default class TouchEventComponent extends Component {
    // Sekcja wizualna
    public changeColor: boolean = false;
    public targetColor: [number, number, number] = [1, 1, 0];
    public originalColor: [number, number, number] = [1, 1, 1];

    // Sekcja Audio
    public playAudio: boolean = false;
    public audioUrl: string = "";
    public repeatAudio: boolean = false;
    public repeatInterval: number = 1.0; // Domyślnie co 1 sekundę
    
    // Prywatne pola do logiki
    private audioInstance: HTMLAudioElement | null = null;
    private alreadyPlayedAudio: boolean = false;
    private lastTriggerTime: number = 0; // Czas ostatniego odtworzenia

    public changePlayerSpeed: boolean = false;
    public speedMultiplier: number = 1;

    public changePlayerJumpForce: boolean = false;
    public jumpForceMultiplier: number = 1;

    public teleportPlayer: boolean = false;
    public teleportPosition: [number, number, number] = [2,2,2];

    public onTrigger() {
        // 1. Zmiana koloru
        if (this.changeColor && this.gameObject && this.gameObject.scene) {
            // Zabezpieczenie: zapisz oryginał tylko raz
            if (this.gameObject.color[0] !== this.targetColor[0]) { 
                 this.originalColor = [...this.gameObject.color];
            }
            this.gameObject.color = this.targetColor;
        }

        // 2. Obsługa Audio
        if (this.playAudio && this.audioUrl) {
            // Inicjalizacja instancji audio (tylko raz)
            if (!this.audioInstance || this.audioInstance.src !== this.audioUrl) {
                this.audioInstance = new Audio(this.audioUrl);
            }

            const now = performance.now(); // Pobieramy aktualny czas w ms

            // --- SCENARIUSZ A: Powtarzanie co X sekund ---
            if (this.repeatAudio) {
                // Sprawdzamy czy minął interwał (zamieniamy sekundy na milisekundy)
                if (now - this.lastTriggerTime >= this.repeatInterval * 1000) {
                    this.playAudioInstance();
                    this.lastTriggerTime = now;
                }
            } 
            // --- SCENARIUSZ B: Odtwórz tylko raz ---
            else if (!this.alreadyPlayedAudio) {
                this.playAudioInstance();
                this.alreadyPlayedAudio = true;
            }
        }
        const player = this.gameObject?.scene?.engine.getPlayer();
        
        if (this.changePlayerSpeed && player) {
            player.speedMultiplier = this.speedMultiplier;
        }
        if (this.changePlayerJumpForce && player) {
            player.jumpForceMultiplier = this.jumpForceMultiplier;
        }
    }

    // Helper do czystego odtwarzania
    private playAudioInstance() {
        if (this.audioInstance) {
            this.audioInstance.currentTime = 0; // Przewiń na start
            this.audioInstance.play().catch(e => console.warn("Audio blocked:", e));
        }
    }
    
    // Opcjonalnie: Resetowanie stanu gdy gracz odejdzie (jeśli potrzebujesz)
    public onLeave() {
        if (this.changeColor && this.gameObject) {
            this.gameObject.color = this.originalColor;
        }
        // Jeśli chcesz, żeby po odejściu i powrocie dźwięk "Play Once" znowu zadziałał:
        // this.alreadyPlayedAudio = false; 
    }
}