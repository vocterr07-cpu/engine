import GameObject from "./GameObject";
import Engine from "./Engine";
import { createBoxMesh } from "./MeshUtils";
import { closestPointLines, intersectRayAABB, sub } from "../math";
import { state } from "./store";

export default class Gizmo {
    public root: GameObject;
    private xAxis: GameObject;
    private yAxis: GameObject;
    private zAxis: GameObject;

    private selectedAxis: 'x' | 'y' | 'z' | null = null;
    
    private dragOffset: number = 0;
    private dragOrigin: number[] = [0, 0, 0];

    constructor(engine: Engine) {
        const gl = engine.gl;

        // Pusty root
        const dummyMesh = createBoxMesh(gl, 0,0,0);
        this.root = new GameObject("GizmoRoot", dummyMesh, [0,0,0], [1,1,1]);

        // Mesh dla osi
        const axisMesh = createBoxMesh(gl, 1, 0.05, 0.05);

        // X (Czerwona)
        this.xAxis = new GameObject("GizmoX", axisMesh, [0.5, 0, 0], [1, 1, 1]);
        this.xAxis.color = [1, 0, 0];

        // Y (Zielona) - obrócona
        this.yAxis = new GameObject("GizmoY", axisMesh, [0, 0.5, 0], [1, 1, 1]);
        this.yAxis.color = [0, 1, 0];
        this.yAxis.rotation = [0, 0, 90];

        // Z (Niebieska) - obrócona
        this.zAxis = new GameObject("GizmoZ", axisMesh, [0, 0, 0.5], [1, 1, 1]);
        this.zAxis.color = [0, 0, 1];
        this.zAxis.rotation = [0, -90, 0];

        // WAŻNE: Używamy addChild żeby ustawić parenta!
        this.root.addChild(this.xAxis);
        this.root.addChild(this.yAxis);
        this.root.addChild(this.zAxis);
    }

    public update(camera: any) {
        const selectedObject = state.selectedObject;
        if (!selectedObject) {
            this.root.scale = [0, 0, 0];
            return;
        }

        // 1. Synchronizacja pozycji
        this.root.position = [...selectedObject.position];

        // 2. Stały rozmiar na ekranie
        const dist = Math.sqrt(
            Math.pow(camera.position[0] - this.root.position[0], 2) +
            Math.pow(camera.position[1] - this.root.position[1], 2) +
            Math.pow(camera.position[2] - this.root.position[2], 2)
        );
        const s = dist * 0.15;
        this.root.scale = [s, s, s];

        // Reset kolorów
        if (!this.selectedAxis) {
            this.xAxis.color = [1, 0, 0];
            this.yAxis.color = [0, 1, 0];
            this.zAxis.color = [0, 0, 1];
        }

        this.root.update();
    }

    public checkHit(ray: { rayOrigin: [number, number, number], rayDir: [number, number, number] }): boolean {
        if (!state.selectedObject) return false;

        const localRayO = sub(ray.rayOrigin, this.root.position);
        const s = this.root.scale[0];
        const scaledRayO = [localRayO[0]/s, localRayO[1]/s, localRayO[2]/s];
        
        const thickness = 0.3; 

        // Sprawdzamy AABB osi w przestrzeni lokalnej Gizma
        if (intersectRayAABB(scaledRayO, ray.rayDir, [0, -thickness, -thickness], [1.1, thickness, thickness])) {
            this.hoverAxis('x');
            return true;
        }
        if (intersectRayAABB(scaledRayO, ray.rayDir, [-thickness, 0, -thickness], [thickness, 1.1, thickness])) {
            this.hoverAxis('y');
            return true;
        }
        if (intersectRayAABB(scaledRayO, ray.rayDir, [-thickness, -thickness, 0], [thickness, thickness, 1.1])) {
            this.hoverAxis('z');
            return true;
        }

        if (!this.selectedAxis) {
            this.xAxis.color = [1, 0, 0];
            this.yAxis.color = [0, 1, 0];
            this.zAxis.color = [0, 0, 1];
        }
        
        return false;
    }

    private hoverAxis(axis: 'x' | 'y' | 'z') {
        if (this.selectedAxis) return;
        this.xAxis.color = axis === 'x' ? [1, 1, 0] : [1, 0, 0];
        this.yAxis.color = axis === 'y' ? [1, 1, 0] : [0, 1, 0];
        this.zAxis.color = axis === 'z' ? [1, 1, 0] : [0, 0, 1];
    }

    public onMouseDown(ray: { rayOrigin: [number, number, number], rayDir: [number, number, number] }) {
        if (this.checkHit(ray)) {
            if (this.xAxis.color[1] === 1 && this.xAxis.color[0] === 1) this.selectedAxis = 'x';
            else if (this.yAxis.color[0] === 1) this.selectedAxis = 'y';
            else this.selectedAxis = 'z';

            const obj = state.selectedObject!;
            this.dragOrigin = [...obj.position];
            
            const axisVec = this.getAxisVector(this.selectedAxis!);
            this.dragOffset = closestPointLines(ray.rayOrigin, ray.rayDir, this.dragOrigin, axisVec);
            
            return true;
        }
        return false;
    }

    public onMouseMove(ray: { rayOrigin: number[], rayDir: number[] }) {
        if (!this.selectedAxis || !state.selectedObject) return;

        const axisVec = this.getAxisVector(this.selectedAxis);
        const tCurrent = closestPointLines(ray.rayOrigin, ray.rayDir, this.dragOrigin, axisVec);
        const delta = tCurrent - this.dragOffset;

        const obj = state.selectedObject;
        if (this.selectedAxis === 'x') obj.position[0] = this.dragOrigin[0] + delta;
        if (this.selectedAxis === 'y') obj.position[1] = this.dragOrigin[1] + delta;
        if (this.selectedAxis === 'z') obj.position[2] = this.dragOrigin[2] + delta;

        state.version++;
    }

    public onMouseUp() {
        this.selectedAxis = null;
    }

    private getAxisVector(axis: string): number[] {
        if (axis === 'x') return [1, 0, 0];
        if (axis === 'y') return [0, 1, 0];
        return [0, 0, 1];
    }
}