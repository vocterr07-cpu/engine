// engine/TextureArray.ts
export default class TextureArray {
    private gl: WebGL2RenderingContext;
    public glTexture: WebGLTexture;
    public layerCount: number;
    public width: number = 1024;
    public height: number = 1024;

    // Przechowujemy URL-e, żeby wiedzieć co już mamy
    public layerUrls: string[] = [];

    constructor(gl: WebGL2RenderingContext, layers: number = 8) {
        this.gl = gl;
        this.layerCount = layers;
        this.glTexture = gl.createTexture()!;
        this.layerUrls = new Array(layers).fill("");

        this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, this.glTexture);

        // Alokujemy pamięć na X warstw (np. 8)
        // TEXTURE_2D_ARRAY wymaga 3 wymiarów: width, height, depth (liczba warstw)
        this.gl.texStorage3D(
            this.gl.TEXTURE_2D_ARRAY, 
            4, // Liczba mipmap
            this.gl.RGBA8, 
            this.width, 
            this.height, 
            this.layerCount
        );

        // Ustawienia samplowania
        this.gl.texParameteri(this.gl.TEXTURE_2D_ARRAY, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D_ARRAY, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D_ARRAY, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D_ARRAY, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
    }

    public setLayer(index: number, url: string) {
        if (index < 0 || index >= this.layerCount) return;

        this.layerUrls[index] = url;
        const image = new Image();
        image.crossOrigin = "Anonymous";
        image.src = url;

        image.onload = () => {
            // Musimy przeskalować obrazek do 1024x1024, bo TextureArray wymaga identycznych rozmiarów
            const canvas = document.createElement("canvas");
            canvas.width = this.width;
            canvas.height = this.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Rysujemy obrazek na canvasie (skalowanie)
            ctx.drawImage(image, 0, 0, this.width, this.height);
            
            // Pobieramy dane pikseli
            // (Wersja uproszczona, w produkcji można użyć ImageBitmap dla wydajności)
            this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, this.glTexture);
            this.gl.texSubImage3D(
                this.gl.TEXTURE_2D_ARRAY,
                0, // mipmap level
                0, 0, index, // x, y, layer (z-offset)
                this.width, this.height, 1, // w, h, depth
                this.gl.RGBA,
                this.gl.UNSIGNED_BYTE,
                canvas
            );
            
            this.gl.generateMipmap(this.gl.TEXTURE_2D_ARRAY);
            console.log(`Załadowano teksturę na warstwę ${index}: ${url}`);
        };
    }

    public bind(unit: number) {
        this.gl.activeTexture(this.gl.TEXTURE0 + unit);
        this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, this.glTexture);
    }
}