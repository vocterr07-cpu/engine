import { createSignal, For, onMount, onCleanup } from "solid-js";
import { state, storeActions } from "../../engine/store"; // Dostosuj ścieżkę
import Terrain from "../../engine/Terrain"; // Dostosuj ścieżkę
import { Layers, Paintbrush } from "lucide-solid";

const PaintSidebar = () => {
    // Służy do odświeżania widoku, gdy załaduje się nowa tekstura
    const [refreshTrigger, setRefreshTrigger] = createSignal(0);

    // Pobiera URL tekstury z danego slotu w silniku
    const getTextureUrl = (index: number) => {
        refreshTrigger(); // Zależność reaktywna
        const terrain = state.objects.find(o => o instanceof Terrain) as Terrain;
        // Sprawdzamy, czy w ogóle mamy TextureArray i czy dany slot ma URL
        if (terrain && terrain.textureArray && terrain.textureArray.layerUrls[index]) {
            return terrain.textureArray.layerUrls[index];
        }
        return null; // Pusty slot
    };

    // Nasłuchujemy zmian w silniku (opcjonalne, ale pomaga przy ładowaniu asynchronicznym)
    let interval: number;
    onMount(() => {
        interval = setInterval(() => setRefreshTrigger(n => n + 1), 1000) as any;
    });
    onCleanup(() => clearInterval(interval));

    const handleSelectLayer = (index: number) => {
        storeActions.setTerrainLayer(index);
        storeActions.setEditMode("paint");
    };

    return (
        <div class="absolute top-0 left-0 h-full w-full bg-[#1e1e1e] border-r border-[#333333] flex flex-col z-40">
            {/* Nagłówek */}
            <div class="p-4 border-b border-[#333333] bg-[#252526]">
                <div class="flex items-center gap-2 text-zinc-100 font-bold uppercase tracking-wider text-xs">
                    <Layers size={14} />
                    <span>Terrain Layers (Slots)</span>
                </div>
                <p class="text-[10px] text-zinc-500 mt-1">
                    Slot 0 is a base. Slots 1-7 allow you to draw details.
                </p>
            </div>

            {/* Grid Slotów */}
            <div class="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
                <For each={[0, 1, 2, 3, 4, 5, 6, 7]}>
                    {(layerIndex) => (
                        <div 
                            onClick={() => handleSelectLayer(layerIndex)}
                            class={`
                                relative aspect-square rounded-lg border-2 cursor-pointer transition-all group overflow-hidden
                                ${state.terrainSettings.selectedLayer === layerIndex 
                                    ? "border-blue-500 ring-2 ring-blue-500/20 scale-[1.02]" 
                                    : "border-[#333] hover:border-zinc-500"}
                            `}
                        >
                            {/* Podgląd tekstury */}
                            {getTextureUrl(layerIndex) ? (
                                <img 
                                    src={getTextureUrl(layerIndex)!} 
                                    class="w-full h-full object-cover"
                                />
                            ) : (
                                // Pusty slot
                                <div class="w-full h-full bg-[#1a1a1a] flex flex-col items-center justify-center text-zinc-600 gap-1">
                                    <div class="w-full h-full checkerboard-pattern opacity-10"></div>
                                    <span class="absolute text-[9px] font-mono">EMPTY</span>
                                </div>
                            )}

                            {/* Numer Slotu */}
                            <div class="absolute top-0 left-0 bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded-br">
                                #{layerIndex}
                            </div>

                            {/* Oznaczenie Bazy */}
                            {layerIndex === 0 && (
                                <div class="absolute bottom-0 w-full bg-blue-600/80 text-white text-[9px] text-center py-0.5 font-bold uppercase">
                                    BASE
                                </div>
                            )}

                            {/* Ikona pędzla przy aktywnym */}
                            {state.terrainSettings.selectedLayer === layerIndex && state.editMode === "paint" && (
                                <div class="absolute inset-0 flex items-center justify-center bg-blue-500/10 pointer-events-none">
                                    <Paintbrush class="text-white drop-shadow-md" size={24} />
                                </div>
                            )}
                        </div>
                    )}
                </For>
            </div>

            {/* Ustawienia Pędzla */}
            <div class="mt-auto p-4 border-t border-[#333333] bg-[#252526]">
                <h3 class="text-xs font-bold text-zinc-400 mb-3 uppercase">Ustawienia Pędzla</h3>
                
                <div class="mb-3">
                    <div class="flex justify-between text-[10px] text-zinc-500 mb-1">
                        <span>Rozmiar</span>
                        <span>{state.terrainSettings.brushRadius.toFixed(1)}</span>
                    </div>
                    <input 
                        type="range" min="1" max="20" step="0.5"
                        value={state.terrainSettings.brushRadius}
                        onInput={(e) => storeActions.setBrushRadius(parseFloat(e.currentTarget.value))}
                        class="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                <div>
                    <div class="flex justify-between text-[10px] text-zinc-500 mb-1">
                        <span>Siła</span>
                        <span>{state.terrainSettings.brushStrength.toFixed(1)}</span>
                    </div>
                    <input 
                        type="range" min="0.1" max="5" step="0.1"
                        value={state.terrainSettings.brushStrength}
                        onInput={(e) => storeActions.setBrushStrength(parseFloat(e.currentTarget.value))}
                        class="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>
            </div>
        </div>
    );
};

export default PaintSidebar;