import { Show, type Component, createSignal, For } from "solid-js";
import { Box, Play, Languages, Search, X, Database } from "lucide-solid"; // Dodano nowe ikony
import { state, storeActions } from "../../engine/store";
import Cube from "../../engine/Cube";
import FPSCounter from "../FpsCounter";
import PlayButton from "./ModeButtons/PlayButton";
import StopButton from "./ModeButtons/StopButton";
import ImportOBJButton from "./ImportOBJButton";
import TopbarLeftSide from "./LeftSide/TopbarLeftSide";
import LanguageModal from "./LanguageModal";

// Lista języków - możesz ją przenieść do osobnego pliku konfiguracyjnego


const Topbar: Component<{}> = () => {


    const handleAddCube = () => {
        const engine = state.engine;
        if (!engine) return;
        const objLen = state.objects.length;
        const newCube = new Cube(`Cube_${objLen}`, engine.gl, [Math.random() * 2, Math.random() * 2, Math.random() * 2], [1, 1, 1]);
        const addObject = storeActions.addObject;
        addObject(newCube);
    }

    // Filtrowanie języków
   

    return (
        <>
            <nav class='flex h-14 flex-shrink-0 px-10 text-zinc-300 bg-zinc-800 border-b border-zinc-600 items-center justify-between relative z-40'>
                {/* LEWA STRONA - JĘZYKI */}
                <TopbarLeftSide/>

                <div class="flex items-center gap-2">
                    <button
                        onClick={() => storeActions.setOpenedWindow("globalVariables")}
                        class={`p-2 rounded-md transition-all ease-in-out duration-300 flex items-center gap-2 ${state.openedWindow === "globalVariables"
                                ? "bg-purple-600/20 hover:bg-purple-600/40 text-purple-400"
                                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                            }`}
                        title="Global Variables"
                    >
                        <Database size={18} />
                        <span class="text-[10px] font-black uppercase tracking-widest hidden lg:block">Global Variables</span>
                    </button>
                </div>

                {/* PRAWA STRONA - NARZĘDZIA */}
                <div class="flex items-center gap-2">
                    <Show when={state.mode === "camera"} fallback={<StopButton />}>
                        <PlayButton />
                    </Show>

                    <div class="h-6 w-[1px] bg-zinc-700 mx-2"></div> {/* Separator */}

                    <FPSCounter />

                    <button onclick={handleAddCube} class="p-2 transition-colors rounded-md hover:bg-zinc-700 text-zinc-400 hover:text-white" title="Add Cube">
                        <Box size={18} />
                    </button>
                </div>
            </nav>


        </>
    )
};

export default Topbar;