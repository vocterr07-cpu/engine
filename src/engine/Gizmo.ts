import GameObject from "./GameObject";
import Engine from "./Engine";
import { createBoxMesh, createTorusMesh } from "./MeshUtils";
import { closestPointLines, intersectRayAABB, sub, intersectRayPlane, getPointOnRay, toRad } from "../math";
import { state } from "./store";

export default class Gizmo {
    public root: GameObject;
    public engine: Engine;

    // Move handles
    private xAxis: GameObject;
    private yAxis: GameObject;
    private zAxis: GameObject;

    // Rotate handles
    private xRing: GameObject;
    private yRing: GameObject;
    private zRing: GameObject;

    private selectedAxis: 'x' | 'y' | 'z' | 'rx' | 'ry' | 'rz' | null = null;

    private dragOffset: number = 0;
    private dragOrigin: number[] = [0, 0, 0];

    // Rotation state
    private startMouseAngle: number = 0;
    private startObjectRotation: number = 0;
    private currentDeltaDeg: number = 0;

    // UI Element
    private tooltip: HTMLElement;

    constructor(engine: Engine) {
        this.engine = engine;
        const gl = engine.gl;

        // UI Setup
        this.tooltip = document.createElement("div");
        this.tooltip.id = "gizmo-tooltip";
        this.tooltip.style.position = "absolute";
        this.tooltip.style.background = "rgba(0,0,0,0.8)";
        this.tooltip.style.color = "white";
        this.tooltip.style.padding = "4px 8px";
        this.tooltip.style.borderRadius = "4px";
        this.tooltip.style.pointerEvents = "none";
        this.tooltip.style.display = "none";
        this.tooltip.style.fontFamily = "monospace";
        this.tooltip.style.zIndex = "1000";
        document.body.appendChild(this.tooltip);

        // --- ROOT ---
        const dummyMesh = createBoxMesh(gl, 0, 0, 0);
        this.root = new GameObject("GizmoRoot", dummyMesh, [0, 0, 0], [1, 1, 1]);

        // --- MOVE GIZMO (Strzałki) ---
        const axisMesh = createBoxMesh(gl, 1, 0.05, 0.05);

        this.xAxis = new GameObject("GizmoX", axisMesh, [0.5, 0, 0], [1, 1, 1]);
        this.xAxis.color = [1, 0, 0];

        this.yAxis = new GameObject("GizmoY", axisMesh, [0, 0.5, 0], [1, 1, 1]);
        this.yAxis.color = [0, 1, 0];
        this.yAxis.rotation = [0, 0, 90];

        this.zAxis = new GameObject("GizmoZ", axisMesh, [0, 0, 0.5], [1, 1, 1]);
        this.zAxis.color = [0, 0, 1];
        this.zAxis.rotation = [0, -90, 0];

        this.root.addChild(this.xAxis);
        this.root.addChild(this.yAxis);
        this.root.addChild(this.zAxis);

        // --- ROTATE GIZMO (Pierścienie) ---
        // Promień 1.5, grubość 0.02
        const ringMesh = createTorusMesh(gl, 1.5, 0.03, 32, 8);

        this.xRing = new GameObject("RingX", ringMesh, [0, 0, 0], [1, 1, 1]);
        this.xRing.color = [1, 0, 0];
        this.xRing.rotation = [0, 90, 0]; // Obrót żeby stał w osi X

        this.yRing = new GameObject("RingY", ringMesh, [0, 0, 0], [1, 1, 1]);
        this.yRing.color = [0, 1, 0];
        this.yRing.rotation = [90, 0, 0]; // Obrót żeby leżał (oś Y)

        this.zRing = new GameObject("RingZ", ringMesh, [0, 0, 0], [1, 1, 1]);
        this.zRing.color = [0, 0, 1];
        this.zRing.rotation = [0, 0, 0]; // Domyślnie na ekranie (oś Z)

        this.root.addChild(this.xRing);
        this.root.addChild(this.yRing);
        this.root.addChild(this.zRing);
    }

    public update(camera: any) {
        const selectedObject = state.selectedObject;
        if (!selectedObject) {
            this.root.scale = [0, 0, 0];
            this.tooltip.style.display = "none";
            return;
        }
        const moveScale: [number, number, number] = this.engine.editMode === "move" ? [1, 1, 1] : [0, 0, 0];
        const rotateScale: [number, number, number] = this.engine.editMode === "rotate" ? [1, 1, 1] : [0, 0, 0];
        this.xAxis.scale = moveScale;
        this.yAxis.scale = moveScale;
        this.zAxis.scale = moveScale;
        this.xRing.scale = rotateScale;
        this.yRing.scale = rotateScale;
        this.zRing.scale = rotateScale;
        this.root.position = [...selectedObject.position];

        // Stały rozmiar na ekranie
        const dist = Math.sqrt(
            Math.pow(camera.position[0] - this.root.position[0], 2) +
            Math.pow(camera.position[1] - this.root.position[1], 2) +
            Math.pow(camera.position[2] - this.root.position[2], 2)
        );
        const s = dist * 0.15;
        this.root.scale = [s, s, s];

        // Reset kolorów jeśli nic nie trzymamy
        if (!this.selectedAxis) {
            this.xAxis.color = [1, 0, 0]; this.yAxis.color = [0, 1, 0]; this.zAxis.color = [0, 0, 1];
            this.xRing.color = [1, 0, 0]; this.yRing.color = [0, 1, 0]; this.zRing.color = [0, 0, 1];
        }

        this.root.update();
    }

    // Sprawdzamy czy najeżdżamy myszką
    public checkHit(ray: { rayOrigin: [number, number, number], rayDir: [number, number, number] }): boolean {
        if (!state.selectedObject) return false;
        if (this.selectedAxis) return true; // Jeśli już coś trzymamy, ignoruj hover

        const localRayO = sub(ray.rayOrigin, this.root.position);
        const s = this.root.scale[0];
        const scaledRayO = [localRayO[0] / s, localRayO[1] / s, localRayO[2] / s];

        // 1. Sprawdzamy Pierścienie (Priorytet Rotacji)
        // Matematyczne sprawdzenie dystansu od środka na odpowiednich płaszczyznach
        
        if (this.engine.editMode === "rotate") {
            const checkRingHit = (axis: 'x' | 'y' | 'z') => {
            let normal = (axis === 'x') ? [1, 0, 0] : ((axis === 'y') ? [0, 1, 0] : [0, 0, 1]);
            const t = intersectRayPlane(scaledRayO, ray.rayDir, normal, [0, 0, 0]);
            if (t !== null) {
                const hit = getPointOnRay(scaledRayO, ray.rayDir, t);
                const dist = Math.sqrt(hit[0] ** 2 + hit[1] ** 2 + hit[2] ** 2);
                // Promień pierścienia to 1.5. Margines błędu +/- 0.2
                if (dist > 1.3 && dist < 1.7) return true;
            }
            return false;
        };
            if (checkRingHit('x')) { this.hoverObj(this.xRing, [1, 1, 0]); return true; }
            if (checkRingHit('y')) { this.hoverObj(this.yRing, [1, 1, 0]); return true; }
            if (checkRingHit('z')) { this.hoverObj(this.zRing, [1, 1, 0]); return true; }
        } else {
            const thickness = 0.3; 
            if (intersectRayAABB(scaledRayO, ray.rayDir, [0, -thickness, -thickness], [1.1, thickness, thickness])) {
                this.hoverObj(this.xAxis, [1,1,0]); return true;
            }
            if (intersectRayAABB(scaledRayO, ray.rayDir, [-thickness, 0, -thickness], [thickness, 1.1, thickness])) {
                this.hoverObj(this.yAxis, [1,1,0]); return true;
            }
            if (intersectRayAABB(scaledRayO, ray.rayDir, [-thickness, -thickness, 0], [thickness, thickness, 1.1])) {
                this.hoverObj(this.zAxis, [1,1,0]); return true;
            }
        }
        this.resetColors();
        return false;
    }

    private hoverObj(obj: GameObject, col: [number, number, number]) {
        this.resetColors(); // Najpierw czyścimy inne
        obj.color = col;
    }

    private resetColors() {
        this.xAxis.color = [1, 0, 0]; this.yAxis.color = [0, 1, 0]; this.zAxis.color = [0, 0, 1];
        this.xRing.color = [1, 0, 0]; this.yRing.color = [0, 1, 0]; this.zRing.color = [0, 0, 1];
    }

    public onMouseDown(ray: any): boolean {
        if (!this.checkHit(ray)) return false;
        if (this.xAxis.color[0] === 1 && this.xAxis.color[1] === 1) this.selectedAxis = 'x';
        else if (this.yAxis.color[0] === 1 && this.yAxis.color[1] === 1) this.selectedAxis = 'y';
        else if (this.zAxis.color[0] === 1 && this.zAxis.color[1] === 1) this.selectedAxis = 'z';
        // Rotate Rings
        else if (this.xRing.color[0] === 1 && this.xRing.color[1] === 1) this.selectedAxis = 'rx';
        else if (this.yRing.color[0] === 1 && this.yRing.color[1] === 1) this.selectedAxis = 'ry';
        else if (this.zRing.color[0] === 1 && this.zRing.color[1] === 1) this.selectedAxis = 'rz';
        else return false;

        const obj = state.selectedObject!;
        this.dragOrigin = [...obj.position];

        // --- SETUP DLA MOVE ---
        if (['x', 'y', 'z'].includes(this.selectedAxis)) {
            const axisVec = this.getAxisVector(this.selectedAxis as string);
            this.dragOffset = closestPointLines(ray.rayOrigin, ray.rayDir, this.dragOrigin, axisVec);
        }
        // --- SETUP DLA ROTATE ---
        else {
            const axisChar = this.selectedAxis.replace('r', '') as 'x' | 'y' | 'z';
            this.startMouseAngle = this.getAngleOnPlane(ray, axisChar, this.root.position) || 0;

            // Pobieramy startową rotację (zakładając że GameObject ma tablicę rotation [x,y,z])
            const idx = axisChar === 'x' ? 0 : (axisChar === 'y' ? 1 : 2);
            this.startObjectRotation = obj.rotation[idx];

            // Pokaż Tooltip
            this.tooltip.style.display = "block";
            this.updateTooltip(0, ray.rayOrigin); // Start with 0
        }

        return true;
    }

    public onMouseMove(ray: any, mouseScreenX: number, mouseScreenY: number) {
        if (!this.selectedAxis || !state.selectedObject) return;
        const obj = state.selectedObject;

        // --- MOVE LOGIC ---
        if (['x', 'y', 'z'].includes(this.selectedAxis)) {
            const axisVec = this.getAxisVector(this.selectedAxis);
            const tCurrent = closestPointLines(ray.rayOrigin, ray.rayDir, this.dragOrigin, axisVec);
            const delta = tCurrent - this.dragOffset;

            if (this.selectedAxis === 'x') obj.position[0] = this.dragOrigin[0] + delta;
            if (this.selectedAxis === 'y') obj.position[1] = this.dragOrigin[1] + delta;
            if (this.selectedAxis === 'z') obj.position[2] = this.dragOrigin[2] + delta;
        }

        // --- ROTATE LOGIC ---
        else {
            const axisChar = this.selectedAxis.replace('r', '') as 'x' | 'y' | 'z';
            const currentAngle = this.getAngleOnPlane(ray, axisChar, this.root.position);

            if (currentAngle !== null) {
                let deltaRad = currentAngle - this.startMouseAngle;
                let deltaDeg = deltaRad * (180 / Math.PI);

                // Snapping (co 15 stopni)
                const snap = 15;
                deltaDeg = Math.round(deltaDeg / snap) * snap;

                this.currentDeltaDeg = deltaDeg;

                const idx = axisChar === 'x' ? 0 : (axisChar === 'y' ? 1 : 2);
                obj.rotation[idx] = this.startObjectRotation - deltaDeg;

                // Update UI Text
                this.updateTooltip(deltaDeg, null, mouseScreenX, mouseScreenY);
            }
        }

        state.version++;
    }

    public onMouseUp() {
        this.selectedAxis = null;
        this.tooltip.style.display = "none";
        this.resetColors();
    }

    // --- Helpers ---

    private getAxisVector(axis: string): [number, number, number] {
        if (axis === 'x') return [1, 0, 0];
        if (axis === 'y') return [0, 1, 0];
        return [0, 0, 1];
    }

    private getAngleOnPlane(ray: any, axis: 'x' | 'y' | 'z', center: [number, number, number]) {
        let normal = [0, 1, 0];
        if (axis === 'x') normal = [1, 0, 0];
        if (axis === 'z') normal = [0, 0, 1];

        const t = intersectRayPlane(ray.rayOrigin, ray.rayDir, normal, center);
        if (t === null) return null;

        const hit: [number, number, number] = getPointOnRay(ray.rayOrigin, ray.rayDir, t);
        const local = sub(hit, center);

        if (axis === 'y') return Math.atan2(local[2], local[0]);
        if (axis === 'x') return Math.atan2(local[2], local[1]);
        if (axis === 'z') return Math.atan2(local[1], local[0]);
        return 0;
    }

    private updateTooltip(angle: number, pos3d: number[] | null, screenX: number = 0, screenY: number = 0) {
        this.tooltip.innerText = `${angle.toFixed(0)}°`;
        // Pozycjonowanie obok kursora
        this.tooltip.style.left = (screenX + 15) + "px";
        this.tooltip.style.top = (screenY + 15) + "px";
    }
}