import { cross, Mat4, normalize, sub, dot, intersectRayAABB } from "../math"; // Upewnij się, że importy pasują do Twojego math.ts
import type Engine from "./Engine";
import type InputManager from "./InputManager";
import type GameObject from "./GameObject";
import { state, storeActions } from "./store";

export default class Camera {
    private input: InputManager;
    private canvas: HTMLCanvasElement;
    private engine: Engine;
    public yaw: number = -90;
    public pitch: number = 0;
    public position: [number, number, number] = [0, 3, 3];

    public front: [number, number, number] = [0, 0, -1];
    public right: [number, number, number] = [1, 0, 0];
    public up: [number, number, number] = [0, 1, 0];

    public viewMatrix: Float32Array = Mat4.identity();
    public projMatrix: Float32Array = Mat4.identity();

    // Tutaj też trzymamy listenery do usunięcia
    private handlers: { target: EventTarget, type: string, fn: any }[] = [];

    constructor(canvas: HTMLCanvasElement, input: InputManager, engine: Engine) {
        this.canvas = canvas;
        this.input = input;
        this.engine = engine;

        this.setupDOMListeners();
    }

    private setupDOMListeners() {
        // Mouse Move dla Kamery
        const handleMouseMove = (e: MouseEvent) => {
            if (this.input.mouse[2]) { // Prawy przycisk myszy
                const speed = 0.1;
                this.yaw += e.movementX * speed;
                this.pitch -= e.movementY * speed;
                if (this.pitch > 89) this.pitch = 89;
                if (this.pitch < -89) this.pitch = -89;
            }
        };

        // Click (Raycast)
        const handleClick = (e: MouseEvent) => {
            // Ignoruj jeśli trzymamy PPM lub PointerLock
            if (this.input.mouse[2] || document.pointerLockElement || e.button === 2) return;

            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const ray = this.getRay(mouseX, mouseY);
            this.handleEditorClick(ray);
        };

        this.addEvent(this.canvas, "mousemove", handleMouseMove);
        this.addEvent(this.canvas, "click", handleClick);
    }

    private addEvent(target: EventTarget, type: string, fn: any) {
        target.addEventListener(type, fn);
        this.handlers.push({ target, type, fn });
    }

    // ... (Tu wklej metodę getRay i handleEditorClick z poprzednich wersji, one się nie zmieniają) ...
    // DLA PEWNOŚCI WKLEJAM getRay i handleEditorClick:
    
    public getRay(canvasX: number, canvasY: number) {
        const rect = this.canvas.getBoundingClientRect();
        let x = (canvasX / rect.width) * 2 - 1;
        let y = -(canvasY / rect.height) * 2 + 1;
        if (document.pointerLockElement) {
            x = 0;
            y = 0;
        }
        

        const invProj = Mat4.invert(this.projMatrix);
        const invView = Mat4.invert(this.viewMatrix);

        const coords = [x, y, 1, 1];
        let eye = [
            invProj[0] * coords[0] + invProj[4] * coords[1] + invProj[8] * coords[2] + invProj[12] * coords[3],
            invProj[1] * coords[0] + invProj[5] * coords[1] + invProj[9] * coords[2] + invProj[13] * coords[3],
            invProj[2] * coords[0] + invProj[6] * coords[1] + invProj[10] * coords[2] + invProj[14] * coords[3],
            invProj[3] * coords[0] + invProj[7] * coords[1] + invProj[11] * coords[2] + invProj[15] * coords[3]
        ];
        if (Math.abs(eye[3]) > 0.00001) {
             eye = [eye[0] / eye[3], eye[1] / eye[3], eye[2] / eye[3], 1];
        }

        const worldPoint: [number, number, number] = [
            invView[0] * eye[0] + invView[4] * eye[1] + invView[8] * eye[2] + invView[12] * eye[3],
            invView[1] * eye[0] + invView[5] * eye[1] + invView[9] * eye[2] + invView[13] * eye[3],
            invView[2] * eye[0] + invView[6] * eye[1] + invView[10] * eye[2] + invView[14] * eye[3],
        ];

        const rayOrigin = this.position;
        const rayDir = normalize(sub(worldPoint, rayOrigin));

        return { rayOrigin, rayDir };
    }

    public handleEditorClick(ray: { rayOrigin: any, rayDir: any }) {
        if (!ray) return;
        
        // 1. Najpierw sprawdź czy kliknęliśmy w Gizmo (jeśli jest Engine podpięty)
        // To zrobimy w InputManager/Engine, ale tu skupmy się na obiektach sceny.

        const objects = state.objects;
        let closest = Infinity;
        let hitObject: GameObject | null = null;

        objects.forEach((obj) => {
            // Obliczamy granice obiektu (AABB)
            // Zakładamy że standardowy cube ma wymiary 1x1x1 (-0.5 do 0.5)
            // Musimy uwzględnić pozycję i skalę obiektu
            
            const min: number[] = [
                obj.position[0] - 0.5 * obj.scale[0],
                obj.position[1] - 0.5 * obj.scale[1],
                obj.position[2] - 0.5 * obj.scale[2]
            ];
            const max: number[] = [
                obj.position[0] + 0.5 * obj.scale[0],
                obj.position[1] + 0.5 * obj.scale[1],
                obj.position[2] + 0.5 * obj.scale[2]
            ];

            // Używamy precyzyjnego testu AABB zamiast sfery
            const t = intersectRayAABB(ray.rayOrigin, ray.rayDir, min, max);

            if (t !== null && t < closest) {
                closest = t;
                hitObject = obj;
            }
        });
        
        // Jeśli nie kliknęliśmy w Gizmo (to sprawdzimy w Engine), to zaznacz obiekt
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
        
        // Zabezpieczenie przed dzieleniem przez zero przy normalizacji
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
            Math.cos(rYaw) * Math.cos(rPitch),
            Math.sin(rPitch),
            Math.sin(rYaw) * Math.cos(rPitch)
        ])
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
        if (this.engine.mode === "player") {
            this.followPlayer()
        } else {
            this.moveCamera();
        }

        const target: [number, number, number] = [
            this.position[0] + this.front[0],
            this.position[1] + this.front[1],
            this.position[2] + this.front[2]
        ]
        this.viewMatrix = Mat4.lookAt(this.position, target, [0, 1, 0]);
        this.projMatrix = Mat4.perspective(Math.PI / 4, this.canvas.width / this.canvas.height, 0.1, 100);
    }

    // SPRZĄTANIE
    public destroy() {
        console.log("Camera: czyszczenie listenerów...");
        this.handlers.forEach(({ target, type, fn }) => {
            target.removeEventListener(type, fn);
        });
        this.handlers = [];
    }
}