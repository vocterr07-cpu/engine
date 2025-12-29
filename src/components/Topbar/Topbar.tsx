import type { Component } from "solid-js";
import { Box } from "lucide-solid"
import { state, storeActions } from "../../engine/store";
import Cube from "../../engine/Cube";
import FPSCounter from "../FpsCounter";

const Topbar: Component<{}> = () => {
    const handleAddCube = () => {
        const engine = state.engine;
        if (!engine) return;
        const objLen = state.objects.length;
        const newCube = new Cube(`Cube_${objLen}`, engine.gl, [Math.random() * 2, Math.random() * 2, Math.random() * 2], [1, 1, 1]);
        const addObject = storeActions.addObject;
        addObject(newCube);
    }
    return (
        <nav class='flex h-14 flex-shrink-0 px-10 text-zinc-300 bg-zinc-800 border-b border-zinc-600 items-center justify-between'>
            <div class="flex items-center gap-2">

            </div>
            <div class="flex items-center gap-2">
                <FPSCounter/>
                <button onclick={handleAddCube} class="p-2 transition-colors rounded-md hover:bg-zinc-700">
                    <Box/>
                </button>
            </div>
        </nav>
    )
};

export default Topbar;