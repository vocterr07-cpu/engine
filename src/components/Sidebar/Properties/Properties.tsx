import { SlidersHorizontal, Move, Maximize, Rotate3d, Box } from "lucide-solid"
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
            if (frameCount % 4 === 0) setTick(t => t + 1);
            rafId = requestAnimationFrame(updateLoop);
        };
        rafId = requestAnimationFrame(updateLoop);
    });

    onCleanup(() => { if (rafId) cancelAnimationFrame(rafId); });

    const updatePosition = (axis: number, val: number) => {
        if (!state.selectedObject) return;
        state.selectedObject.position[axis] = val;
        state.version++; 
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

    const addLocalVar = (name: string, type: "number" | "boolean" | "string") => {
        if (!state.selectedObject) return;
        let defaultValue: any = 0;
        if (type === "boolean") defaultValue = false;
        if (type === "string") defaultValue = "";

        state.selectedObject.variables.push({
            id: crypto.randomUUID(),
            name, type, value: defaultValue
        });
        state.version++; // Ważne, żeby odświeżyć UI
    };

    const removeLocalVar = (id: string) => {
        if (!state.selectedObject) return;
        const index = state.selectedObject.variables.findIndex(v => v.id === id);
        if (index !== -1) state.selectedObject.variables.splice(index, 1);
        state.version++;
    };

    const updateLocalVar = (id: string, val: any) => {
        if (!state.selectedObject) return;
        const v = state.selectedObject.variables.find(v => v.id === id);
        if (v) v.value = val;
        // state.version++; // Tu zazwyczaj nie trzeba, bo Solid jest reaktywny głęboko
    };

    return (
        // ZMIANY STYLI GŁÓWNEGO KONTENERA:
        <div class="flex flex-col h-[50%] rounded-lg bg-zinc-900 border border-zinc-700/60 shadow-xl shadow-black/40 overflow-hidden">
            
            {/* Header */}
            <div class="bg-zinc-900/50 p-3 border-b border-zinc-800">
                <SectionHeader icon={SlidersHorizontal} label="Properties" />
            </div>
            
            <div class="flex-1 overflow-y-auto custom-scrollbar p-3">
                <Show when={state.selectedObject} fallback={
                    <div class="flex flex-col items-center justify-center h-full opacity-20">
                        <SlidersHorizontal size={48} strokeWidth={1} />
                        <p class="text-xs mt-3 font-mono uppercase tracking-widest">No Selection</p>
                    </div>
                }>
                    {(obj) => (
                        <div class="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            
                            {/* POSITION GROUP */}
                            <div class="bg-black/20 rounded border border-white/5 p-3 flex flex-col gap-3">
                                <h1 class="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                                    <Move size={12} class="text-zinc-400"/> Position
                                </h1>
                                <For each={AXES}>{(axis, index) => (
                                    <PropertyRow 
                                        label={axis.label}
                                        colorClass={axis.color}
                                        value={(tick(), state.version, obj().position[index()])}
                                        onInput={(val) => updatePosition(index(), val)}
                                        min={-50} max={50}
                                    />
                                )}</For>
                            </div>

                            {/* SCALE GROUP */}
                            <div class="bg-black/20 rounded border border-white/5 p-3 flex flex-col gap-3">
                                <h1 class="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                                    <Maximize size={12} class="text-zinc-400"/> Scale
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

                            {/* ROTATION GROUP */}
                            <div class="bg-black/20 rounded border border-white/5 p-3 flex flex-col gap-3">
                                <h1 class="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                                    <Rotate3d size={12} class="text-zinc-400"/> Rotation
                                </h1>
                                <For each={AXES}>{(axis, index) => (
                                    <PropertyRow
                                        label={axis.label}
                                        colorClass={axis.color}
                                        value={(tick(), state.version, obj().rotation[index()])}
                                        onInput={(val) => updateRotation(index(), val)}
                                        min={-360} max={360}
                                    />
                                )}</For>
                            </div>
                            <div class="bg-black/20 rounded border border-white/5 p-3 flex flex-col gap-3">
                                
                            </div>

                        </div>
                    )}
                </Show>
            </div>
        </div>
    )
}

export default Properties;