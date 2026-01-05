export default class Mesh {
    private gl: WebGL2RenderingContext;
    private bufferPos: WebGLBuffer | null;
    private bufferUV: WebGLBuffer | null;
    private bufferIndex: WebGLBuffer | null; // DODANE
    private bufferNormal: WebGLBuffer | null;
    private vao: WebGLVertexArrayObject;
    public vertexCount: number = 0;
    public indexCount: number = 0; // DODANE

    constructor(gl: WebGL2RenderingContext, positions: Float32Array, uvs: Float32Array, indices?: Uint32Array, normals?: Float32Array) {
        this.gl = gl;
        this.vertexCount = positions.length / 3;
        this.vao = gl.createVertexArray()!;
        gl.bindVertexArray(this.vao);

        // Buffer Pozycji (Attrib 0)
        this.bufferPos = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferPos);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        // Buffer UV (Attrib 1)
        this.bufferUV = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferUV);
        gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

        // --- DODANE: Buffer Indeksów ---
        this.bufferIndex = null;
        if (indices) {
            this.indexCount = indices.length;
            this.bufferIndex = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferIndex);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
            // Ważne: ELEMENT_ARRAY_BUFFER jest częścią stanu VAO, 
            // więc nie odpinaj go przed odpięciem VAO!
        }
        this.bufferNormal = null;
        if (normals && normals.length > 0) {
            this.bufferNormal = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferNormal);
            gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(2);
            gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);
        }

        gl.bindVertexArray(null);
    }

    public bind() {
        this.gl.bindVertexArray(this.vao);
    }
}