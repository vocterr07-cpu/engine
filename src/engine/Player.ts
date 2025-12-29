import { cross } from "../math";
import type GameObject from "./GameObject";
import type InputManager from "./InputManager";
import { state } from "./store";
import TouchEventComponent from "./TouchEventComponent";

export default class Player {
    public eventDebounce: number = 30;
    public position: [number, number, number] = [0, 0, 0];
    public velocity: [number, number, number] = [0, 0, 0];

    // Konfiguracja (Properties) - to będziesz mógł łatwo edytować w UI
    public speedMultiplier: number = 1;
    public speed: number = 0.01;
    public jumpForceMultiplier: number = 1;
    public jumpForce: number = 0.003;
    public gravity: number = 0.00002;
    public height: number = 0.1; // Wysokość oczu od ziemi
    public width: number = 0.5;  // Promień kolizji (grubość gracza)

    private isGrounded: boolean = false;

    public currentCollision: GameObject | null = null;

    constructor(startPos: [number, number, number] = [0, 5, 0]) {
        this.position = startPos;
    }

    public update(input: InputManager, cameraYaw: number) {
        this.eventDebounce--;
        if (this.eventDebounce < 0) this.eventDebounce = 30;
        this.currentCollision = null;
        let dx = 0;
        let dz = 0;

        // Obliczamy wektory przód/prawo na podstawie YAW kamery (tylko w poziomie)
        const rYaw = (cameraYaw * Math.PI) / 180;
        const forwardX = Math.cos(rYaw);
        const forwardZ = Math.sin(rYaw);
        const right = cross([forwardX, 0, forwardZ], [0, 1, 0]);
        const finalSpeed = this.speed * this.speedMultiplier;
        const finalJumpPower = this.jumpForce * this.jumpForceMultiplier;
        if (input.isKeyDown("KeyW")) {
            dx += forwardX * finalSpeed;
            dz += forwardZ * finalSpeed;
        }
        if (input.isKeyDown("KeyS")) {
            dx -= forwardX * finalSpeed;
            dz -= forwardZ * finalSpeed;
        }
        if (input.isKeyDown("KeyD")) {
            dx += right[0] * finalSpeed;
            dz += right[2] * finalSpeed;
        }
        if (input.isKeyDown("KeyA")) {
            dx -= right[0] * finalSpeed;
            dz -= right[2] * finalSpeed;
        }

        // Normalizacja, żeby chodzenie na skos nie było szybsze
        if (dx !== 0 || dz !== 0) {
            // Prosta normalizacja wektora 2D, jeśli chcesz super precyzji
            // Ale przy stałym speed powyższe dodawanie jest ok dla prostego ruchu
        }

        // 2. Skok
        if (input.isKeyDown("Space") && this.isGrounded) {
            this.velocity[1] = finalJumpPower;
            this.isGrounded = false;
        }

        // 3. Grawitacja
        this.velocity[1] -= this.gravity;

        // 4. Przewidywana pozycja
        let nextX = this.position[0] + dx;
        let nextY = this.position[1] + this.velocity[1];
        let nextZ = this.position[2] + dz;

        // 5. Kolizje (AABB)
        const objects = state.objects;
        this.isGrounded = false; 

        for (const obj of objects) {
            if (!obj.canCollide) continue;

            // Granice obiektu
            const minX = obj.position[0] - obj.scale[0] / 2;
            const maxX = obj.position[0] + obj.scale[0] / 2;
            const minY = obj.position[1] - obj.scale[1] / 2;
            const maxY = obj.position[1] + obj.scale[1] / 2;
            const minZ = obj.position[2] - obj.scale[2] / 2;
            const maxZ = obj.position[2] + obj.scale[2] / 2;

            // Granice gracza (Player Box)
            // position to stopy, więc box idzie od position[1] do position[1] + height
            const pMinX = nextX - this.width;
            const pMaxX = nextX + this.width;
            const pMinY = nextY; 
            const pMaxY = nextY + this.height;
            const pMinZ = nextZ - this.width;
            const pMaxZ = nextZ + this.width;

            const collisionX = pMinX <= maxX && pMaxX >= minX;
            const collisionY = pMinY <= maxY && pMaxY >= minY;
            const collisionZ = pMinZ <= maxZ && pMaxZ >= minZ;

            if (collisionX && collisionZ && collisionY) {
                this.currentCollision = obj;
                if (this.eventDebounce <= 0) {
                    this.triggerTouchEvent(obj);
                }
                const prevY = this.position[1];
                
                // Jeśli byliśmy wyżej niż obiekt + mały margines
                if (prevY >= maxY - this.gravity * 2 && this.velocity[1] < 0) {
                    nextY = maxY; // Stajemy na obiekcie
                    this.velocity[1] = 0;
                    this.isGrounded = true;
                } else {
                    // Tutaj można dodać blokowanie ścian (cofnięcie nextX/nextZ)
                    // Na razie prosta wersja - nie wpadamy do środka
                }
            }
        }

        // 6. Reset przy spadaniu w otchłań
        if (nextY < -20) {
            nextY = 10;
            this.velocity[1] = 0;
        }

        // Aktualizacja pozycji
        this.position = [nextX, nextY, nextZ];
    }

    private triggerTouchEvent(obj: GameObject) {
        const eventComponent = obj.components.find(c => c instanceof TouchEventComponent);
        if (eventComponent) {
            eventComponent.onTrigger();
        }
    }
}