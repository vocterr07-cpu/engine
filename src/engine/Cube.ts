import GameObject from "./GameObject";
import Mesh from "./Mesh";

export default class Cube extends GameObject {
    static meshInstance: Mesh | null = null;
    constructor(name: string, gl: WebGL2RenderingContext, pos: [number, number, number], scale: [number, number, number]) {
        if (!Cube.meshInstance) {
            Cube.meshInstance = new Mesh(gl, Cube.vertices, Cube.uvs);
        }
        super(name, Cube.meshInstance, pos, scale)
    }

    static get vertices() {
        return new Float32Array([
            // Tył (Z = -0.5)
            -0.5, -0.5, -0.5,   0.5, -0.5, -0.5,   0.5,  0.5, -0.5,
             0.5,  0.5, -0.5,  -0.5,  0.5, -0.5,  -0.5, -0.5, -0.5,

            // Przód (Z = 0.5)
            -0.5, -0.5,  0.5,   0.5, -0.5,  0.5,   0.5,  0.5,  0.5,
             0.5,  0.5,  0.5,  -0.5,  0.5,  0.5,  -0.5, -0.5,  0.5,

            // Lewo (X = -0.5)
            -0.5,  0.5,  0.5,  -0.5,  0.5, -0.5,  -0.5, -0.5, -0.5,
            -0.5, -0.5, -0.5,  -0.5, -0.5,  0.5,  -0.5,  0.5,  0.5,

            // Prawo (X = 0.5)
             0.5,  0.5,  0.5,   0.5,  0.5, -0.5,   0.5, -0.5, -0.5,
             0.5, -0.5, -0.5,   0.5, -0.5,  0.5,   0.5,  0.5,  0.5,

            // Dół (Y = -0.5)
            -0.5, -0.5, -0.5,   0.5, -0.5, -0.5,   0.5, -0.5,  0.5,
             0.5, -0.5,  0.5,  -0.5, -0.5,  0.5,  -0.5, -0.5, -0.5,

            // Góra (Y = 0.5)
            -0.5,  0.5, -0.5,   0.5,  0.5, -0.5,   0.5,  0.5,  0.5,
             0.5,  0.5,  0.5,  -0.5,  0.5,  0.5,  -0.5,  0.5, -0.5,
        ]);
    }
    static get uvs() {
        // Dla każdej ściany (2 trójkąty = 6 wierzchołków) układamy UV:
        // (0,0), (1,0), (1,1) ... itd.
        // Poniżej przykładowy pattern powtórzony 6 razy (dla każdej ściany sześcianu)
        const faceUVs = [
            0, 0,  1, 0,  1, 1,
            1, 1,  0, 1,  0, 0
        ];
        
        let uvs: number[] = [];
        for (let i = 0; i < 6; i++) {
            uvs = uvs.concat(faceUVs);
        }
        return new Float32Array(uvs);
    }
}
