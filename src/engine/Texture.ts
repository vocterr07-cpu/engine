export default class Texture {
    private gl: WebGL2RenderingContext;
    public texture: WebGLTexture;
    public image: HTMLImageElement;

    constructor(gl: WebGL2RenderingContext, urlOrData: string) {
        this.gl = gl;
        this.texture = gl.createTexture()!;
        this.image = new Image();

        // Tymczasowy piksel (żeby nie było błędu przed załadowaniem)
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D, 0, this.gl.RGBA, 
            1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, 
            new Uint8Array([255, 255, 255, 255]) // Biały piksel na start
        );

        this.image.onload = () => {
            this.bind();
            // Wysyłamy obraz do GPU
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
            
            // --- KLUCZOWA POPRAWKA DLA CZĄSTECZEK ---
            // Jeśli obrazek nie jest np. 512x512, to REPEAT i MIPMAP psują teksturę (robi się czarna).
            // Używamy CLAMP_TO_EDGE i LINEAR - to działa zawsze!
            
            // Oś S (poziomo) i T (pionowo) - nie powtarzaj, rozciągnij krawędź
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            
            // Filtrowanie - zwykłe liniowe, bez mipmap (bezpieczniejsze dla dziwnych rozmiarów)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            
            console.log(`Texture loaded: ${this.image.width}x${this.image.height}`);
        };

        this.image.onerror = () => {
            console.error("Failed to load texture:", urlOrData);
        }

        // Obsługa CORS (ważne jeśli ładujesz z imgur/github)
        this.image.crossOrigin = "Anonymous";
        this.image.src = urlOrData;
    }

    public bind(slot: number = 0) {
        this.gl.activeTexture(this.gl.TEXTURE0 + slot);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    }
}