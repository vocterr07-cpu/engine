import { state } from "./store"; // Jeśli potrzebujesz dostępu do gl przez store, lub przekazuj gl w konstruktorze

export default class Texture {
    private gl: WebGL2RenderingContext;
    public glTexture: WebGLTexture;
    public url: string = "";

    constructor(gl: WebGL2RenderingContext, url: string = "") {
        this.gl = gl;
        this.glTexture = gl.createTexture()!;
        
        // Domyślny różowy piksel (placeholder)
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.glTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));

        if (url) {
            this.load(url);
        }
    }

    public load(url: string) {
        this.url = url;
        const image = new Image();
        image.crossOrigin = "Anonymous"; // Ważne, żeby nie blokowało tekstur z neta
        image.src = url;

        image.onload = () => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.glTexture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
            
            // Generujemy mipmapy (żeby z daleka nie "ziarniło")
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
            
            // --- TO JEST FIX NA ROZCIĄGANIE ---
            // Mówimy GPU: "Jak UV wyjdzie poza 1.0, to powtórz obrazek"
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
            
            // Filtrowanie (ładniejsze wygładzanie)
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        };

        image.onerror = () => {
            console.error("Nie udało się załadować tekstury:", url);
        }
    }

    public bind(unit: number) {
        this.gl.activeTexture(this.gl.TEXTURE0 + unit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.glTexture);
    }
}