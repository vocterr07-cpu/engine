import { For } from "solid-js";
import { Dynamic } from "solid-js/web";
import { 
    PlayCircle, Timer, MousePointerClick, Touchpad, Keyboard, Zap, ChevronRight, type LucideProps 
} from "lucide-solid";
import type { Component } from "solid-js";
import type { EventName } from "../../engine/VisualScript";

interface Props {
    onSelect: (eventName: EventName) => void;
}

// 1. DANE I KOLORY
const THEMES: Record<string, { color: string }> = {
    "On Start":     { color: "blue" },
    "On Update":    { color: "emerald" },
    "On Click":     { color: "orange" },
    "On Mouse Click": { color: "orange" },
    "On Touch":     { color: "amber" },
    "On Key Press":  { color: "indigo" },
    "On Interact":  { color: "purple" }
};

interface EventsTypes {
    name: EventName;
    icon: Component<LucideProps>;
    desc: string;
}

const EVENTS: EventsTypes[] = [
    { name: "On Start", icon: PlayCircle, desc: "Run once on start" },
    { name: "On Update", icon: Timer, desc: "Run every frame" },
    { name: "On Click", icon: MousePointerClick, desc: "Object clicked" },
    { name: "On Key Press", icon: Keyboard, desc: "Keyboard input" },
    { name: "On Interact", icon: Zap, desc: "Custom interaction" },
];

const AddEventPopover = (props: Props) => {
    
    // Funkcja generująca style dla danego koloru
    const getStyle = (eventName: string) => {
        const c = THEMES[eventName]?.color || "zinc"; // domyślny kolor
        return {
            container: `hover:border-${c}-500/50 hover:bg-${c}-500/5 hover:shadow-[0_0_15px_-5px_rgba(0,0,0,0.5)] hover:shadow-${c}-500/10`,
            iconBox: `text-${c}-500 bg-${c}-500/10 border-${c}-500/20`,
            text: `group-hover:text-${c}-400`
        };
    };

    return (
        <div class="absolute left-full top-0 ml-3 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 slide-in-from-left-2 duration-200">
            
            {/* Header Dymka */}
            <div class="px-4 py-3 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur">
                <h3 class="text-xs font-black text-zinc-400 uppercase tracking-widest">Select Trigger</h3>
            </div>

            {/* Lista Scrollowalna */}
            <div class="max-h-[300px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                <For each={EVENTS}>
                    {(item) => {
                        const style = getStyle(item.name);
                        return (
                            <button 
                                onClick={() => props.onSelect(item.name)}
                                class={`group w-full flex items-center gap-3 p-2 rounded-lg border border-transparent transition-all duration-200 text-left ${style.container}`}
                            >
                                {/* IKONA */}
                                <div class={`p-2 rounded-md border transition-colors ${style.iconBox}`}>
                                    <Dynamic component={item.icon} size={16} />
                                </div>

                                {/* OPIS */}
                                <div class="flex-1 min-w-0">
                                    <div class={`text-xs font-bold text-zinc-300 transition-colors ${style.text}`}>
                                        {item.name}
                                    </div>
                                    <div class="text-[10px] text-zinc-600 truncate">
                                        {item.desc}
                                    </div>
                                </div>

                                {/* STRZAŁECZKA */}
                                <ChevronRight size={14} class="text-zinc-700 group-hover:text-zinc-500" />
                            </button>
                        );
                    }}
                </For>
            </div>
        </div>
    );
};

export default AddEventPopover;