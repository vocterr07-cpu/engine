import { supabase } from "./supabase";

export interface AssetFile {
    name: string;
    url: string;
    type: string; // 'image', 'model', etc.
}

export class AssetManager {
    // Lista załadowanych assetów (dostępnych w chmurze)
    public assets: AssetFile[] = [];

    constructor() {
        // Na starcie pobierz listę plików
        this.fetchAssets();
    }

    // 1. POBIERANIE LISTY PLIKÓW Z CHMURY
    async fetchAssets() {
        const { data, error } = await supabase
            .storage
            .from('assets') // Nazwa twojego bucketa
            .list();

        if (error) {
            console.error("Błąd pobierania assetów:", error);
            return;
        }

        // Mapujemy surowe dane na nasz format
        this.assets = data.map(file => {
            // Generujemy publiczny URL do pliku
            const { data: publicUrlData } = supabase
                .storage
                .from('assets')
                .getPublicUrl(file.name);

            return {
                name: file.name,
                url: publicUrlData.publicUrl,
                type: this.getFileType(file.name)
            };
        });

        console.log("Załadowano assety z chmury:", this.assets);
        // Tutaj przydałoby się odświeżyć UI (np. przez jakiś callback lub store)
    }

    // 2. WYSYŁANIE PLIKU DO CHMURY
    async uploadAsset(file: File) {
        // Tworzymy unikalną nazwę (żeby nie nadpisać plików o tej samej nazwie)
        // np. "moj_plik.png" -> "1693423423-moj_plik.png"
        const fileName = `${Date.now()}-${file.name}`;

        const { data, error } = await supabase
            .storage
            .from('assets')
            .upload(fileName, file);

        if (error) {
            console.error("Upload failed:", error);
            alert("Błąd wysyłania pliku!");
            return null;
        }

        console.log("Plik wysłany!", data);
        
        // Odśwież listę, żeby zobaczyć nowy plik
        await this.fetchAssets();
    }

    private getFileType(name: string): string {
        if (name.match(/\.(jpg|jpeg|png|webp)$/i)) return 'image';
        if (name.match(/\.(obj|fbx|gltf)$/i)) return 'model';
        return 'unknown';
    }
}