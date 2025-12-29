
export default class Texture {
    private gl: WebGL2RenderingContext;
    public texture: WebGLTexture;
    public image: HTMLImageElement;

    constructor(gl: WebGL2RenderingContext, urlOrData: string) {
        this.gl = gl;
        this.texture = gl.createTexture()!;
        this.image = new Image();

        this.image.onload = () => {
            this.bind();
            // Wysyłamy obraz do GPU
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
            
            // Ustawienia renderowania (ważne dla skalowania i powtarzania)
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        };

        // Obsługa DataURL (z uploadu) lub zwykłego URL
        this.image.src = urlOrData;
    }

    public bind(slot: number = 0) {
        this.gl.activeTexture(this.gl.TEXTURE0 + slot);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    }
}