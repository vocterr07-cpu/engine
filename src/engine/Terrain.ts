import GameObject from "./GameObject";
import Mesh from "./Mesh";
import TextureArray from "./TextureArray";
import { Mat4, transformPoint, transformDirection, type Vec3 } from "../math";

export default class Terrain extends GameObject {
    public gridSize: number;
    public cellSize: number;
    public heightMap: Float32Array;
    public splatMap: Float32Array;
    public textureArray: TextureArray;

    constructor(gl: WebGL2RenderingContext, name: string, gridSize: number = 64, cellSize: number = 1.0) {
        super(name, new Mesh(gl, new Float32Array(), new Float32Array()), [0,0,0], [1,1,1]);
        this.gridSize = gridSize;
        this.cellSize = cellSize;
        this.textureArray = new TextureArray(gl, 8);

        const numVertices = (gridSize + 1) * (gridSize + 1);
        this.heightMap = new Float32Array(numVertices).fill(0);
        this.splatMap = new Float32Array(numVertices * 8);

        for (let i = 0; i < this.splatMap.length; i += 8) this.splatMap[i] = 1.0;

        this.generateTerrainMesh(gl);
    }

    public addTexture(url: string): number {
        const existing = this.textureArray.layerUrls.indexOf(url);
        if (existing !== -1) return existing;
        const empty = this.textureArray.layerUrls.findIndex(u => u === "");
        if (empty !== -1) {
            this.textureArray.setLayer(empty, url);
            return empty;
        }
        return -1;
    }

    public generateTerrainMesh(gl: WebGL2RenderingContext) {
        const numVertices = (this.gridSize + 1) * (this.gridSize + 1);
        const positions = new Float32Array(numVertices * 3);
        const uvs = new Float32Array(numVertices * 2);
        const normals = new Float32Array(numVertices * 3);
        const weights = new Float32Array(numVertices * 8);
        const offset = (this.gridSize * this.cellSize) / 2;

        for (let z = 0; z <= this.gridSize; z++) {
            for (let x = 0; x <= this.gridSize; x++) {
                const i = x + z * (this.gridSize + 1);
                positions[i*3] = x * this.cellSize - offset;
                positions[i*3+1] = this.heightMap[i];
                positions[i*3+2] = z * this.cellSize - offset;
                uvs[i*2] = x / 8.0; uvs[i*2+1] = z / 8.0;
                normals[i*3+1] = 1.0;
                for(let k=0; k<8; k++) weights[i*8+k] = this.splatMap[i*8+k];
            }
        }

        const indices = new Uint32Array(this.gridSize * this.gridSize * 6);
        let curr = 0;
        for (let z = 0; z < this.gridSize; z++) {
            for (let x = 0; x < this.gridSize; x++) {
                const r1 = z * (this.gridSize + 1);
                const r2 = (z + 1) * (this.gridSize + 1);
                indices[curr++] = r1 + x; indices[curr++] = r2 + x; indices[curr++] = r1 + x + 1;
                indices[curr++] = r1 + x + 1; indices[curr++] = r2 + x; indices[curr++] = r2 + x + 1;
            }
        }
        this.mesh = new Mesh(gl, positions, uvs, indices, normals, weights);
    }

    public sculpt(hitX: number, hitZ: number, radius: number, strength: number, isLowering: boolean) {
        const invModel = Mat4.invert(this.getMatrixModel());
        const localHit = transformPoint([hitX, 0, hitZ], invModel);
        const offset = (this.gridSize * this.cellSize) / 2;
        const gX = Math.round((localHit[0] + offset) / this.cellSize);
        const gZ = Math.round((localHit[2] + offset) / this.cellSize);
        let mod = false;
        const r = Math.ceil(radius);
        for (let z = -r; z <= r; z++) {
            for (let x = -r; x <= r; x++) {
                const cx = gX + x, cz = gZ + z;
                if (cx >= 0 && cx <= this.gridSize && cz >= 0 && cz <= this.gridSize) {
                    const d = Math.sqrt(x*x + z*z);
                    if (d < radius) {
                        const inf = Math.cos((d / radius) * (Math.PI / 2)) * strength * 0.5;
                        const idx = cx + cz * (this.gridSize + 1);
                        this.heightMap[idx] += isLowering ? -inf : inf;
                        mod = true;
                    }
                }
            }
        }
        if (mod) this.regeneratePositions();
    }

    public paint(hitX: number, hitZ: number, radius: number, strength: number, layer: number) {
        const invModel = Mat4.invert(this.getMatrixModel());
        const localHit = transformPoint([hitX, 0, hitZ], invModel);
        const offset = (this.gridSize * this.cellSize) / 2;
        const gX = Math.round((localHit[0] + offset) / this.cellSize);
        const gZ = Math.round((localHit[2] + offset) / this.cellSize);
        let mod = false;
        const r = Math.ceil(radius);
        for (let z = -r; z <= r; z++) {
            for (let x = -r; x <= r; x++) {
                const cx = gX + x, cz = gZ + z;
                if (cx >= 0 && cx <= this.gridSize && cz >= 0 && cz <= this.gridSize) {
                    const d = Math.sqrt(x*x + z*z);
                    if (d < radius) {
                        const inf = Math.cos((d / radius) * (Math.PI / 2)) * strength * 0.1;
                        const idx = (cx + cz * (this.gridSize + 1)) * 8;
                        this.splatMap[idx + layer] = Math.min(1.0, this.splatMap[idx + layer] + inf);
                        let sum = 0;
                        for(let k=0; k<8; k++) sum += this.splatMap[idx+k];
                        for(let k=0; k<8; k++) this.splatMap[idx+k] /= sum;
                        mod = true;
                    }
                }
            }
        }
        if (mod) this.mesh.updateWeights(this.splatMap);
    }

    private regeneratePositions() {
        const pos = new Float32Array(this.heightMap.length * 3);
        const offset = (this.gridSize * this.cellSize) / 2;
        for (let i = 0; i < this.heightMap.length; i++) {
            const x = i % (this.gridSize + 1), z = Math.floor(i / (this.gridSize + 1));
            pos[i*3] = x * this.cellSize - offset; pos[i*3+1] = this.heightMap[i]; pos[i*3+2] = z * this.cellSize - offset;
        }
        this.mesh.updateVertices(pos);
    }

    public raycast(o: number[], d: number[]) {
        const inv = Mat4.invert(this.getMatrixModel());
        const lo = transformPoint(o as Vec3, inv), ld = transformDirection(d as Vec3, inv);
        const half = (this.gridSize * this.cellSize) / 2, step = this.cellSize * 0.25;
        let dist = 0, cx = lo[0], cy = lo[1], cz = lo[2];
        while (dist < this.gridSize * this.cellSize * 1.5) {
            cx += ld[0]*step; cy += ld[1]*step; cz += ld[2]*step; dist += step;
            const gx = Math.round((cx + half) / this.cellSize), gz = Math.round((cz + half) / this.cellSize);
            if (gx >= 0 && gx <= this.gridSize && gz >= 0 && gz <= this.gridSize) {
                if (cy <= this.heightMap[gx + gz * (this.gridSize + 1)]) {
                    const res = transformPoint([cx, cy, cz], this.getMatrixModel());
                    return { x: res[0], y: res[1], z: res[2] };
                }
            }
            if (cy < -50) break;
        }
        return null;
    }
}