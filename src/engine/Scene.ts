// src/engine/Scene.ts
import type Engine from "./Engine";
import type GameObject from "./GameObject";

export default class Scene {
    public engine: Engine;
    
    // To jest "Święta Lista" silnika. 
    // Zwykła tablica JS. Pętla renderowania leci po niej z maksymalną prędkością.
    // Żadnych getterów do stora!
    public readonly children: GameObject[] = []; 

    constructor(engine: Engine) {
        this.engine = engine;
    }

    // Metody do zarządzania surową listą
    public add(obj: GameObject) {
        this.children.push(obj);
    }

    public remove(obj: GameObject) {
        const idx = this.children.indexOf(obj);
        if (idx > -1) this.children.splice(idx, 1);
    }
    
    // Pętla gry używa TEJ listy
    public update() {
        // Tu jest max performance, bo iterujemy po surowych obiektach
        for (const obj of this.children) {
            obj.update(); // Brak narzutu Proxy
        }
    }
}