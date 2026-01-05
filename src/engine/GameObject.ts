import { Mat4, toRad } from "../math";
import type Mesh from "./Mesh";
import type Texture from "./Texture";
import type Component from "./Component";
import type Scene from "./Scene";
// Zakładam taką strukturę GameVariable w store.ts
import type { GameVariable } from "./store"; 
import ParticleSystem from "./ParticleSystem";

export default class GameObject {
    public id: string = crypto.randomUUID();
    public scene: Scene | null = null;
    public parent: GameObject | null = null;
    public name: string;
    
    public texture: Texture | null = null;
    public useTexture: boolean = false;
    public mesh: Mesh;
    
    public particleSystem: ParticleSystem | null = null;

    public position: [number, number, number];
    public scale: [number, number, number];
    public rotation: [number, number, number] = [0, 0, 0];
    public color: [number, number, number] = [1, 1, 1];

    public children: GameObject[] = [];
    public components: Component[] = [];
    
    // Lista zmiennych przypisanych do obiektu
    public variables: GameVariable[] = [];

    public canCollide: boolean = true;

    constructor(name: string, mesh: Mesh, pos: [number, number, number], scale: [number, number, number]) {
        this.name = name;
        this.mesh = mesh;
        this.position = pos;
        this.scale = scale;
    }

    public getVariable(name: string): any {
        return this.variables.find(v => v.name === name)?.value;
    }
    
    // ULEPSZONE: Obsługa typów i tworzenia zmiennych
    public setVariable(name: string, value: any, type: string = "STR") {
        const v = this.variables.find(v => v.name === name);
        if (v) {
            // Zmienna istnieje - aktualizujemy wartość
            v.value = value;
        } else {
            // Zmienna nie istnieje - tworzymy nową
            // Rzutujemy type na any, żeby pasował do typu w store (np. "INT" | "FLOAT")
            this.variables.push({ name, value, type: type as any, id: crypto.randomUUID() });
        }
    }

    public addChild(child: GameObject) {
        child.parent = this;
        this.children.push(child);
    }

    public getMatrixModel(): Float32Array {
        const t = Mat4.translation(this.position[0], this.position[1], this.position[2]);
        const s = Mat4.scale(this.scale[0], this.scale[1], this.scale[2]);
        const rx = Mat4.rotationX(toRad(this.rotation[0]));
        const ry = Mat4.rotationY(toRad(this.rotation[1]));
        const rz = Mat4.rotationZ(toRad(this.rotation[2]));
        const rot = Mat4.multiply(rz, Mat4.multiply(ry, rx));
        let model = Mat4.multiply(t, Mat4.multiply(rot, s));

        if (this.parent) {
            model = Mat4.multiply(this.parent.getMatrixModel(), model);
        }
        return model;
    }

    public update() {
        this.components.forEach((comp) => comp.update());
        
        if (this.particleSystem) {
            this.particleSystem.update();
        }

        this.children.forEach((child) => child.update());
    }

    public start() {
        this.components.forEach((comp) => comp.start());
    }

    public clone() {
        return new GameObject(`${this.name}-Clone`, this.mesh, [this.position[0] + this.scale[0] + 0.5, this.position[1], this.position[2]], this.scale);
    }
}