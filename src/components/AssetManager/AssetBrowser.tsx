import { createSignal, For, Show } from "solid-js";
import { state } from "../../engine/store";
import { Image, FileBox, UploadCloud, RefreshCw } from "lucide-solid";
import Terrain from "../../engine/Terrain"; // Upewnij się co do ścieżki

const AssetBrowser = () => {
    const [isUploading, setIsUploading] = createSignal(false);
    
    
    // Prosty trigger do odświeżania widoku po uploadzie
    const [refresh, setRefresh] = createSignal(0);
    const update = () => setRefresh(r => r + 1);
    const handleUpload = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file || !state.engine) return;
        
        setIsUploading(true);
        try {
            await state.engine.assetManager.uploadAsset(file);
            setRefresh(p => p + 1); // Wymuszamy re-render listy
        } catch (err) {
            console.error(err);
        } finally {
            setIsUploading(false);
            update();
        }
    };

    const getAssets = () => {
        refresh();
        return state.engine?.assetManager.assets;
    }

    const handleAssetClick = (asset: any) => {
        console.log("Wybrano asset:", asset);
        if (state.editMode === "paint" && asset.type === "image" && state.selectedObject instanceof Terrain) {
            const terrain = state.selectedObject as Terrain;
            if (state.engine) {
                terrain.setLayerTexture(state.engine.gl, 1, asset.url);
                console.log("Przypisano teksturę do slotu 0");
            }
        }
    };

    return (
        <div class="w-full h-full bg-[#1e1e1e] p-2 overflow-y-auto">
            
            {/* Toolbar Assets */}
            <div class="flex items-center justify-between mb-3 px-1">
                <span class="text-xs text-zinc-500 font-mono">/assets/</span>
                <button 
                    onClick={() => {
                        state.engine?.assetManager.fetchAssets();
                        setRefresh(p => p + 1);
                    }}
                    class="p-1 hover:bg-[#333333] rounded text-zinc-400"
                    title="Odśwież listę"
                >
                    <RefreshCw size={12} />
                </button>
            </div>

            {/* Grid */}
            <div class="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-2">
                
                {/* Kafel Uploadu */}
                <label class="flex flex-col items-center justify-center h-[90px] border-2 border-dashed border-[#333333] rounded cursor-pointer hover:border-blue-500 hover:bg-[#252526] transition-colors group">
                    <input type="file" class="hidden" onChange={handleUpload} disabled={isUploading()} />
                    <UploadCloud size={20} class={`text-zinc-500 group-hover:text-blue-500 mb-1 ${isUploading() ? 'animate-bounce' : ''}`} />
                    <span class="text-[10px] text-zinc-500 group-hover:text-zinc-300">
                        {isUploading() ? "Wysyłanie..." : "Dodaj plik"}
                    </span>
                </label>

                {/* Lista Assetów */}
                <Show when={state.engine?.assetManager.assets}>
                    <For each={getAssets()}>
                        {(asset) => (
                            <div 
                                onClick={() => handleAssetClick(asset)}
                                class="relative flex flex-col h-[90px] bg-[#252526] border border-[#333333] rounded cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all group overflow-hidden"
                            >
                                {/* Preview */}
                                <div class="flex-1 flex items-center justify-center bg-[#1a1a1a] overflow-hidden relative">
                                    {asset.type === 'image' ? (
                                        <img src={asset.url} class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    ) : (
                                        <FileBox size={24} class="text-zinc-600" />
                                    )}
                                    {/* Overlay przy hoverze */}
                                    <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                
                                {/* Label */}
                                <div class="h-[20px] px-1 flex items-center bg-[#252526] border-t border-[#333333]">
                                    <span class="text-[9px] text-zinc-400 truncate w-full text-center font-mono">
                                        {asset.name}
                                    </span>
                                </div>
                            </div>
                        )}
                    </For>
                </Show>
            </div>
        </div>
    );
};

export default AssetBrowser;