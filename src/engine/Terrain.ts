import { Mat4, transformDirection, transformPoint, type Vec3 } from "../math";
import GameObject from "./GameObject";
import Mesh from "./Mesh";
import Texture from "./Texture";

export default class Terrain extends GameObject {
    public gridSize: number;
    public cellSize: number;

    public heightMap: Float32Array;
    public splatMap: Float32Array; // RGB wagi

    public textureLayers: (Texture | null)[] = [null, null, null];

    constructor(gl: WebGL2RenderingContext, name: string, gridSize: number = 64, cellSize: number = 1.0) {
        const dummyMesh = new Mesh(gl, new Float32Array(), new Float32Array());
        super(name, dummyMesh, [0, 0, 0], [1, 1, 1]);

        this.gridSize = gridSize;
        this.cellSize = cellSize;

        const numVertices = (gridSize + 1) * (gridSize + 1);
        this.heightMap = new Float32Array(numVertices).fill(0);
        this.splatMap = new Float32Array(numVertices * 3);

        // Domyślnie czerwony kanał (Trawa) na 100%
        for (let i = 0; i < this.splatMap.length; i += 3) {
            this.splatMap[i] = 1.0;
        }

        this.generateTerrainMesh(gl);
    }

    public setLayerTexture(gl: WebGL2RenderingContext, index: number, url: string) {
        if (index >= 0 && index < 3) {
            this.textureLayers[index] = new Texture(gl, url);
        }
    }

    // --- SCULPTING (Rzeźbienie) ---
    public sculpt(hitX: number, hitZ: number, radius: number, strength: number, isLowering: boolean) {
        // Przeliczamy współrzędne świata na indeksy siatki
        // Offset wynika z tego, że środek terenu jest w (0,0)
        const modelMatrix = this.getMatrixModel();
         const invModel = Mat4.invert(modelMatrix);
         const localHit = transformPoint([hitX, 0, hitZ], invModel); // Y nas nie obchodzi przy szukaniu indeksu

         const offset = (this.gridSize * this.cellSize) / 2;
         const gridX = Math.round((localHit[0] + offset) / this.cellSize);
         const gridZ = Math.round((localHit[2] + offset) / this.cellSize);

        let modified = false;
        const r = Math.ceil(radius);

        for (let z = -r; z <= r; z++) {
            for (let x = -r; x <= r; x++) {
                const cx = gridX + x;
                const cz = gridZ + z;

                // Sprawdzamy granice tablicy
                if (cx >= 0 && cx <= this.gridSize && cz >= 0 && cz <= this.gridSize) {
                    const dist = Math.sqrt(x * x + z * z);
                    if (dist < radius) {
                        // Funkcja cosinusowa dla gładkiego pędzla
                        const influence = Math.cos((dist / radius) * (Math.PI / 2));
                        const factor = strength * influence * 0.5; // Mnożnik prędkości

                        const idx = cx + cz * (this.gridSize + 1);

                        if (isLowering) {
                            this.heightMap[idx] -= factor;
                        } else {
                            this.heightMap[idx] += factor;
                        }
                        modified = true;
                    }
                }
            }
        }

        if (modified) {
            this.regenerateMeshPositions();
        }
    }

    // Wewnątrz klasy Terrain w pliku engine/Terrain.ts


    public raycast(worldRayOrigin: number[], worldRayDir: number[]): { x: number, y: number, z: number } | null {
        // 1. Oblicz macierz odwrotną terenu (World -> Local)
        // Dzięki temu nieważne gdzie przesuniesz teren, raycast zadziała
        const modelMatrix = this.getMatrixModel();
        const invModel = Mat4.invert(modelMatrix);

        // 2. Przetransformuj promień do przestrzeni lokalnej terenu
        const localOrigin = transformPoint(worldRayOrigin as Vec3, invModel);
        const localDir = transformDirection(worldRayDir as Vec3, invModel);

        // Parametry siatki
        const halfSize = (this.gridSize * this.cellSize) / 2;
        
        // Krok symulacji (im mniejszy tym dokładniejszy, 0.5 cellSize jest b. bezpieczne)
        const stepSize = this.cellSize * 0.25; 
        
        // Zasięg szukania w jednostkach lokalnych
        const maxDist = this.gridSize * this.cellSize * 1.5; 

        let dist = 0;
        
        // Startujemy "przed" terenem, żeby nie pominąć krawędzi
        // (W prostszej wersji startujemy od 0)
        let cx = localOrigin[0];
        let cy = localOrigin[1];
        let cz = localOrigin[2];

        // Optymalizacja: szybkie sprawdzenie AABB (czy w ogóle patrzymy w stronę terenu)
        // ... (pomijam dla czytelności, przy tej skali brute-force step jest wystarczająco szybki)

        while (dist < maxDist) {
            cx += localDir[0] * stepSize;
            cy += localDir[1] * stepSize;
            cz += localDir[2] * stepSize;
            dist += stepSize;

            // Przeliczamy lokalne koordynaty na indeksy siatki
            // Offset wynika z tego, że (0,0,0) modelu to środek terenu
            const gridX = Math.round((cx + halfSize) / this.cellSize);
            const gridZ = Math.round((cz + halfSize) / this.cellSize);

            // Czy jesteśmy w obrębie siatki X/Z?
            if (gridX >= 0 && gridX <= this.gridSize && gridZ >= 0 && gridZ <= this.gridSize) {
                // Pobieramy wysokość w tym punkcie
                const idx = gridX + gridZ * (this.gridSize + 1);
                const terrainHeight = this.heightMap[idx];

                // Czy promień dotknął lub wszedł pod powierzchnię?
                // Sprawdzamy 'cy' (wysokość promienia) vs 'terrainHeight' (wysokość góry)
                if (cy <= terrainHeight) {
                    // TRAFIENIE!
                    // Teraz musimy zwrócić punkt w przestrzeni ŚWIATA, nie lokalnej
                    // Używamy macierzy modelu, żeby wrócić do World Space
                    const hitLocal: Vec3 = [cx, cy, cz]; // Można użyć terrainHeight dla lepszej wizualizacji Y
                    const hitWorld = transformPoint(hitLocal, modelMatrix);
                    
                    return { x: hitWorld[0], y: hitWorld[1], z: hitWorld[2] };
                }
            }
            
            // Jeśli spadliśmy mocno poniżej terenu, przerywamy (optymalizacja)
            if (cy < -50) break; 
        }

        return null;
    }

    // --- PAINTING (Malowanie) ---
    public paint(hitX: number, hitZ: number, radius: number, strength: number, layerIndex: number) {
        const modelMatrix = this.getMatrixModel();
         const invModel = Mat4.invert(modelMatrix);
         const localHit = transformPoint([hitX, 0, hitZ], invModel);

         const offset = (this.gridSize * this.cellSize) / 2;
         const gridX = Math.round((localHit[0] + offset) / this.cellSize);
         const gridZ = Math.round((localHit[2] + offset) / this.cellSize);

        let modified = false;
        const r = Math.ceil(radius);

        // Ustalmy docelowe wagi dla wybranej warstwy:
        // Jeśli layerIndex=0 -> target=[1,0,0], layerIndex=1 -> target=[0,1,0] itd.
        const targetR = layerIndex === 0 ? 1.0 : 0.0;
        const targetG = layerIndex === 1 ? 1.0 : 0.0;
        const targetB = layerIndex === 2 ? 1.0 : 0.0;

        for (let z = -r; z <= r; z++) {
            for (let x = -r; x <= r; x++) {
                const cx = gridX + x;
                const cz = gridZ + z;

                if (cx >= 0 && cx <= this.gridSize && cz >= 0 && cz <= this.gridSize) {
                    const dist = Math.sqrt(x * x + z * z);
                    if (dist < radius) {
                        const influence = Math.cos((dist / radius) * (Math.PI / 2)) * strength * 0.1;
                        const idx = (cx + cz * (this.gridSize + 1)) * 3; // *3 bo RGB

                        // Prosta interpolacja liniowa (dodawanie/odejmowanie)
                        this.splatMap[idx] += (targetR - this.splatMap[idx]) * influence;
                        this.splatMap[idx + 1] += (targetG - this.splatMap[idx + 1]) * influence;
                        this.splatMap[idx + 2] += (targetB - this.splatMap[idx + 2]) * influence;

                        // Clamp wartości 0-1 (dla bezpieczeństwa)
                        this.splatMap[idx] = Math.max(0, Math.min(1, this.splatMap[idx]));
                        this.splatMap[idx + 1] = Math.max(0, Math.min(1, this.splatMap[idx + 1]));
                        this.splatMap[idx + 2] = Math.max(0, Math.min(1, this.splatMap[idx + 2]));

                        modified = true;
                    }
                }
            }
        }

        if (modified && this.mesh) {
            this.mesh.updateColors(this.splatMap);
        }
    }

    // Aktualizacja tylko pozycji (HeightMap -> Mesh)
    private regenerateMeshPositions() {
        if (!this.mesh) return;

        // Odtwarzamy tablicę pozycji z aktualnej heightmapy
        const positions = new Float32Array(this.heightMap.length * 3);
        const offset = (this.gridSize * this.cellSize) / 2;

        for (let i = 0; i < this.heightMap.length; i++) {
            const x = i % (this.gridSize + 1);
            const z = Math.floor(i / (this.gridSize + 1));

            positions[i * 3] = x * this.cellSize - offset;
            positions[i * 3 + 1] = this.heightMap[i]; // Zmieniona wysokość
            positions[i * 3 + 2] = z * this.cellSize - offset;
        }

        this.mesh.updateVertices(positions);

        // TODO: W przyszłości trzeba tu też przeliczyć normale (bufferNormal),
        // żeby oświetlenie reagowało na górki. Na razie zostawiamy płaskie.
    }

    public generateTerrainMesh(gl: WebGL2RenderingContext) {
        const positions: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];
        const colors: number[] = [];
        const normals: number[] = [];

        const offset = (this.gridSize * this.cellSize) / 2;

        for (let z = 0; z <= this.gridSize; z++) {
            for (let x = 0; x <= this.gridSize; x++) {
                const i = x + z * (this.gridSize + 1);

                positions.push(x * this.cellSize - offset, this.heightMap[i], z * this.cellSize - offset);
                uvs.push(x / 8.0, z / 8.0);
                colors.push(this.splatMap[i * 3], this.splatMap[i * 3 + 1], this.splatMap[i * 3 + 2]);
                normals.push(0, 1, 0);
            }
        }
        for (let z = 0; z < this.gridSize; z++) {
            for (let x = 0; x < this.gridSize; x++) {
                const row1 = z * (this.gridSize + 1);
                const row2 = (z + 1) * (this.gridSize + 1);
                indices.push(row1 + x, row2 + x, row1 + x + 1);
                indices.push(row1 + x + 1, row2 + x, row2 + x + 1);
            }
        }

        this.mesh = new Mesh(
            gl,
            new Float32Array(positions),
            new Float32Array(uvs),
            new Uint32Array(indices),
            new Float32Array(normals),
            new Float32Array(colors)
        );
    }
}