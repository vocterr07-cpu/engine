import Mesh from "./Mesh";

export const createParticleQuad = (gl: WebGL2RenderingContext): Mesh => {
    // 1. Pozycje (Płaski kwadrat na środku 0,0)
    const vertices = new Float32Array([
        -0.5,  0.5, 0.0, // Lewy Góra
        -0.5, -0.5, 0.0, // Lewy Dół
         0.5, -0.5, 0.0, // Prawy Dół
         0.5,  0.5, 0.0  // Prawy Góra
    ]);

    // 2. UV (Żeby tekstura pokryła cały kwadrat)
    const uvs = new Float32Array([
        0.0, 0.0, // LG
        0.0, 1.0, // LD
        1.0, 1.0, // PD
        1.0, 0.0  // PG
    ]);

    // 3. Indeksy (Dwa trójkąty tworzące kwadrat)
    const indices = new Uint32Array([
        0, 1, 2, // Pierwszy trójkąt
        0, 2, 3  // Drugi trójkąt
    ]);

    // 4. Normalne (Wszystkie patrzą w stronę kamery - oś Z)
    const normals = new Float32Array([
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
    ]);

    return new Mesh(gl, vertices, uvs, indices, normals);
};