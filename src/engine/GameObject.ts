import { Mat4 } from "../math";
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
    public getMatrixModel(): Float32Array {
        // 1. Oblicz lokalną macierz (Local Space)
        let scaleMatrix = Mat4.scale(this.scale[0], this.scale[1], this.scale[2]);
        let translationMatrix = Mat4.translation(this.position[0], this.position[1], this.position[2]);
        
        let rotX = Mat4.rotationX(this.rotation[0] * Math.PI / 180);
        let rotY = Mat4.rotationY(this.rotation[1] * Math.PI / 180);
        let rotZ = Mat4.rotationZ(this.rotation[2] * Math.PI / 180);
        
        // Kolejność rotacji: Z * Y * X (lub inna, zależnie od konwencji, tutaj ZYX)
        let rotMatrix = Mat4.multiply(rotZ, Mat4.multiply(rotY, rotX));
        
        let localModel = Mat4.multiply(translationMatrix, Mat4.multiply(rotMatrix, scaleMatrix));

        // 2. Jeśli mamy rodzica, pomnóż przez jego macierz (Parent * Local)
        if (this.parent) {
            const parentModel = this.parent.getMatrixModel();
            return Mat4.multiply(parentModel, localModel);
        }

        return localModel;
    }

    public update() {
        this.components.forEach((comp) => comp.update());
        this.children.forEach((child) => child.update());
    }
}