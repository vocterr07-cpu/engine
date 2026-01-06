import { createSignal, For } from "solid-js"
import { state } from "../../engine/store";
import Terrain from "../../engine/Terrain";


interface Paint {
    name: string;
    url: string
}

const PAINTS: Paint[] = [
    { name: "Grass", url: "/paints/grass.webp" },
    { name: "Dirt", url: "/paints/dirt.jfif" },
    { name: "Sand", url: "/paints/sand.webp" }
]

const PaintSidebar = () => {
    const [selectedPaint, setSelectedPaint] = createSignal<Paint>(PAINTS[0]);

    const handleSelectPaint = (paint: Paint) => {
        setSelectedPaint(paint)
        let terrain = state.selectedObject
        if (!terrain || !(terrain instanceof Terrain)) return;
        const engine = state.engine;
        if (!engine) return;
        terrain.setLayerTexture(engine.gl, 1, selectedPaint().url);
    }

    return (
        <div class="absolute top-0 left-0 bg-zinc-800 flex flex-col gap-4 h-full w-full z-[50] p-4">
            <div class="grid grid-cols-3 gap-2  w-full ">
                <For each={PAINTS}>
                    {(paint) => (
                        <div onClick={() => handleSelectPaint(paint)} class="cursor-pointer flex flex-col bg-zinc-900 border border-zinc-900/50 rounded-lg shadow-[0_0_20px_-5px_rgba(0,0,0,0.5)]">
                            <img src={paint.url} alt={paint.name} />
                            <h1 class="text-zinc-100  text-xs font-mono p-1">{paint.name}</h1>
                        </div>
                    )}
                </For>
            </div>
        </div>
    )
}

export default PaintSidebar