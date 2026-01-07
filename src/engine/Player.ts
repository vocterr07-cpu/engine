import { cross, sub } from "../math";
import type GameObject from "./GameObject";
import type InputManager from "./InputManager";
import { state } from "./store";
import TouchEventComponent from "./TouchEventComponent";
import Terrain from "./Terrain"; // Importujemy klasę Terenu

export default class Player {
    public eventDebounce: number = 30;
    public position: [number, number, number] = [0, 5, 0];
    public velocity: [number, number, number] = [0, 0, 0];

    public speedMultiplier: number = 1;
    public speed: number = 0.15; // Prędkość chodzenia
    public jumpForce: number = 0.05; // Siła skoku
    public gravity: number = 0.0007; // Siła grawitacji
    public height: number = 1.8;   // Wysokość gracza (oczy/kolizja)
    public width: number = 0.4;    // Promień kolizji

    private isGrounded: boolean = false;

    public update(input: InputManager, cameraYaw: number) {
        this.eventDebounce--;
        
        let moveX = 0;
        let moveZ = 0;

        // 1. Kierunki ruchu
        const rYaw = (cameraYaw * Math.PI) / 180;
        const forwardX = Math.cos(rYaw);
        const forwardZ = Math.sin(rYaw);
        const rightX = -forwardZ; // Cross product up [0,1,0] uproszczony
        const rightZ = forwardX;

        const finalSpeed = this.speed * this.speedMultiplier;

        if (input.isKeyDown("KeyW")) { moveX += forwardX; moveZ += forwardZ; }
        if (input.isKeyDown("KeyS")) { moveX -= forwardX; moveZ -= forwardZ; }
        if (input.isKeyDown("KeyD")) { moveX += rightX; moveZ += rightZ; }
        if (input.isKeyDown("KeyA")) { moveX -= rightX; moveZ -= rightZ; }

        // Normalizacja ruchu
        const mag = Math.sqrt(moveX * moveX + moveZ * moveZ);
        if (mag > 0) {
            moveX = (moveX / mag) * finalSpeed;
            moveZ = (moveZ / mag) * finalSpeed;
        }

        // 2. Skok
        if (input.isKeyDown("Space") && this.isGrounded) {
            this.velocity[1] = this.jumpForce;
            this.isGrounded = false;
        }

        // 3. Grawitacja
        this.velocity[1] -= this.gravity;

        // 4. Obsługa Terenu (Wysokość pod stopami)
        const terrain = state.objects.find(obj => obj instanceof Terrain) as Terrain;
        let terrainHeight = -100;

        if (terrain) {
            terrainHeight = this.getTerrainHeight(this.position[0], this.position[2], terrain);
        }

        // 5. Przewidywanie nowej pozycji
        let nextX = this.position[0] + moveX;
        let nextY = this.position[1] + this.velocity[1];
        let nextZ = this.position[2] + moveZ;

        // 6. Kolizje z obiektami (AABB)
        // Sprawdzamy X i Z osobno, aby umożliwić ślizganie się po ścianach
        for (const obj of state.objects) {
            if (!obj.canCollide || obj instanceof Terrain) continue;

            const bounds = this.getObjectBounds(obj);
            
            // Kolizja pozioma (X i Z)
            if (this.checkAABB(nextX, this.position[1], nextZ, bounds)) {
                // Próba ślizgania: sprawdź czy sam X przechodzi
                if (!this.checkAABB(nextX, this.position[1], this.position[2], bounds)) {
                    nextZ = this.position[2];
                } 
                // Próba ślizgania: sprawdź czy sam Z przechodzi
                else if (!this.checkAABB(this.position[0], this.position[1], nextZ, bounds)) {
                    nextX = this.position[0];
                } else {
                    nextX = this.position[0];
                    nextZ = this.position[2];
                }
                this.triggerTouchEvent(obj);
            }
        }

        // 7. Finalizacja wysokości (Teren + Obiekty)
        this.isGrounded = false;

        // Blokada podłogi terenu
        if (nextY <= terrainHeight) {
            nextY = terrainHeight;
            this.velocity[1] = 0;
            this.isGrounded = true;
        }

        // Blokada stania na obiektach (AABB)
        for (const obj of state.objects) {
            if (!obj.canCollide || obj instanceof Terrain) continue;
            const bounds = this.getObjectBounds(obj);
            
            if (this.checkAABB(nextX, nextY, nextZ, bounds)) {
                // Jeśli gracz spada i jest nad obiektem -> wyląduj
                if (this.position[1] >= bounds.maxY - 0.1 && this.velocity[1] <= 0) {
                    nextY = bounds.maxY;
                    this.velocity[1] = 0;
                    this.isGrounded = true;
                }
            }
        }

        // 8. OOB Reset
        if (nextY < -30) {
            nextX = 0; nextY = 20; nextZ = 0;
            this.velocity[1] = 0;
        }

        this.position = [nextX, nextY, nextZ];
    }

    // Pobiera wysokość terenu w dowolnym punkcie świata (Interpolacja Biliniowa)
    private getTerrainHeight(worldX: number, worldZ: number, terrain: Terrain): number {
        const offset = (terrain.gridSize * terrain.cellSize) / 2;
        const lx = (worldX + offset) / terrain.cellSize;
        const lz = (worldZ + offset) / terrain.cellSize;

        const x0 = Math.floor(lx);
        const z0 = Math.floor(lz);
        const x1 = x0 + 1;
        const z1 = z0 + 1;

        if (x0 < 0 || x1 > terrain.gridSize || z0 < 0 || z1 > terrain.gridSize) return -100;

        // Pobieramy 4 sąsiednie punkty wysokości
        const h00 = terrain.heightMap[x0 + z0 * (terrain.gridSize + 1)];
        const h10 = terrain.heightMap[x1 + z0 * (terrain.gridSize + 1)];
        const h01 = terrain.heightMap[x0 + z1 * (terrain.gridSize + 1)];
        const h11 = terrain.heightMap[x1 + z1 * (terrain.gridSize + 1)];

        // Interpolacja
        const tx = lx - x0;
        const tz = lz - z0;
        const h0 = h00 * (1 - tx) + h10 * tx;
        const h1 = h01 * (1 - tx) + h11 * tx;

        return h0 * (1 - tz) + h1 * tz;
    }

    private getObjectBounds(obj: GameObject) {
        return {
            minX: obj.position[0] - obj.scale[0] / 2,
            maxX: obj.position[0] + obj.scale[0] / 2,
            minY: obj.position[1] - obj.scale[1] / 2,
            maxY: obj.position[1] + obj.scale[1] / 2,
            minZ: obj.position[2] - obj.scale[2] / 2,
            maxZ: obj.position[2] + obj.scale[2] / 2,
        };
    }

    private checkAABB(px: number, py: number, pz: number, b: any): boolean {
        return (px + this.width >= b.minX && px - this.width <= b.maxX) &&
               (py + this.height >= b.minY && py <= b.maxY) &&
               (pz + this.width >= b.minZ && pz - this.width <= b.maxZ);
    }

    private triggerTouchEvent(obj: GameObject) {
        if (this.eventDebounce > 0) return;
        const eventComponent = obj.components.find(c => c instanceof TouchEventComponent);
        if (eventComponent) {
            (eventComponent as TouchEventComponent).onTrigger();
            this.eventDebounce = 30;
        }
    }
}