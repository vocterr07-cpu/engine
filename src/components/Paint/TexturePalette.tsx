import { state, storeActions } from "../../engine/store";
import { Layers } from "lucide-solid";
import Terrain from "../../engine/Terrain";

const TexturePalette = () => {
    // Pobiera URL tekstury z danej warstwy
    const getTextureUrl = (index: number) => {
        const terrain = state.objects.find(o => o instanceof Terrain) as Terrain;
        // Odwołujemy się do TextureArray, który ma tablicę URLi
        if (terrain && terrain.textureArray && terrain.textureArray.layerUrls[index]) {
            return terrain.textureArray.layerUrls[index];
        }
        return null;
    };

    return (
        <div class="flex flex-col gap-2 p-2 bg-[#252526] rounded border border-[#333333] mb-2">
            <div class="flex items-center gap-2 text-zinc-400 text-xs uppercase font-bold tracking-wider mb-1">
                <Layers size={12} />
                <span>Warstwy (0-7)</span>
            </div>

            <div class="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((layerIndex) => (
                    <div
                        onClick={() => {
                            storeActions.setTerrainLayer(layerIndex);
                            storeActions.setEditMode("paint");
                        }}
                        class={`
                            relative w-10 h-10 rounded border-2 cursor-pointer transition-all hover:scale-105
                            ${state.terrainSettings.selectedLayer === layerIndex 
                                ? "border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                                : "border-[#444] hover:border-zinc-400"}
                        `}
                        title={`Slot ${layerIndex}`}
                    >
                        {getTextureUrl(layerIndex) ? (
                            <img 
                                src={getTextureUrl(layerIndex)!} 
                                class="w-full h-full object-cover rounded-[2px]"
                            />
                        ) : (
                            <div class="w-full h-full bg-[#1e1e1e] flex items-center justify-center text-[6px] text-zinc-600">
                                Empty
                            </div>
                        )}

                        <div class="absolute bottom-0 right-0 bg-black/70 text-white text-[8px] px-1 rounded-tl">
                            {layerIndex}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TexturePalette;