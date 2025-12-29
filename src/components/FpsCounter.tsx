import { createSignal, onMount, onCleanup } from "solid-js";
import { state } from "../engine/store";

const FPSCounter = () => {
    const [fps, setFps] = createSignal(0);
    let interval: number;

    onMount(() => {
        // Sprawdzamy wartość z silnika co 500ms (nie za często, by oszczędzać UI)
        interval = window.setInterval(() => {
            if (state.engine) {
                setFps(state.engine.fps);
            }
        }, 500);
    });

    onCleanup(() => clearInterval(interval));

    return (
        <div class="flex items-center gap-1.5 px-2 py-1 bg-black/20 rounded border border-white/5 font-mono text-[10px]">
            <div class="w-1.5 h-1.5 rounded-full" 
                 classList={{
                     "bg-green-500": fps() >= 55,
                     "bg-yellow-500": fps() < 55 && fps() >= 30,
                     "bg-red-500": fps() < 30
                 }}
            />
            <span class="text-zinc-400">FPS:</span>
            <span class="text-zinc-100 font-bold">{fps()}</span>
        </div>
    );
};

export default FPSCounter;