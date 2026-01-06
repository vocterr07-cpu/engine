import { createEffect, createSignal, onCleanup, Show } from "solid-js"
import Explorer from "./Explorer/Explorer";
import SectionHeader from "../SectionHeader";
import { Expand, Scale, SlidersHorizontal, Wrench } from "lucide-solid";
import Properties from "./Properties/Properties";
import { state } from "../../engine/store";
import PaintSidebar from "./PaintSidebar";


const Sidebar = () => {
    const [isResizing, setIsResizing] = createSignal(false);
    const [width, setWidth] = createSignal(350);

    const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing()) return;
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 100 && newWidth < window.innerWidth * 0.5) {
            setWidth(newWidth);
        }
    }

    const stopResizing = () => {
        setIsResizing(false);
    }

    createEffect(() => {
        if (isResizing()) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", stopResizing);
        }
        onCleanup(() => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", stopResizing);
        })
    })
    return (
        <aside
            style={{ width: `${width()}px` }}
            class=' bg-zinc-800 relative border-l border-zinc-600 h-full p-2 gap-3 flex flex-col'
        >
            <div
                onMouseDown={() => setIsResizing(true)}
                class={`h-full w-1 z-10 absolute left-[-4px] cursor-ew-resize hover:bg-blue-600/50 transition-all`}
            >
            </div>
                <Show when={state.editMode === "paint"}>
                    <PaintSidebar/>
                </Show>
            
            <div class="flex flex-col gap-4 h-full w-full">
                <Explorer />
                <Properties />
            </div>

        </aside>
    )
}

export default Sidebar