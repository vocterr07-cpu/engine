import { Box, Hash, Type, ToggleLeft, Pencil, Trash, Check, X, BoxSelect, ChevronDown } from "lucide-solid"
import { For, Show, createSignal, Switch, Match } from "solid-js"
import { storeActions } from "../../engine/store"
import type { GameVariable } from "../../engine/store"
import { Dynamic } from "solid-js/web"
import { parseNumericInput } from "../../helpers/parseNumericInput"

// Definicja typów (żeby mieć ikonki i domyślne wartości w edycji)
const dataTypes = [
    { label: "Integer", code: "INT", icon: Hash, default: 0 },
    { label: "Float", code: "FLOAT", icon: Hash, default: 0.0 },
    { label: "String", code: "STR", icon: Type, default: "" },
    { label: "Boolean", code: "BOOL", icon: ToggleLeft, default: false },
    { label: "Object Ref", code: "OBJ", icon: Box, default: null },
] as const;

// Helper do szybkiego pobierania ikony na podstawie kodu string (np. "INT")
const getTypeConfig = (code: string) => dataTypes.find(t => t.code === code) || dataTypes[0];

// === POJEDYNCZY WIERSZ Z EDYCJĄ ===
const VariableRow = (props: { variable: GameVariable }) => {
    const [isEditing, setIsEditing] = createSignal(false);
    
    // Stan edycji
    const [editName, setEditName] = createSignal(props.variable.name);
    const [editType, setEditType] = createSignal(getTypeConfig(props.variable.type)); // Przechowujemy cały obiekt typu
    const [editValue, setEditValue] = createSignal(props.variable.value);
    
    // Stan dropdowna w edycji
    const [isTypeMenuOpen, setIsTypeMenuOpen] = createSignal(false);

    // Zmiana typu resetuje wartość (żeby nie mieć tekstu w liczbie)
    const handleTypeChange = (newType: typeof dataTypes[number]) => {
        setEditType(newType);
        setEditValue(newType.default);
        setIsTypeMenuOpen(false);
    }

    const handleSave = () => {
        storeActions.updateVariable(props.variable.id, {
            name: editName(),
            type: editType().code as any, // zapisujemy sam kod np. "INT"
            value: editValue()
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        // Reset do starych wartości
        setEditName(props.variable.name);
        setEditType(getTypeConfig(props.variable.type));
        setEditValue(props.variable.value);
        setIsEditing(false);
    };

    const handleDelete = () => {
        // Confirm jest brzydki, ale skuteczny na start. Pózniej zrobisz modal.
        if (confirm(`Delete variable "${props.variable.name}"?`)) {
            storeActions.removeVariable(props.variable.id);
        }
    };

    return (
        <div class={`group flex flex-col border-b border-zinc-800 transition-colors ${isEditing() ? 'bg-zinc-900/80 py-2' : 'hover:bg-zinc-900/40'}`}>
            
            {/* --- TRYB PODGLĄDU --- */}
            <Show when={!isEditing()}>
                <div class="flex items-center px-6 h-10 gap-4">
                    
                    {/* 1. Name */}
                    <div class="w-1/3 flex items-center gap-3 min-w-0">
                        <Dynamic component={getTypeConfig(props.variable.type).icon} size={14} class="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                        <span class="font-bold text-zinc-300 text-sm truncate select-all">{props.variable.name}</span>
                    </div>

                    {/* 2. Type Badge */}
                    <div class="w-24">
                        <span class="text-[9px] font-bold font-mono text-zinc-500 bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 rounded uppercase">
                            {props.variable.type}
                        </span>
                    </div>

                    {/* 3. Value Preview */}
                    <div class="flex-1 text-right font-mono text-xs truncate">
                        <Switch>
                            <Match when={props.variable.type === "Boolean"}>
                                <span class={props.variable.value ? "text-purple-400" : "text-zinc-600"}>
                                    {String(props.variable.value).toUpperCase()}
                                </span>
                            </Match>
                            <Match when={props.variable.type === "String"}>
                                <span class="text-yellow-500">"{props.variable.value}"</span>
                            </Match>
                            <Match when={props.variable.type === "Object Ref"}>
                                <span class="text-blue-400">
                                    {props.variable.value ? `@${props.variable.value.name}` : "null"}
                                </span>
                            </Match>
                            <Match when={true}>
                                <span class="text-green-400">{props.variable.value}</span>
                            </Match>
                        </Switch>
                    </div>

                    {/* 4. Actions Hover */}
                    <div class="w-16 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setIsEditing(true)} class="p-1.5 text-zinc-500 hover:text-blue-400 hover:bg-zinc-800 rounded">
                            <Pencil size={12} />
                        </button>
                        <button onClick={handleDelete} class="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded">
                            <Trash size={12} />
                        </button>
                    </div>
                </div>
            </Show>

            {/* --- TRYB EDYCJI (INLINE) --- */}
            <Show when={isEditing()}>
                <div class="px-6 flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-150">
                    
                    {/* A. Edit Name */}
                    <div class="w-1/3">
                        <label class="text-[9px] text-zinc-600 font-bold uppercase ml-1">Name</label>
                        <input 
                            type="text" 
                            value={editName()}
                            onInput={(e) => setEditName(e.currentTarget.value)}
                            class="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none h-8"
                        />
                    </div>

                    {/* B. Edit Type (DROPDOWN MODAL) */}
                    <div class="w-32 relative">
                        <label class="text-[9px] text-zinc-600 font-bold uppercase ml-1">Type</label>
                        <button 
                            onClick={() => setIsTypeMenuOpen(!isTypeMenuOpen())}
                            class="w-full flex items-center justify-between bg-zinc-950 border border-zinc-700 rounded px-2 h-8 text-xs text-zinc-300 hover:border-zinc-500"
                        >
                            <div class="flex items-center gap-2">
                                <Dynamic component={editType().icon} size={12} class="text-blue-400"/>
                                <span>{editType().code}</span>
                            </div>
                            <ChevronDown size={12} class="text-zinc-500"/>
                        </button>

                        {/* Dropdown Content */}
                        <Show when={isTypeMenuOpen()}>
                            <div class="fixed inset-0 z-[50]" onClick={() => setIsTypeMenuOpen(false)}></div>
                            <div class="absolute top-full left-0 mt-1 w-48 bg-zinc-900 border border-zinc-700 rounded shadow-xl z-[60] flex flex-col p-1">
                                <For each={dataTypes}>
                                    {(type) => (
                                        <button 
                                            onClick={() => handleTypeChange(type)}
                                            class={`flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-zinc-800 text-xs ${editType().code === type.code ? 'bg-blue-900/20 text-blue-200' : 'text-zinc-400'}`}
                                        >
                                            <Dynamic component={type.icon} size={12} />
                                            <span class="font-bold">{type.code}</span>
                                        </button>
                                    )}
                                </For>
                            </div>
                        </Show>
                    </div>

                    {/* C. Edit Value */}
                    <div class="flex-1">
                        <label class="text-[9px] text-zinc-600 font-bold uppercase ml-1">Value</label>
                        <Switch>
                             <Match when={editType().code === "BOOL"}>
                                <button onClick={() => setEditValue(!editValue())} class={`w-full h-8 flex items-center gap-2 px-2 rounded border ${editValue() ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-zinc-700 bg-zinc-950 text-zinc-500'}`}>
                                    <div class={`w-3 h-3 border flex items-center justify-center ${editValue() ? 'bg-purple-400 border-purple-400 text-black' : 'border-zinc-600'}`}>
                                        <Show when={editValue()}><Check size={8} strokeWidth={4}/></Show>
                                    </div>
                                    <span class="text-xs font-bold">{editValue() ? "TRUE" : "FALSE"}</span>
                                </button>
                             </Match>
                             <Match when={editType().code === "STR"}>
                                <input type="text" value={editValue()} onInput={(e) => setEditValue(e.currentTarget.value)} class="w-full bg-zinc-950 border border-zinc-700 rounded px-2 h-8 text-xs text-yellow-400 font-mono outline-none focus:border-yellow-600"/>
                             </Match>
                             <Match when={true}>
                                <input type="text" value={editValue()} onInput={(e) => {
                                    const v = parseNumericInput(e.currentTarget.value);
                                    setEditValue(v ?? 0);
                                }} class="w-full bg-zinc-950 border border-zinc-700 rounded px-2 h-8 text-xs text-green-400 font-mono outline-none focus:border-green-600"/>
                             </Match>
                        </Switch>
                    </div>

                    {/* D. Buttons */}
                    <div class="flex items-center gap-1 mt-4">
                        <button onClick={handleSave} class="p-1.5 bg-green-600 hover:bg-green-500 text-white rounded shadow-lg h-8 w-8 flex items-center justify-center">
                            <Check size={14} />
                        </button>
                        <button onClick={handleCancel} class="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded border border-zinc-700 h-8 w-8 flex items-center justify-center">
                            <X size={14} />
                        </button>
                    </div>
                </div>
            </Show>
        </div>
    )
}

// === GŁÓWNA LISTA ===
const GlobalVariablesList = ({ getVariables }: { getVariables: () => GameVariable[] }) => {
    return (
        <div class="flex-grow flex flex-col bg-zinc-950/30 relative overflow-hidden">
            
            <Show when={getVariables().length > 0} fallback={
                <div class="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 gap-3 opacity-60">
                    <div class="p-4 bg-zinc-900/50 rounded-full border border-zinc-800">
                        <Box size={32} strokeWidth={1.5} />
                    </div>
                    <span class="text-xs font-bold uppercase tracking-widest text-zinc-500">No Variables Defined</span>
                </div>
            }>
                
                {/* Headers - teraz konkretne */}
                <div class="flex items-center px-6 py-2 border-b border-zinc-800 bg-zinc-900/50">
                    <div class="w-1/3 font-bold tracking-[0.1em] text-[10px] text-zinc-500 uppercase">Name</div>
                    <div class="w-24 font-bold tracking-[0.1em] text-[10px] text-zinc-500 uppercase">Type</div>
                    <div class="flex-1 text-right font-bold tracking-[0.1em] text-[10px] text-zinc-500 uppercase mr-16">Value</div>
                </div>

                {/* Content */}
                <div class="overflow-y-auto custom-scrollbar flex-1 pb-10">
                    <For each={getVariables()}>
                        {(variable) => <VariableRow variable={variable} />}
                    </For>
                </div>

            </Show>
        </div>
    )
}

export default GlobalVariablesList