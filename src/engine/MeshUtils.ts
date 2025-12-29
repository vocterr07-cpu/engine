import Mesh from "./Mesh";

export function createBoxMesh(gl: WebGL2RenderingContext, width: number, height: number, depth: number): Mesh {
    const x = width / 2;
    const y = height / 2;
    const z = depth / 2;

    const vertices = [
        // Front
        -x, -y,  z,   x, -y,  z,   x,  y,  z,  -x,  y,  z,
        // Back
        -x, -y, -z,  -x,  y, -z,   x,  y, -z,   x, -y, -z,
        // Top
        -x,  y, -z,  -x,  y,  z,   x,  y,  z,   x,  y, -z,
        // Bottom
        -x, -y, -z,   x, -y, -z,   x, -y,  z,  -x, -y,  z,
        // Right
         x, -y, -z,   x,  y, -z,   x,  y,  z,   x, -y,  z,
        // Left
        -x, -y, -z,  -x, -y,  z,  -x,  y,  z,  -x,  y, -z,
    ];

    const uvs: number[] = new Array((vertices.length / 3) * 2).fill(0);

    return new Mesh(gl, new Float32Array(vertices), new Float32Array(uvs));
}