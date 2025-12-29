export default class Mesh {
    private gl: WebGL2RenderingContext;
    private bufferPos: WebGLBuffer;
    private bufferUV: WebGLBuffer;
    private vao: WebGLVertexArrayObject;
    public vertexCount: number = 0;
    constructor(gl: WebGL2RenderingContext, positions: Float32Array, uvs: Float32Array) {
        this.vertexCount = positions.length / 3;
        this.gl = gl;
        this.vao = gl.createVertexArray()!;
        gl.bindVertexArray(this.vao);
        this.bufferPos = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferPos);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        this.bufferUV = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferUV);
        gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

        gl.bindVertexArray(null);
    }

    public bind() {
        this.gl.bindVertexArray(this.vao);

    }


}