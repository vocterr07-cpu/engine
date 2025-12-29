import { Mat4, toRad } from "../math";
import type Mesh from "./Mesh";
import type Texture from "./Texture";
import type Component from "./Component";
import type Scene from "./Scene";

export default class GameObject {
    public scene: Scene | null = null;
    public parent: GameObject | null = null; // NOWE: Rodzic
    public name: string;
    
    public texture: Texture | null = null;
    public useTexture: boolean = false;
    public mesh: Mesh;
    
    public position: [number, number, number];
    public scale: [number, number, number];
    public rotation: [number, number, number] = [0, 0, 0];
    public color: [number, number, number] = [1, 1, 1];

    public children: GameObject[] = [];
    public components: Component[] = [];

    public canCollide: boolean = true;

    constructor(name: string, mesh: Mesh, pos: [number, number, number], scale: [number, number, number]) {
        this.name = name;
        this.mesh = mesh;
        this.position = pos;
        this.scale = scale;
    }

    // NOWE: Dodawanie dziecka z ustawieniem rodzica
    public addChild(child: GameObject) {
        child.parent = this;
        this.children.push(child);
    }

    // NAPRAWIONE: Macierz uwzględnia transformację rodzica
    // GameObject.ts

public getMatrixModel(): Float32Array {
    const t = Mat4.translation(this.position[0], this.position[1], this.position[2]);
    const s = Mat4.scale(this.scale[0], this.scale[1], this.scale[2]);
    
    // Tworzymy macierze dla każdej osi
    // Zakładamy, że rotation to [x, y, z] w stopniach
    const rx = Mat4.rotationX(toRad(this.rotation[0]));
    const ry = Mat4.rotationY(toRad(this.rotation[1]));
    const rz = Mat4.rotationZ(toRad(this.rotation[2]));
    
    // Łączymy rotacje: Z * Y * X (standardowa kolejność)
    const rot = Mat4.multiply(rz, Mat4.multiply(ry, rx));
    
    // Składamy wszystko: T * R * S
    let model = Mat4.multiply(t, Mat4.multiply(rot, s));

    // Jeśli jest parent, musimy pomnożyć przez jego macierz
    if (this.parent) {
        model = Mat4.multiply(this.parent.getMatrixModel(), model);
    }

    return model;
}

    public update() {
        this.components.forEach((comp) => comp.update());
        this.children.forEach((child) => child.update());
    }

    public clone() {
        return new GameObject(`${this.name}-Clone`, this.mesh, [this.position[0] + this.scale[0] + 0.5, this.position[1], this.position[2]], this.scale);
    }
}