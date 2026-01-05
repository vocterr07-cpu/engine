import GameObject from "../../engine/GameObject";
import Mesh from "../../engine/Mesh";
import { state, storeActions } from "../../engine/store";
import { parseOBJ } from "../../loaders/objLoader";
import { FileUp } from "lucide-solid"; // Zakładam, że masz tę ikonę, jeśli nie, użyj innej

const ImportOBJButton = () => {
    let inputRef: HTMLInputElement | undefined;

    const handleFileUpload = (e: Event & {currentTarget: HTMLInputElement}) => {
                console.log("123")

        const file = e.currentTarget.files?.[0];
        if (!file) return;
        e.currentTarget.value = ""; 

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            try {
                const meshData = parseOBJ(text);
                const name = file.name.replace(".obj", "");
                
                // Konwersja danych na typy WebGL
                const positions = new Float32Array(meshData.vertices);
                const indices = new Uint32Array(meshData.indices); // Uint32 dla dużych modeli
                const uvs = new Float32Array(meshData.uvs);
                const normals = new Float32Array(meshData.normals);

                if (!state.engine) return;

                const newMesh = new Mesh(state.engine.gl, positions, uvs, indices, normals);
                const newObj = new GameObject(name, newMesh, [0,0,0], [1,1,1]);
                
                storeActions.addObject(newObj);
                console.log(`Successfully imported model: ${name}`);
            }
            catch(e) {
                console.error(`Failed to parse OBJ file: ${e}`);
                alert("Error parsing OBJ file. Check console.");
            }
        }
        reader.readAsText(file);
    }

    return (
        <>
            <button 
                onClick={() => inputRef?.click()}
                class="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-between group"
            >
                <div class="flex items-center gap-2">
                    {/* Ikona */}
                    <FileUp size={16} class="text-zinc-500 group-hover:text-white" />
                    <span class="font-medium tracking-wide">Import .obj</span>
                </div>
                {/* Wizualny skrót klawiszowy (opcjonalnie) */}
                <span class="text-xs text-zinc-600 group-hover:text-blue-200 font-mono">Ctrl+I</span>
            </button>

            <input
                type="file"
                accept=".obj" // Ważne: filtruje tylko pliki OBJ w oknie systemu
                ref={inputRef}
                class="hidden"
                onChange={handleFileUpload}
            />
        </>
    )
}

export default ImportOBJButton