import Mesh from "./Mesh";

export function createTorusMesh(gl: WebGL2RenderingContext, radius: number, tube: number, radialSegments: number, tubularSegments: number): Mesh {
    const vertices: number[] = [];
    const texCoords: number[] = []; // Puste, bo nie używamy tekstur na gizmo

    for (let j = 0; j <= radialSegments; j++) {
        for (let i = 0; i <= tubularSegments; i++) {
            const u = (i / tubularSegments) * Math.PI * 2;
            const v = (j / radialSegments) * Math.PI * 2;

            // Środek rurki
            const centerX = radius * Math.cos(v);
            const centerY = radius * Math.sin(v);

            // Punkt na powierzchni rurki
            const x = (radius + tube * Math.cos(u)) * Math.cos(v);
            const y = (radius + tube * Math.cos(u)) * Math.sin(v);
            const z = tube * Math.sin(u);

            // Dodajemy 2 trójkąty (Quad) dla każdego segmentu (oprócz ostatniego paska)
            if (i < tubularSegments && j < radialSegments) {
                const getPos = (uVal: number, vVal: number) => {
                    const u = (uVal / tubularSegments) * Math.PI * 2;
                    const v = (vVal / radialSegments) * Math.PI * 2;
                    const x = (radius + tube * Math.cos(u)) * Math.cos(v);
                    const y = (radius + tube * Math.cos(u)) * Math.sin(v);
                    const z = tube * Math.sin(u);
                    return [x, y, z];
                };

                const p1 = getPos(i, j);
                const p2 = getPos(i + 1, j);
                const p3 = getPos(i + 1, j + 1);
                const p4 = getPos(i, j + 1);

                vertices.push(...p1, ...p2, ...p3);
                vertices.push(...p1, ...p3, ...p4);
                
                // Atrapa UV
                texCoords.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);
            }
        }
    }
    return new Mesh(gl, new Float32Array(vertices), new Float32Array(texCoords));
}

// ... Twoja stara funkcja createBoxMesh ...
export function createBoxMesh(gl: WebGL2RenderingContext, w: number, h: number, d: number): Mesh {
    // ... (zostaw bez zmian) ...
    // Jeśli nie masz pod ręką, mogę wkleić standardową kostkę
    const vertices = [
       // Front
       -w/2, -h/2,  d/2,   w/2, -h/2,  d/2,   w/2,  h/2,  d/2,
       -w/2, -h/2,  d/2,   w/2,  h/2,  d/2,  -w/2,  h/2,  d/2,
       // Back
       -w/2, -h/2, -d/2,  -w/2,  h/2, -d/2,   w/2,  h/2, -d/2,
       -w/2, -h/2, -d/2,   w/2,  h/2, -d/2,   w/2, -h/2, -d/2,
       // Top
       -w/2,  h/2, -d/2,  -w/2,  h/2,  d/2,   w/2,  h/2,  d/2,
       -w/2,  h/2, -d/2,   w/2,  h/2,  d/2,   w/2,  h/2, -d/2,
       // Bottom
       -w/2, -h/2, -d/2,   w/2, -h/2, -d/2,   w/2, -h/2,  d/2,
       -w/2, -h/2, -d/2,   w/2, -h/2,  d/2,  -w/2, -h/2,  d/2,
       // Right
        w/2, -h/2, -d/2,   w/2,  h/2, -d/2,   w/2,  h/2,  d/2,
        w/2, -h/2, -d/2,   w/2,  h/2,  d/2,   w/2, -h/2,  d/2,
       // Left
       -w/2, -h/2, -d/2,  -w/2, -h/2,  d/2,  -w/2,  h/2,  d/2,
       -w/2, -h/2, -d/2,  -w/2,  h/2,  d/2,  -w/2,  h/2, -d/2,
    ];
    // Fake UVs just to satisfy buffer
    const uvs = new Array(vertices.length / 3 * 2).fill(0);
    return new Mesh(gl, new Float32Array(vertices), new Float32Array(uvs));
}