export default class Mesh {
    private gl: WebGL2RenderingContext;
    private bufferPos: WebGLBuffer | null = null;
    private bufferUV: WebGLBuffer | null = null;
    private bufferIndex: WebGLBuffer | null = null;
    private bufferNormal: WebGLBuffer | null = null;
    private bufferWeights1: WebGLBuffer | null = null;
    private bufferWeights2: WebGLBuffer | null = null;

    private vao: WebGLVertexArrayObject;
    public vertexCount: number = 0;
    public indexCount: number = 0;

    constructor(
        gl: WebGL2RenderingContext,
        positions: Float32Array,
        uvs: Float32Array,
        indices?: Uint32Array,
        normals?: Float32Array,
        weights?: Float32Array
    ) {
        this.gl = gl;
        this.vertexCount = positions.length / 3;
        this.vao = gl.createVertexArray()!;
        gl.bindVertexArray(this.vao);

        // 0. Pozycje (Atrybut 0)
        this.bufferPos = this.setupAttrib(0, 3, positions);

        // 1. UV (Atrybut 1)
        this.bufferUV = this.setupAttrib(1, 2, uvs);

        // 2. Normale (Atrybut 2)
        if (normals && normals.length >= this.vertexCount * 3) {
            this.bufferNormal = this.setupAttrib(2, 3, normals);
        } else {
            this.bufferNormal = this.setupAttrib(2, 3, new Float32Array(this.vertexCount * 3).fill(0));
        }

        // 3 i 4. Wagi Splatmapy (8 warstw)
        if (weights && weights.length >= this.vertexCount * 8) {
            const count = this.vertexCount;
            const w1 = new Float32Array(count * 4);
            const w2 = new Float32Array(count * 4);

            for (let i = 0; i < count; i++) {
                w1[i * 4 + 0] = weights[i * 8 + 0]; w1[i * 4 + 1] = weights[i * 8 + 1];
                w1[i * 4 + 2] = weights[i * 8 + 2]; w1[i * 4 + 3] = weights[i * 8 + 3];
                w2[i * 4 + 0] = weights[i * 8 + 4]; w2[i * 4 + 1] = weights[i * 8 + 5];
                w2[i * 4 + 2] = weights[i * 8 + 6]; w2[i * 4 + 3] = weights[i * 8 + 7];
            }

            this.bufferWeights1 = this.setupAttrib(3, 4, w1, gl.DYNAMIC_DRAW);
            this.bufferWeights2 = this.setupAttrib(4, 4, w2, gl.DYNAMIC_DRAW);
        }

        // Indeksy
        if (indices) {
            this.indexCount = indices.length;
            this.bufferIndex = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferIndex);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        }

        gl.bindVertexArray(null);
    }

    private setupAttrib(location: number, size: number, data: Float32Array, usage: number = 35044): WebGLBuffer {
        const buffer = this.gl.createBuffer()!;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, usage);
        this.gl.enableVertexAttribArray(location);
        this.gl.vertexAttribPointer(location, size, this.gl.FLOAT, false, 0, 0);
        return buffer;
    }

    public bind() {
        this.gl.bindVertexArray(this.vao);
    }

    public updateVertices(newPositions: Float32Array) {
        if (!this.bufferPos) return;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferPos);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, newPositions);
    }

    public updateWeights(newWeights: Float32Array) {
        if (!this.bufferWeights1 || !this.bufferWeights2) return;
        const count = this.vertexCount;
        const w1 = new Float32Array(count * 4);
        const w2 = new Float32Array(count * 4);
        for (let i = 0; i < count; i++) {
            w1[i * 4 + 0] = newWeights[i * 8 + 0]; w1[i * 4 + 1] = newWeights[i * 8 + 1];
            w1[i * 4 + 2] = newWeights[i * 8 + 2]; w1[i * 4 + 3] = newWeights[i * 8 + 3];
            w2[i * 4 + 0] = newWeights[i * 8 + 4]; w2[i * 4 + 1] = newWeights[i * 8 + 5];
            w2[i * 4 + 2] = newWeights[i * 8 + 6]; w2[i * 4 + 3] = newWeights[i * 8 + 7];
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferWeights1);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, w1);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferWeights2);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, w2);
    }
}