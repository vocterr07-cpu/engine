import { Expand, SlidersHorizontal, Move, Maximize, Rotate3d } from "lucide-solid"
import SectionHeader from "../../SectionHeader"
import { state } from "../../../engine/store"
import { Show, For, onMount, onCleanup, createSignal } from "solid-js";
import PropertyRow from "./PropertyRow";

const AXES = [
    { label: "X", color: "text-red-500" },
    { label: "Y", color: "text-green-500" },
    { label: "Z", color: "text-blue-500" }
];

const Properties = () => {
    const [tick, setTick] = createSignal(0);
    let rafId: number;

    onMount(() => {
        let frameCount = 0;
        const updateLoop = () => {
            frameCount++;
            // Odświeżamy UI co 4 klatki (dla wydajności)
            if (frameCount % 4 === 0) setTick(t => t + 1);
            rafId = requestAnimationFrame(updateLoop);
        };
        rafId = requestAnimationFrame(updateLoop);
    });

    onCleanup(() => { if (rafId) cancelAnimationFrame(rafId); });

    const updatePosition = (axis: number, val: number) => {
        if (!state.selectedObject) return;
        state.selectedObject.position[axis] = val;
        state.version++; // To wymusza natychmiastową aktualizację suwaka
    };

    const updateScale = (axis: number, val: number) => {
        if (!state.selectedObject) return;
        state.selectedObject.scale[axis] = val;
        state.version++;
    };

    const updateRotation = (axis: number, val: number) => {
        if (!state.selectedObject) return;
        state.selectedObject.rotation[axis] = val;
        state.version++;
    }

    return (
        <div class="flex flex-col p-3 rounded-md bg-zinc-800 shadow-md shadow-zinc-950 h-[50%] overflow-y-auto">
            <SectionHeader icon={SlidersHorizontal} label="Properties" />
            
            <Show when={state.selectedObject} fallback={
                <div class="flex flex-col items-center justify-center py-10 opacity-30">
                    <SlidersHorizontal size={48} />
                    <p class="text-xs mt-2 text-zinc-400">Select an object</p>
                </div>
            }>
                {(obj) => (
                    <div class="flex flex-col mt-2 pt-4 border-t border-zinc-700 gap-4">
                        
                        {/* POSITION */}
                        <div class="bg-zinc-900 rounded-md p-3 shadow-inner flex flex-col gap-3">
                            <h1 class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-800 pb-2">
                                <Move size={12} /> Position
                            </h1>
                            <For each={AXES}>{(axis, index) => (
                                <PropertyRow 
                                    label={axis.label}
                                    colorClass={axis.color}
                                    // MAGIA: Obserwujemy tick (silnik) ORAZ version (edycja usera)
                                    value={(tick(), state.version, obj().position[index()])}
                                    onInput={(val) => updatePosition(index(), val)}
                                    min={-50} max={50}
                                />
                            )}</For>
                        </div>

                        {/* SCALE */}
                        <div class="bg-zinc-900 rounded-md p-3 shadow-inner flex flex-col gap-3">
                            <h1 class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-800 pb-2">
                                <Maximize size={12} /> Scale
                            </h1>
                            <For each={AXES}>{(axis, index) => (
                                <PropertyRow 
                                    label={axis.label}
                                    colorClass={axis.color}
                                    value={(tick(), state.version, obj().scale[index()])}
                                    onInput={(val) => updateScale(index(), val)}
                                    min={0.1} max={20}
                                />
                            )}</For>
                        </div>

                        <div class="bg-zinc-900 rounded-md p-3 shadow-inner flex flex-col gap-3">
                            <h1 class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-800 pb-2">
                                <Rotate3d size={12} /> Rotation
                            </h1>
                            <For each={AXES}>
                                {(axis, index) => (
                                    <PropertyRow
                                        label={axis.label}
                                        colorClass={axis.color}
                                        value={(tick(), state.version, obj().rotation[index()])}
                                        onInput={(val) => updateRotation(index(), val)}
                                        min={-360}
                                        max={360}
                                    />
                                )}
                            </For>
                        </div>

                    </div>
                )}
            </Show>
        </div>
    )
}

export default Properties;