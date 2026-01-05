export const parseOBJ = (text: string) => {
    const rawPos: number[][] = [];
    const rawUV: number[][] = [];
    const rawNorm: number[][] = [];

    const finalPositions: number[] = [];
    const finalUVs: number[] = [];
    const finalNormals: number[] = [];
    const finalIndices: number[] = [];

    const uniqueVertices = new Map<string, number>();
    let nextIndex = 0;

    const lines = text.split('\n');

    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('#')) continue;

        const parts = line.split(/\s+/);
        const type = parts[0];

        if (type === 'v') {
            rawPos.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
        } else if (type === 'vt') {
            rawUV.push([parseFloat(parts[1]), parseFloat(parts[2])]);
        } else if (type === 'vn') {
            rawNorm.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
        } else if (type === 'f') {
            const faceVerts = parts.slice(1);
            const currentFaceIndices: number[] = [];

            for (const vertStr of faceVerts) {
                if (uniqueVertices.has(vertStr)) {
                    currentFaceIndices.push(uniqueVertices.get(vertStr)!);
                } else {
                    const lookup = vertStr.split('/');
                    
                    // --- POPRAWKA 1: Obsługa ujemnych indeksów ---
                    let vIdx = parseInt(lookup[0]);
                    if (vIdx < 0) vIdx = rawPos.length + vIdx;
                    else vIdx -= 1; // OBJ startuje od 1

                    let vtIdx = lookup[1] ? parseInt(lookup[1]) : -1;
                    if (vtIdx < 0 && lookup[1]) vtIdx = rawUV.length + vtIdx;
                    else if (vtIdx > 0) vtIdx -= 1;

                    let vnIdx = lookup[2] ? parseInt(lookup[2]) : -1;
                    if (vnIdx < 0 && lookup[2]) vnIdx = rawNorm.length + vnIdx;
                    else if (vnIdx > 0) vnIdx -= 1;
                    // ---------------------------------------------

                    // --- POPRAWKA 2: Zabezpieczenie przed desynchronizacją ---
                    // Jeśli p nie istnieje, dodajemy 0,0,0, żeby indeksy się zgadzały!
                    const p = rawPos[vIdx];
                    if (p) {
                        finalPositions.push(p[0], p[1], p[2]);
                    } else {
                        finalPositions.push(0, 0, 0); // Fallback
                    }

                    if (vtIdx >= 0 && rawUV[vtIdx]) {
                        finalUVs.push(rawUV[vtIdx][0], rawUV[vtIdx][1]);
                    } else {
                        finalUVs.push(0, 0);
                    }

                    if (vnIdx >= 0 && rawNorm[vnIdx]) {
                        finalNormals.push(rawNorm[vnIdx][0], rawNorm[vnIdx][1], rawNorm[vnIdx][2]);
                    } else {
                        finalNormals.push(0, 1, 0);
                    }
                    // ---------------------------------------------------------

                    uniqueVertices.set(vertStr, nextIndex);
                    currentFaceIndices.push(nextIndex);
                    nextIndex++;
                }
            }

            // Triangulacja
            for (let i = 1; i < currentFaceIndices.length - 1; i++) {
                finalIndices.push(currentFaceIndices[0]);
                finalIndices.push(currentFaceIndices[i]);
                finalIndices.push(currentFaceIndices[i + 1]);
            }
        }
    }

    return {
        vertices: finalPositions,
        uvs: finalUVs,
        normals: finalNormals,
        indices: finalIndices
    };
};