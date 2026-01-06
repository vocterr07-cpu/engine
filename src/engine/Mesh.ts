export default class Mesh {
    private gl: WebGL2RenderingContext;
    
    // Bufory
    private bufferPos: WebGLBuffer | null;
    private bufferUV: WebGLBuffer | null;
    private bufferIndex: WebGLBuffer | null;
    private bufferNormal: WebGLBuffer | null;
    private bufferColor: WebGLBuffer | null = null; // NOWE

    private vao: WebGLVertexArrayObject;
    
    public vertexCount: number = 0;
    public indexCount: number = 0;

    // Przechowujemy dane w CPU, żeby móc je edytować (Sculpt/Paint)
    public colors: Float32Array | null = null;

    constructor(
        gl: WebGL2RenderingContext, 
        positions: Float32Array, 
        uvs: Float32Array, 
        indices?: Uint32Array, 
        normals?: Float32Array, 
        colors?: Float32Array // NOWY ARGUMENT
    ) {
        this.gl = gl;
        this.vertexCount = positions.length / 3;
        this.vao = gl.createVertexArray()!;
        gl.bindVertexArray(this.vao);

        // 1. POZYCJE (Attrib 0)
        this.bufferPos = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferPos);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        // 2. UV (Attrib 1)
        this.bufferUV = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferUV);
        gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

        // 3. NORMALNE (Attrib 2)
        this.bufferNormal = null;
        if (normals && normals.length > 0) {
            this.bufferNormal = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferNormal);
            gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(2);
            gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);
        }

        // 4. KOLORY / WAGI (Attrib 3) - NOWE
        if (colors && colors.length > 0) {
            this.colors = colors;
            this.bufferColor = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferColor);
            gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW); // DYNAMIC_DRAW bo będziemy malować
            gl.enableVertexAttribArray(3);
            gl.vertexAttribPointer(3, 3, gl.FLOAT, false, 0, 0);
        }

        // 5. INDEKSY
        this.bufferIndex = null;
        if (indices) {
            this.indexCount = indices.length;
            this.bufferIndex = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferIndex);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        }

        gl.bindVertexArray(null);
    }

    public bind() {
        this.gl.bindVertexArray(this.vao);
    }

    // Metoda do szybkiej aktualizacji kolorów podczas malowania
    public updateColors(newColors: Float32Array) {
        if (!this.bufferColor) return;
        this.colors = newColors;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferColor);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, newColors, this.gl.DYNAMIC_DRAW);
    }

    public updateVertices(newPositions: Float32Array) {
        if (!this.bufferPos) return;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferPos);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, newPositions, this.gl.DYNAMIC_DRAW);
    }
}