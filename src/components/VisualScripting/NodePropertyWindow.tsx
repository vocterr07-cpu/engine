import { createSignal, For, Show, Match, Switch } from "solid-js";
import {
    X, Trash2, Save, Variable, Type, Hash, ToggleLeft,
    Play, Volume2, Gamepad2, MousePointer2, Box, ArrowRight, LayoutList,
    Database
} from "lucide-solid";
import type { ScriptNode, NodeSchemas } from "../../engine/VisualScript";
import GlobalVariablesListNodePropertyWindow from "./GlobalVariablesListNodePropertyWindow";
import { state } from "../../engine/store";

interface Props {
    node: ScriptNode;
    onClose: () => void;
    // Funkcja odświeżająca w rodzicu
    onUpdate: (nodeId: string, inputs: Record<string, string>) => void;
    onDelete: (nodeId: string) => void;
}

const NodePropertyWindow = (props: Props) => {
    // Lokalna kopia inputów, żeby edycja była płynna
    // (SolidJS Proxy jest szybki, ale przy inputach textowych lepiej mieć lokalny stan i robić sync)
    const [inputs, setInputs] = createSignal({ ...props.node.inputs });
    const [keyName, setKeyName] = createSignal("");

    const handleInput = (key: string, value: string) => {
        const newInputs = { ...inputs(), [key]: value };
        setInputs(newInputs);
        // Od razu wysyłamy do silnika (Live Edit)
        props.onUpdate(props.node.id, newInputs);
    };

    const handleVariableClick = (id: string) => {
        const variable = state.variables.find(v => v.id === id);
        if (!variable) return;
        const newInputs = { ...inputs(), [keyName()]: `${inputs()[keyName()]} ${`gv.get.${variable.name}`}` };
        setInputs(newInputs);
        props.onUpdate(props.node.id, newInputs);
    }

    // --- SUB-KOMPONENTY UI DLA RÓŻNYCH TYPÓW ---

    // 1. DLA "IF CONDITION" - Logic Wizard
    const LogicEditor = () => {
        setKeyName("Condition")
        const presets = [
            { label: "Check Key Press", code: "Input.IsPressed('Space')", icon: Gamepad2 },
            { label: "Check Variable", code: "Variables.Get('HP') > 0", icon: Variable },
            { label: "Always True", code: "true", icon: ArrowRight },
        ];

        return (
            <div class="space-y-4">
                <div class="space-y-2">
                    <label class="text-xs font-bold text-zinc-500 uppercase">Condition Expression</label>
                    <div class="relative">
                        <input
                            type="text"
                            value={inputs()["Condition"] || ""}
                            onInput={(e) => handleInput("Condition", e.currentTarget.value)}
                            class="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 font-mono text-sm text-purple-400 focus:border-purple-500 outline-none"
                        />
                    </div>
                </div>

                {/* Szybkie szablony */}
                <div class="space-y-2">
                    <label class="text-[10px] font-bold text-zinc-600 uppercase">Quick Templates</label>
                    <div class="flex gap-2">
                        <For each={presets}>
                            {preset => (
                                <button
                                    onClick={() => handleInput("Condition", preset.code)}
                                    class="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md hover:border-purple-500/50 hover:bg-purple-500/10 transition-all text-xs text-zinc-400"
                                >
                                    <preset.icon size={12} />
                                    {preset.label}
                                </button>
                            )}
                        </For>
                    </div>
                </div>
            </div>
        )
    };

    // 2. DLA "SET VARIABLE" - Smart Type Switching
    const VariableEditor = () => {
        const types = ["INT", "FLOAT", "STR", "BOOL"];
        const currentType = inputs()["Type"] || "STR";

        return (
            <div class="space-y-4">
                {/* Nazwa zmiennej */}
                <div class="space-y-1">
                    <label class="text-xs font-bold text-zinc-500 uppercase">Variable Name</label>
                    <input
                        type="text"
                        value={inputs()["Name"] || ""}
                        onInput={(e) => handleInput("Name", e.currentTarget.value)}
                        class="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-zinc-200 focus:border-purple-500 outline-none"
                    />
                </div>

                {/* Typ Danych */}
                <div class="flex gap-1 p-1 bg-zinc-900 rounded-lg border border-zinc-800">
                    <For each={types}>
                        {t => (
                            <button
                                onClick={() => handleInput("Type", t)}
                                class={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${currentType === t ? "bg-purple-500 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                                    }`}
                            >
                                {t}
                            </button>
                        )}
                    </For>
                </div>

                {/* Wartość (Zmienia się zależnie od typu) */}
                <div class="space-y-1">
                    <label class="text-xs font-bold text-zinc-500 uppercase">Value</label>

                    <Switch>
                        <Match when={currentType === "BOOL"}>
                            <button
                                onClick={() => handleInput("Value", inputs()["Value"] === "true" ? "false" : "true")}
                                class={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${inputs()["Value"] === "true"
                                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                                    : "bg-red-500/10 border-red-500/50 text-red-400"
                                    }`}
                            >
                                <span class="font-bold">{inputs()["Value"] === "true" ? "TRUE" : "FALSE"}</span>
                                <ToggleLeft size={20} class={inputs()["Value"] === "true" ? "rotate-180" : ""} />
                            </button>
                        </Match>
                        <Match when={currentType === "INT" || currentType === "FLOAT"}>
                            <div class="relative">
                                <Hash size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                                <input
                                    type="number"
                                    step={currentType === "FLOAT" ? "0.1" : "1"}
                                    value={inputs()["Value"] || "0"}
                                    onInput={(e) => handleInput("Value", e.currentTarget.value)}
                                    class="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 p-2 text-blue-400 font-mono focus:border-purple-500 outline-none"
                                />
                            </div>
                        </Match>
                        <Match when={currentType === "STR"}>
                            <div class="relative">
                                <Type size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                                <input
                                    type="text"
                                    value={inputs()["Value"] || ""}
                                    onInput={(e) => handleInput("Value", e.currentTarget.value)}
                                    class="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 p-2 text-yellow-400 font-mono focus:border-purple-500 outline-none"
                                />
                            </div>
                        </Match>
                    </Switch>
                </div>
            </div>
        )
    }

    // 3. DLA "MOVE" / "TELEPORT"
    const TransformEditor = () => (
        <div class="space-y-4">
            {inputs()["Speed"] !== undefined && (
                <div class="space-y-1">
                    <div class="flex justify-between">
                        <label class="text-xs font-bold text-zinc-500 uppercase">Movement Speed</label>
                        <span class="text-xs font-mono text-purple-400">{inputs()["Speed"]}</span>
                    </div>
                    <input
                        type="range" min="0" max="50" step="0.5"
                        value={inputs()["Speed"]}
                        onInput={(e) => handleInput("Speed", e.currentTarget.value)}
                        class="w-full accent-purple-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            )}

            {/* X / Y Inputs */}
            <div class="grid grid-cols-2 gap-4">
                {["X", "Y"].map(axis => (
                    inputs()[axis] !== undefined && (
                        <div class="relative">
                            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-600">{axis}</span>
                            <input
                                type="number"
                                value={inputs()[axis]}
                                onInput={(e) => handleInput(axis, e.currentTarget.value)}
                                class="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-8 p-2 text-zinc-200 font-mono text-sm focus:border-purple-500 outline-none"
                            />
                        </div>
                    )
                ))}
            </div>

            {inputs()["Target"] !== undefined && (
                <div class="space-y-1">
                    <label class="text-xs font-bold text-zinc-500 uppercase">Target Object</label>
                    <div class="relative">
                        <Box size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                        <input
                            type="text"
                            value={inputs()["Target"]}
                            onInput={(e) => handleInput("Target", e.currentTarget.value)}
                            class="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 p-2 text-zinc-200 focus:border-purple-500 outline-none"
                        />
                    </div>
                </div>
            )}
        </div>
    );

    // 4. DLA "PLAY SOUND"
    const AudioEditor = () => (
        <div class="space-y-4">
            <div class="space-y-1">
                <label class="text-xs font-bold text-zinc-500 uppercase">Audio Clip Name</label>
                <div class="relative">
                    <Volume2 size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input
                        type="text"
                        value={inputs()["Clip"] || ""}
                        onInput={(e) => handleInput("Clip", e.currentTarget.value)}
                        class="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 p-2 text-zinc-200 focus:border-purple-500 outline-none"
                    />
                </div>
            </div>
            <div class="space-y-1">
                <div class="flex justify-between">
                    <label class="text-xs font-bold text-zinc-500 uppercase">Volume</label>
                    <span class="text-xs font-mono text-purple-400">{Math.round(parseFloat(inputs()["Vol"] || "0") * 100)}%</span>
                </div>
                <input
                    type="range" min="0" max="1" step="0.1"
                    value={inputs()["Vol"] || "1"}
                    onInput={(e) => handleInput("Vol", e.currentTarget.value)}
                    class="w-full accent-purple-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>
    );

    // 5. GENERIC FALLBACK (Dla Log Message, Wait, Loop)
    // 5. GENERIC FALLBACK (Dla Log Message, Wait, Loop)
    const GenericEditor = () => {
        // Pobieramy klucze RAZ (nie będą reaktywne w kontekście pętli, co jest dobre!)
        const keys = Object.keys(props.node.inputs);

        return (
            <div class="space-y-4">
                <For each={keys}>
                    {(key) => {
                        // Pomijamy Type, bo SetVariable go obsługuje inaczej
                        if (key === "Type") return null;

                        return (
                            <div class="space-y-1">
                                <label class="text-xs font-bold text-zinc-500 uppercase">{key}</label>
                                <input
                                    type={key === "Count" || key === "Seconds" ? "number" : "text"}
                                    // Pobieramy wartość reaktywnie z sygnału inputs() po kluczu 
                                    value={inputs()[key] || ""}
                                    onInput={(e) => handleInput(key, e.currentTarget.value)}
                                    class="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-zinc-200 focus:border-purple-500 outline-none transition-all"
                                />
                            </div>
                        );
                    }}
                </For>
            </div>
        );
    };

    return (
        <>
            <div
                onClick={props.onClose}
                class='fixed inset-0 top-0 left-0 bg-black/60 backdrop-blur-[2px] z-[990] animate-in fade-in duration-200'
            />

            <div class='fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] flex flex-col z-[999] bg-zinc-950 w-[400px] rounded-xl border border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden'>

                {/* HEADER */}
                <nav class='flex items-center justify-between px-5 py-4 border-b border-zinc-900 bg-zinc-900/50'>
                    <div class='flex items-center gap-3'>
                        <div class="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                            <LayoutList class='text-purple-400' size={18} />
                        </div>
                        <div>
                            <h1 class='text-zinc-100 font-bold text-sm tracking-wide uppercase'>{props.node.title}</h1>
                            <p class="text-[10px] text-zinc-500 font-mono tracking-widest">{props.node.type} Node</p>
                        </div>
                    </div>
                    <button onClick={props.onClose} class="text-zinc-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </nav>

                {/* CONTENT - DYNAMICZNY SWITCH */}
                <div class="p-5">
                    <Switch fallback={<GenericEditor />}>
                        <Match when={props.node.title === "If Condition"}>
                            <LogicEditor />
                        </Match>
                        <Match when={props.node.title === "Set Variable"}>
                            <VariableEditor />
                        </Match>
                        <Match when={props.node.title === "Move Object" || props.node.title === "Teleport"}>
                            <TransformEditor />
                        </Match>
                        <Match when={props.node.title === "Play Sound"}>
                            <AudioEditor />
                        </Match>
                    </Switch>
                </div>

                {/* FOOTER */}
                <div class="px-5 py-3 bg-zinc-900/30 border-t border-zinc-900 flex justify-between items-center">
                    <button
                        onClick={() => props.onDelete(props.node.id)}
                        class="flex items-center gap-2 text-[10px] font-bold text-red-500/60 hover:text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-lg transition-all"
                    >
                        <Trash2 size={14} />
                        DELETE
                    </button>

                    <button
                        onClick={props.onClose}
                        class="flex items-center gap-2 text-[10px] font-bold text-zinc-900 bg-zinc-200 hover:bg-white px-4 py-2 rounded-lg transition-all shadow-lg"
                    >
                        <Save size={14} />
                        DONE
                    </button>
                </div>
            </div>

            <GlobalVariablesListNodePropertyWindow
                onVariableClick={handleVariableClick}
            />
        </>
    )
}

export default NodePropertyWindow;