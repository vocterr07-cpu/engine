import Component from "./Component";
import type Mesh from "./Mesh";
import { createParticleQuad } from "./primitives"; // Zakładam, że to masz
import { state } from "./store";
import Texture from "./Texture"; // Zakładam, że to masz

// 1. Definicja Cząsteczki: To jest po prostu kontener na dane
interface Particle {
    pos: [number, number, number]; // Gdzie jestem?
    vel: [number, number, number]; // Gdzie lecę? (Wektor ruchu)
    life: number;                  // Ile mam jeszcze życia? (1.0 = nówka, 0.0 = trup)
    size: number;                  // Jak duża jestem?
    color: [number, number, number]; // Mój kolor
}

export default class ParticleSystem extends Component {
    // Tablica żywych cząsteczek. Jak cząsteczka umiera, usuwamy ją stąd.
    private particles: Particle[] = [];

    // Siatka (Mesh) - to po prostu kwadrat (2 trójkąty), na który nałożymy teksturę
    private mesh: Mesh;

    // Tekstura - obrazek (dym, ogień, kółko)
    public texture: Texture | null = null;

    // --- USTAWIENIA (To możesz zmieniać suwakami) ---

    public startSize: number = 0.5;
    public startColor: [number, number, number] = [1.0, 1.0, 1.0];
    public maxParticles: number = 1000;
    public spread: number = 0.1;

    public lifetime: number = 1.0;

    public useGravity: boolean = false;
    public gravityForce: [number, number, number] = [0, 0.001, 0];

    public useVelocity: boolean = false;
    public velocity: [number, number, number] = [0.05, 0.05, 0.05];


    constructor(gl: WebGL2RenderingContext) {
        super("ParticleSystem");
        // Tworzymy jeden wspólny kwadrat dla wszystkich cząsteczek
        this.mesh = createParticleQuad(gl);
    }

    // Ładowanie obrazka (PNG/JPG)
    public loadTexture(gl: WebGL2RenderingContext, url: string) {
        this.texture = new Texture(gl, url);
    }

    // --- LOGIKA 1: RODZENIE SIĘ (Spawn) ---
    // Dodaje nową cząsteczkę do tablicy
    public spawnParticle(origin: [number, number, number]) {
        if (this.particles.length >= this.maxParticles) return;

        // Prosta losowość prędkości (żeby nie leciały w linię jak laser)
        const randomX = (Math.random() - 0.5) * this.spread; // Losowo w lewo/prawo
        const randomY = (Math.random() * this.spread);       // Losowo w górę
        const randomZ = (Math.random() - 0.5) * this.spread; // Losowo w przód/tył
        const velocityX = this.velocity[0] * this.spread * Math.random();
        const velocityY =  this.velocity[1] * this.spread  * Math.random();
        const velocityZ = this.velocity[2] * this.spread  * Math.random()

        const p: Particle = {
            pos: [origin[0], origin[1], origin[2]], // Startujemy w pozycji emitera
            vel: this.useVelocity ? [velocityX, velocityY, velocityZ] : [randomX, randomY, randomZ],       // Nadajemy prędkość startową
            life: 1.0,                              // Pełne życie na start
            size: this.startSize,
            color: [...this.startColor]             // Kopiujemy kolor startowy
        };

        this.particles.push(p);
    }

    // --- LOGIKA 2: AKTUALIZACJA (Update) ---
    // To wykonuje się co klatkę (np. 60 razy na sekundę)
    public update() {
        const dt = state.deltaTime;
        if (dt === 0) return;
        const emitterPos = this.gameObject?.position || [0, 0, 0];
        this.spawnParticle(emitterPos);
        this.spawnParticle(emitterPos);

        const lifeDecay = dt / this.lifetime;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

                p.pos[0] += p.vel[0];
                p.pos[1] += p.vel[1];
                p.pos[2] += p.vel[2];



            if (this.useGravity) {
                p.vel[0] += this.gravityForce[0];
                p.vel[1] += this.gravityForce[1];
                p.vel[2] += this.gravityForce[2];
            }

            // 3. STARZENIE SIĘ: Odejmujemy trochę życia
            p.life -= lifeDecay; // Cząsteczka żyje ok. 100 klatek (1.0 / 0.01)

            // 4. ŚMIERĆ: Jeśli życie spadło do zera -> usuwamy
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    // --- LOGIKA 3: RYSOWANIE (Render) ---
    public render(gl: WebGL2RenderingContext, locs: any) {
        if (this.particles.length === 0) return;

        this.mesh.bind();

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.depthMask(false);

        // Podpinamy teksturę jeśli istnieje
        if (this.texture) {
            this.texture.bind(0);
            gl.uniform1i(locs.useTexture, 1);
            gl.uniform1i(locs.texture, 0);
        } else {
            gl.uniform1i(locs.useTexture, 0);
        }

        // Rysujemy każdą cząsteczkę
        for (const p of this.particles) {
            // Trik wizualny: Cząsteczka znika (fade out) pod koniec życia
            // Mnożymy alpha/jasność przez p.life
            const alpha = p.life;

            // Tworzymy macierz modelu (Pozycja + Skala)
            const model = new Float32Array([
                p.size, 0, 0, 0,
                0, p.size, 0, 0,
                0, 0, p.size, 0,
                p.pos[0], p.pos[1], p.pos[2], 1
            ]);

            gl.uniformMatrix4fv(locs.model, false, model);

            // Przesyłamy kolor przyciemniony przez 'life'
            gl.uniform3fv(locs.color, [
                p.color[0] * alpha,
                p.color[1] * alpha,
                p.color[2] * alpha
            ]);

            // Rysuj kwadrat (2 trójkąty, 6 wierzchołków indeksowanych)
            gl.drawElements(gl.TRIANGLES, this.mesh.indexCount, gl.UNSIGNED_INT, 0);
        }

        // Sprzątanie po sobie
        gl.depthMask(true);
        gl.disable(gl.BLEND);
    }
}