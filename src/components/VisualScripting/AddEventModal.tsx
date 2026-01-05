import { createSignal, For, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { 
    PlayCircle, Timer, MousePointerClick, Touchpad, Keyboard, Zap, ChevronRight, X, Search, type LucideProps 
} from "lucide-solid";
import type { Component } from "solid-js";
import type { EventName } from "../../engine/VisualScript";

interface Props {
    onClose: () => void;
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
    category: string; // Dodałem kategorię do filtrowania
    icon: Component<LucideProps>;
    desc: string;
}

const EVENTS: EventsTypes[] = [
    { name: "On Start", category: "Lifecycle", icon: PlayCircle, desc: "Run once on start" },
    { name: "On Update", category: "Lifecycle", icon: Timer, desc: "Run every frame" },
    { name: "On Click", category: "Input", icon: MousePointerClick, desc: "Object clicked" },
    { name: "On Mouse Click", category: "Input", icon: MousePointerClick, desc: "Global click" },
    { name: "On Touch", category: "Input", icon: Touchpad, desc: "Touch input" },
    { name: "On Key Press", category: "Input", icon: Keyboard, desc: "Keyboard input" },
    { name: "On Interact", category: "Custom", icon: Zap, desc: "Custom interaction" },
];

const CATEGORIES = ["All", "Lifecycle", "Input", "Custom"];

const AddEventModal = (props: Props) => {
    const [search, setSearch] = createSignal("");
    const [activeCategory, setActiveCategory] = createSignal("All");

    // Funkcja generująca style dla danego koloru (Dostosowana do większych kart)
    const getStyle = (eventName: string) => {
        const c = THEMES[eventName]?.color || "zinc"; 
        return {
            container: `hover:border-${c}-500/50 hover:bg-${c}-500/5 hover:shadow-[0_0_20px_-5px_rgba(0,0,0,0.5)] hover:shadow-${c}-500/10`,
            iconBox: `text-${c}-500 bg-${c}-500/10 border-${c}-500/20`,
            text: `group-hover:text-${c}-400`
        };
    };

    // Filtrowanie
    const getFilteredEvents = () => {
        return EVENTS.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(search().toLowerCase());
            const matchesCategory = activeCategory() === "All" || item.category === activeCategory();
            return matchesSearch && matchesCategory;
        });
    };

    return (
            <div 
                class="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()} // Zapobiegamy zamykaniu przy kliknięciu w tło kontenera
            >
                {/* Backdrop */}
                <div 
                    onClick={props.onClose} 
                    class="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" 
                />

                {/* Window */}
                <div class="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh] animate-in zoom-in-95 duration-200">
                    
                    {/* Header & Search */}
                    <div class="p-4 border-b border-zinc-800 bg-zinc-900/90 flex items-center gap-4">
                        <div class="relative flex-1">
                            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search event triggers..." 
                                value={search()}
                                onInput={(e) => setSearch(e.currentTarget.value)}
                                class="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-purple-500/50 transition-colors"
                            />
                        </div>
                        <button onClick={props.onClose} class="text-zinc-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div class="flex flex-1 overflow-hidden">
                        
                        {/* Sidebar Categories */}
                        <div class="w-48 border-r border-zinc-800 bg-zinc-950/30 p-2 space-y-1">
                            <For each={CATEGORIES}>
                                {cat => (
                                    <button 
                                        onClick={() => setActiveCategory(cat)}
                                        class={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors
                                            ${activeCategory() === cat 
                                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                                                : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 border border-transparent"}
                                        `}
                                    >
                                        {cat}
                                    </button>
                                )}
                            </For>
                        </div>

                        {/* Grid of Events */}
                        <div class="flex-1 overflow-y-auto p-4 bg-zinc-950 custom-scrollbar">
                            <div class="grid grid-cols-2 gap-3">
                                <For each={getFilteredEvents()}>
                                    {item => {
                                        const style = getStyle(item.name);
                                        return (
                                            <button 
                                                onClick={() => {
                                                    props.onSelect(item.name);
                                                    props.onClose();
                                                }}
                                                class={`group flex items-start gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 transition-all text-left hover:-translate-y-0.5 ${style.container}`}
                                            >
                                                {/* IKONA */}
                                                <div class={`p-2 rounded-lg transition-colors ${style.iconBox}`}>
                                                    <Dynamic component={item.icon} size={20} />
                                                </div>
                                                
                                                {/* OPIS */}
                                                <div class="flex-1 min-w-0">
                                                    <h3 class={`text-sm font-bold text-zinc-200 transition-colors truncate ${style.text}`}>
                                                        {item.name}
                                                    </h3>
                                                    <p class="text-[10px] text-zinc-500 group-hover:text-zinc-400 truncate">
                                                        {item.desc}
                                                    </p>
                                                </div>

                                                {/* STRZAŁECZKA */}
                                                <ChevronRight size={14} class="text-zinc-700 group-hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                            </button>
                                        );
                                    }}
                                </For>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
    );
};

export default AddEventModal;