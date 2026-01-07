import { cross, Mat4, normalize, sub, intersectRayAABB, intersectRayPlane } from "../math"; 
import type Engine from "./Engine";
import type InputManager from "./InputManager";
import type GameObject from "./GameObject";
import { state, storeActions } from "./store";
import Terrain from "./Terrain";

export default class Camera {
    private input: InputManager;
    private canvas: HTMLCanvasElement;
    private engine: Engine;
    public yaw: number = -90;
    public pitch: number = 0;
    public position: [number, number, number] = [0, 5, 10]; // Wyżej żeby widzieć teren

    public front: [number, number, number] = [0, 0, -1];
    public right: [number, number, number] = [1, 0, 0];
    public up: [number, number, number] = [0, 1, 0];

    public viewMatrix: Float32Array = Mat4.identity();
    public projMatrix: Float32Array = Mat4.identity();

    private handlers: { target: EventTarget, type: string, fn: any }[] = [];

    constructor(canvas: HTMLCanvasElement, input: InputManager, engine: Engine) {
        this.canvas = canvas;
        this.input = input;
        this.engine = engine;
        this.setupDOMListeners();
    }

    private setupDOMListeners() {
        // 1. CIĄGŁA OBSŁUGA MYSZKI (Ruch + Trzymanie przycisku)
        const handleMouseMove = (e: MouseEvent) => {
            // Obracanie kamerą (PPM)
            if (this.input.mouse[2]) { 
                const speed = 0.1;
                this.yaw += e.movementX * speed;
                this.pitch -= e.movementY * speed;
                if (this.pitch > 89) this.pitch = 89;
                if (this.pitch < -89) this.pitch = -89;
            }

        
            if (this.input.mouse[0]) {
                if (state.editMode === "sculpt" || state.editMode === "paint") {
                    this.performTerrainTool(e.clientX, e.clientY);
                }
            }
        };

        // 2. KLIKNIĘCIE (Mousedown)
        const handleMouseDown = (e: MouseEvent) => {
            if (e.button !== 0) return; // Tylko LPM

            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Jeśli tryb to MOVE/ROTATE -> Zaznaczamy obiekty
            if (state.editMode === "move" || state.editMode === "rotate") {
                const ray = this.getRay(mouseX, mouseY);
                this.handleEditorClick(ray);
            } 
            // Jeśli tryb to SCULPT/PAINT -> Rzeźbimy (pojedyncze kliknięcie)
            else if (state.editMode === "sculpt" || state.editMode === "paint") {
                this.performTerrainTool(e.clientX, e.clientY);
            }
        };

        this.addEvent(this.canvas, "mousemove", handleMouseMove);
        this.addEvent(this.canvas, "mousedown", handleMouseDown);
    }

    // --- LOGIKA NARZĘDZI TERENU ---
    // Camera.ts -> performTerrainTool

private performTerrainTool(screenX: number, screenY: number) {
    const terrain = state.objects.find(obj => obj instanceof Terrain) as Terrain;
    if (!terrain) return;

    const rect = this.canvas.getBoundingClientRect();
    const ray = this.getRay(screenX - rect.left, screenY - rect.top);

    // --- ZMIANA 1: Używamy nowej, dokładnej metody raycast z Terrain ---
    const hit = terrain.raycast(ray.rayOrigin, ray.rayDir); 

    if (hit) {
        // Używamy precyzyjnych współrzędnych z heightmapy
        const hitX = hit.x;
        const hitZ = hit.z;

        // Pobieramy ustawienia (z store.ts)
        // Jeśli nie masz store.terrainSettings, użyj tymczasowych zmiennych
        const radius =  3.0;
        const strength = 0.5;
        
        if (state.editMode === "sculpt") {
            const isLowering = this.input.isKeyDown("ShiftLeft");
            terrain.sculpt(hitX, hitZ, radius, strength, isLowering);
        } 
        else if (state.editMode === "paint") {
            // --- ZMIANA 2: Pobieramy wybraną warstwę ---
            // Domyślnie malujemy warstwą 1 (tą którą ustawiliśmy w AssetBrowser)
            const layer =  state.terrainSettings.selectedLayer
            
            terrain.paint(hitX, hitZ, radius, strength, layer);
        }
    }
}

    private addEvent(target: EventTarget, type: string, fn: any) {
        target.addEventListener(type, fn);
        this.handlers.push({ target, type, fn });
    }

    // ... (Reszta metod: getRay, handleEditorClick, moveCamera, rotateCamera... bez zmian) ...
    
    public getRay(canvasX: number, canvasY: number) {
        const rect = this.canvas.getBoundingClientRect();
        let x = (canvasX / rect.width) * 2 - 1;
        let y = -(canvasY / rect.height) * 2 + 1;
        if (document.pointerLockElement) { x = 0; y = 0; }
        const invProj = Mat4.invert(this.projMatrix);
        const invView = Mat4.invert(this.viewMatrix);
        const coords = [x, y, 1, 1];
        let eye = [
            invProj[0] * coords[0] + invProj[4] * coords[1] + invProj[8] * coords[2] + invProj[12] * coords[3],
            invProj[1] * coords[0] + invProj[5] * coords[1] + invProj[9] * coords[2] + invProj[13] * coords[3],
            invProj[2] * coords[0] + invProj[6] * coords[1] + invProj[10] * coords[2] + invProj[14] * coords[3],
            invProj[3] * coords[0] + invProj[7] * coords[1] + invProj[11] * coords[2] + invProj[15] * coords[3]
        ];
        if (Math.abs(eye[3]) > 0.00001) { eye = [eye[0]/eye[3], eye[1]/eye[3], eye[2]/eye[3], 1]; }
        const worldPoint: [number, number, number] = [
            invView[0]*eye[0] + invView[4]*eye[1] + invView[8]*eye[2] + invView[12]*eye[3],
            invView[1]*eye[0] + invView[5]*eye[1] + invView[9]*eye[2] + invView[13]*eye[3],
            invView[2]*eye[0] + invView[6]*eye[1] + invView[10]*eye[2] + invView[14]*eye[3],
        ];
        const rayOrigin = this.position;
        const rayDir = normalize(sub(worldPoint, rayOrigin));
        return { rayOrigin, rayDir };
    }

    // Camera.ts

public handleEditorClick(ray: { rayOrigin: any, rayDir: any }) {
    if (!ray) return;
    
    const objects = state.objects;
    let closest = Infinity;
    let hitObject: GameObject | null = null;

    objects.forEach((obj) => {
        let t: number | null = null;

        // --- PRZYPADEK 1: TEREN (Precyzyjny Raycast po Heightmapie) ---
        if (obj instanceof Terrain) {
            // Używamy tej samej metody co przy rzeźbieniu
            const hit = obj.raycast(ray.rayOrigin, ray.rayDir);
            
            if (hit) {
                // intersectRayAABB zwraca dystans 't', więc tutaj też musimy go policzyć
                // t = dystans między kamerą a punktem trafienia
                const dx = hit.x - ray.rayOrigin[0];
                const dy = hit.y - ray.rayOrigin[1];
                const dz = hit.z - ray.rayOrigin[2];
                
                // Pitagoras w 3D
                t = Math.sqrt(dx*dx + dy*dy + dz*dz);
            }
        } 
        // --- PRZYPADEK 2: ZWYKŁY OBIEKT (Szybkie AABB) ---
        else {
            const halfX = 0.5 * obj.scale[0];
            const halfY = 0.5 * obj.scale[1];
            const halfZ = 0.5 * obj.scale[2];

            const min = [
                obj.position[0] - halfX,
                obj.position[1] - halfY,
                obj.position[2] - halfZ
            ];
            const max = [
                obj.position[0] + halfX,
                obj.position[1] + halfY,
                obj.position[2] + halfZ
            ];

            t = intersectRayAABB(ray.rayOrigin, ray.rayDir, min, max);
        }

        // Standardowe sprawdzanie, co jest najbliżej kamery
        if (t !== null && t < closest) {
            closest = t;
            hitObject = obj;
        }
    });

    storeActions.setSelectedObject(hitObject);
}

    private moveCamera() {
        if (!document.pointerLockElement) return;
        let moveDir: [number, number, number] = [0, 0, 0];
        const speed = 0.1;
        if (this.input.isKeyDown("KeyW")) { moveDir[0] += this.front[0]; moveDir[1] += this.front[1]; moveDir[2] += this.front[2]; }
        if (this.input.isKeyDown("KeyS")) { moveDir[0] -= this.front[0]; moveDir[1] -= this.front[1]; moveDir[2] -= this.front[2]; }
        if (this.input.isKeyDown("KeyD")) { moveDir[0] += this.right[0]; moveDir[2] += this.right[2]; }
        if (this.input.isKeyDown("KeyA")) { moveDir[0] -= this.right[0]; moveDir[2] -= this.right[2]; }
        if (moveDir[0] !== 0 || moveDir[1] !== 0 || moveDir[2] !== 0) {
             moveDir = normalize(moveDir);
             this.position[0] += moveDir[0] * speed;
             this.position[1] += moveDir[1] * speed;
             this.position[2] += moveDir[2] * speed;
        }
    }

    public rotateCamera() {
        const rYaw = this.yaw * Math.PI / 180;
        const rPitch = this.pitch * Math.PI / 180;
        const front: [number, number, number] = normalize([
            Math.cos(rYaw) * Math.cos(rPitch), Math.sin(rPitch), Math.sin(rYaw) * Math.cos(rPitch)
        ]);
        const right = normalize(cross(front, this.up));
        this.front = front;
        this.right = right;
    }

    private followPlayer() {
        const player = this.engine.getPlayer();
        if (player) {
            this.position[0] = player.position[0];
            this.position[1] = player.position[1] + player.height;
            this.position[2] = player.position[2];
        }
    }

    public update() {
        this.rotateCamera();
        if (state.mode === "player") this.followPlayer();
        else this.moveCamera();
        const target: [number, number, number] = [this.position[0] + this.front[0], this.position[1] + this.front[1], this.position[2] + this.front[2]];
        this.viewMatrix = Mat4.lookAt(this.position, target, [0, 1, 0]);
        this.projMatrix = Mat4.perspective(Math.PI / 4, this.canvas.width / this.canvas.height, 0.1, 100);
    }

    public destroy() {
        this.handlers.forEach(({ target, type, fn }) => target.removeEventListener(type, fn));
        this.handlers = [];
    }
}