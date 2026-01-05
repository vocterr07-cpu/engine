import { createSignal, For, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { 
    X, Search, Box, Volume2, ArrowRight, GitFork, Repeat, Clock, Terminal, Move, Variable, type LucideProps 
} from "lucide-solid";
import type { NodeType, NodeSchemas, NodeTitle, ScriptEvent, ScriptNode } from "../../engine/VisualScript";
import type { Component } from "solid-js";

interface Props {
    onClose: () => void;
    onSelect: (type: NodeType, title: string, defaultInputs: Record<string, string>, eventId?: string) => void;
    node?: ScriptNode;
}

interface ActionTemplate<K extends NodeTitle> {
    category: string;
    title: K;
    type: NodeType;
    inputs: NodeSchemas[K];
    icon: Component<LucideProps>;
    desc: string;
}

const createTemplate = <K extends NodeTitle>(t: ActionTemplate<K>) => t;

const ACTION_TEMPLATES = [
    // --- LOGIC ---
    createTemplate({ 
        category: "Logic", title: "If Condition", type: "logic", 
        inputs: { "Condition": "true" }, 
        icon: GitFork, desc: "Branch flow." 
    }),
    createTemplate({ 
        category: "Logic", title: "Wait", type: "action", 
        inputs: { "Seconds": "1.0" }, 
        icon: Clock, desc: "Delay execution." 
    }),
    createTemplate({ 
        category: "Logic", title: "Loop", type: "logic", 
        inputs: { "Count": "10" }, 
        icon: Repeat, desc: "Repeat N times." 
    }),
    // NOWE: Set Variable z domyślnym typem
    createTemplate({ 
        category: "Logic", title: "Set Variable", type: "action", 
        inputs: { "Name": "MyVar", "Value": "0", "Type": "INT" }, 
        icon: Variable, desc: "Store value." 
    }),
    
    // --- MOVEMENT ---
    createTemplate({ 
        category: "Movement", title: "Move Object", type: "action", 
        inputs: { "Speed": "5", "X": "0", "Y": "0" }, 
        icon: Move, desc: "Move object." 
    }),
    createTemplate({ 
        category: "Movement", title: "Teleport", type: "action", 
        inputs: { "Target": "Player" }, 
        icon: Box, desc: "Instant move." 
    }),
    
    // --- DEBUG ---
    createTemplate({ 
        category: "Debug", title: "Log Message", type: "action", 
        inputs: { "Message": "'Hello World'" }, 
        icon: Terminal, desc: "Print to console." 
    }),
    
    // --- AUDIO ---
    createTemplate({ 
        category: "Audio", title: "Play Sound", type: "action", 
        inputs: { "Clip": "'Jump.wav'", "Vol": "1.0" }, 
        icon: Volume2, desc: "Play clip." 
    }),
];

const CATEGORIES = ["All", "Logic", "Movement", "Debug", "Audio"];

const AddNodeModal = (props: Props) => {
    const [search, setSearch] = createSignal("");
    const [activeCategory, setActiveCategory] = createSignal("All");

    const getFilteredActions = () => {
        return ACTION_TEMPLATES.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(search().toLowerCase());
            const matchesCategory = activeCategory() === "All" || item.category === activeCategory();
            return matchesSearch && matchesCategory;
        });
    };

    return (
        <div 
            class="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()} 
        >
            {/* Backdrop */}
            <div onClick={props.onClose} class="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" />

            {/* Window */}
            <div class="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh] animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div class="p-4 border-b border-zinc-800 bg-zinc-900/90 flex items-center gap-4">
                    <div class="relative flex-1">
                        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search actions..." 
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
                    {/* Categories */}
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

                    {/* Actions Grid */}
                    <div class="flex-1 overflow-y-auto p-4 bg-zinc-950 custom-scrollbar">
                        <div class="grid grid-cols-2 gap-3">
                            <For each={getFilteredActions()}>
                                {item => (
                                    <button 
                                        onClick={() => {
                                            props.onSelect(item.type, item.title, item.inputs as any, props.node?.id);
                                            props.onClose();
                                        }}
                                        class="group flex items-start gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-purple-500/30 transition-all text-left hover:-translate-y-0.5"
                                    >
                                        <div class="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 group-hover:text-purple-400 group-hover:border-purple-500/20 transition-colors">
                                            <Dynamic component={item.icon} size={20} />
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <h3 class="text-sm font-bold text-zinc-200 group-hover:text-white truncate">{item.title}</h3>
                                            <p class="text-[10px] text-zinc-500 group-hover:text-zinc-400 truncate">{item.desc}</p>
                                        </div>
                                        <ArrowRight size={14} class="text-zinc-700 group-hover:text-purple-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                    </button>
                                )}
                            </For>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddNodeModal;