import { createSignal, Show, For, Switch, Match } from "solid-js"
import { state, storeActions } from "../../engine/store"
import { ChevronDown, X, Hash, Type, ToggleLeft, Box, Plus, Check, Search } from "lucide-solid"
import { Dynamic } from "solid-js/web";
import { parseNumericInput } from "../../helpers/parseNumericInput";
import GlobalVariablesList from "./GlobalVariablesList";

const dataTypes = [
    { label: "Integer", code: "INT", icon: Hash, default: 0, description: "Whole numbers (e.g. 1, 42)" },
    { label: "Float", code: "FLOAT", icon: Hash, default: 0.0, description: "Decimal numbers (e.g. 3.14)" },
    { label: "String", code: "STR", icon: Type, default: "", description: "Text characters" },
    { label: "Boolean", code: "BOOL", icon: ToggleLeft, default: false, description: "True / False switch" },
    { label: "Object Ref", code: "OBJ", icon: Box, default: null, description: "Link to a scene object" },
] as const;

const GlobalVariablesWindow = () => {
    const [refresh, setRefresh] = createSignal(0);
    const update = () => setRefresh(r => r + 1);

    const [variableName, setVariableName] = createSignal("");
    const [selectedType, setSelectedType] = createSignal<typeof dataTypes[number]>(dataTypes[0]);
    const [variableValue, setVariableValue] = createSignal<any>(0);
    
    const [searchQuery, setSearchQuery] = createSignal(""); 
    const [isSearchFocused, setIsSearchFocused] = createSignal(false);
    const [isTypeMenuOpen, setIsTypeMenuOpen] = createSignal(false);
    const [isObjMenuOpen, setIsObjMenuOpen] = createSignal(false);

    const getVariables = () => {
        refresh(); 
        const allVars = state.variables;
        const query = searchQuery().toLowerCase();
        if (!query) return allVars;
        return allVars.filter(v => v.name.toLowerCase().includes(query));
    }

    const handleTypeChange = (newType: typeof dataTypes[number]) => {
        setSelectedType(newType);
        setVariableValue(newType.default);
        setIsTypeMenuOpen(false);
    };

    const handleAddVariable = () => {
        const name = variableName().trim();
        if (!name) return; 
        
        state.variables.push({
            id: crypto.randomUUID(), 
            name: name, 
            type: selectedType().code as any, 
            value: variableValue()
        });
        
        setVariableName("");
        setVariableValue(selectedType().default);
        update();
    };

    return (
        <Show when={state.openedWindow === "globalVariables"}>
            <div class='flex flex-col bg-zinc-900 h-full w-full select-none shadow-2xl overflow-hidden'>
                
                {/* --- HEADER --- */}
                <nav class='flex items-center justify-between h-16 w-full px-6 border-b border-zinc-700 bg-zinc-900 z-10'>
                    
                    <div class="flex items-center gap-3">
                        <div class="w-1 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        <h1 class='font-black uppercase text-zinc-100 text-[10px] tracking-[0.15em] whitespace-nowrap'>Global Variables Panel</h1>
                    </div>

                    {/* ŚRODEK: ODDYCHAJĄCY SEARCH BAR */}
                    <div class={`relative flex items-center h-9 rounded-full border transition-all duration-300 ease-in-out group ${
                        isSearchFocused() 
                        ? "w-80 bg-zinc-900 border-blue-500 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]" 
                        : "w-60 bg-zinc-950 border-zinc-700 hover:border-zinc-600 shadow-none"
                    }`}>
                        <div class={`pl-3 pr-2 transition-colors duration-300 ${isSearchFocused() ? "text-blue-400" : "text-zinc-500"}`}>
                            <Search size={14} />
                        </div>

                        <input 
                            value={searchQuery()}
                            onInput={(e) => setSearchQuery(e.currentTarget.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            class="bg-transparent w-full h-full text-xs text-zinc-200 placeholder:text-zinc-600 outline-none pb-[1px]" 
                            type="text" 
                            placeholder="Search parameters..."
                        />

                        <Show when={searchQuery().length > 0}>
                            <button 
                                onClick={() => setSearchQuery("")}
                                class="pr-2 pl-1 text-zinc-500 hover:text-red-400 transition-colors animate-in fade-in zoom-in duration-200"
                            >
                                <X size={14} />
                            </button>
                        </Show>
                    </div>

                    <button onClick={() => storeActions.setOpenedWindow("")} class='p-2 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors'>
                        <X size={18} />
                    </button>
                </nav>

                {/* --- FORMULARZ TWORZENIA --- */}
                <div class="w-full px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
                    <div class="flex items-end gap-3">
                        <div class="flex-1 flex flex-col gap-1.5">
                            <label class="text-[10px] font-bold uppercase text-zinc-500 tracking-wider ml-1">Variable Name</label>
                            <input 
                                class="w-full h-10 bg-zinc-950 border border-zinc-700 rounded-md px-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                                placeholder="e.g. PlayerGold"
                                type="text" 
                                value={variableName()}
                                onInput={(e) => setVariableName(e.currentTarget.value)}
                            />
                        </div>

                        <div class="w-40 flex flex-col gap-1.5 relative">
                            <label class="text-[10px] font-bold uppercase text-zinc-500 tracking-wider ml-1">Data Type</label>
                            <button 
                                onClick={() => setIsTypeMenuOpen(!isTypeMenuOpen())}
                                class={`h-10 w-full flex items-center justify-between px-3 bg-zinc-950 border border-zinc-700 rounded-md hover:border-zinc-500 transition-colors ${isTypeMenuOpen() ? 'border-blue-500' : ''}`}
                            >
                                <div class="flex items-center gap-2">
                                    <Dynamic component={selectedType().icon} size={14} class="text-blue-400"/>
                                    <span class="text-xs font-semibold text-zinc-300">{selectedType().code}</span>
                                </div>
                                <ChevronDown size={14} class={`text-zinc-500 transition-transform ${isTypeMenuOpen() ? 'rotate-180' : ''}`}/>
                            </button>

                            <Show when={isTypeMenuOpen()}>
                                <div class="fixed inset-0 z-10" onClick={() => setIsTypeMenuOpen(false)}></div>
                                <div class="absolute top-full left-0 mt-1 w-56 bg-zinc-900 border border-zinc-700 rounded-md shadow-xl z-20 flex flex-col p-1 animate-in zoom-in-95 duration-100">
                                    <For each={dataTypes}>
                                        {(type) => (
                                            <button 
                                                onClick={() => handleTypeChange(type)}
                                                class={`flex items-center gap-3 px-3 py-2 rounded text-left hover:bg-zinc-800 transition-colors ${selectedType().code === type.code ? 'bg-blue-900/20 text-blue-300' : 'text-zinc-400'}`}
                                            >
                                                <Dynamic component={type.icon} size={16} />
                                                <div>
                                                    <div class="text-xs font-bold">{type.label}</div>
                                                    <div class="text-[9px] opacity-50">{type.description}</div>
                                                </div>
                                            </button>
                                        )}
                                    </For>
                                </div>
                            </Show>
                        </div>

                        <div class="flex-[1.5] flex flex-col gap-1.5 relative">
                            <label class="text-[10px] font-bold uppercase text-zinc-500 tracking-wider ml-1">Initial Value</label>
                            <Switch>
                                <Match when={selectedType().code === "STR"}>
                                    <input 
                                        type="text" 
                                        class="h-10 w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 text-sm text-yellow-400 focus:border-yellow-500 outline-none font-mono"
                                        value={variableValue()}
                                        onInput={(e) => setVariableValue(e.currentTarget.value)}
                                    />
                                </Match>
                                <Match when={selectedType().code === "INT" || selectedType().code === "FLOAT"}>
                                    <input 
                                        type="text" 
                                        inputmode="decimal"
                                        class="h-10 w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 text-sm text-green-400 focus:border-green-500 outline-none font-mono"
                                        value={variableValue()}
                                        onInput={(e) => {
                                            const val = parseNumericInput(e.currentTarget.value);
                                            setVariableValue(val ?? 0);
                                        }}
                                    />
                                </Match>
                                <Match when={selectedType().code === "BOOL"}>
                                    <button 
                                        onClick={() => setVariableValue(!variableValue())}
                                        class={`h-10 w-full flex items-center justify-center gap-2 border rounded-md transition-all ${variableValue() ? 'bg-purple-900/30 border-purple-500 text-purple-400' : 'bg-zinc-950 border-zinc-700 text-zinc-500'}`}
                                    >
                                        <div class={`w-4 h-4 rounded border flex items-center justify-center ${variableValue() ? 'border-purple-400 bg-purple-400 text-black' : 'border-zinc-600'}`}>
                                            <Show when={variableValue()}><Check size={10} strokeWidth={4}/></Show>
                                        </div>
                                        <span class="text-xs font-bold uppercase">{variableValue() ? "TRUE" : "FALSE"}</span>
                                    </button>
                                </Match>
                                <Match when={selectedType().code === "OBJ"}>
                                    <div class="relative">
                                        <button 
                                            onClick={() => setIsObjMenuOpen(!isObjMenuOpen())}
                                            class="h-10 w-full flex items-center justify-between px-3 bg-zinc-950 border border-zinc-700 rounded-md hover:border-zinc-500 text-zinc-300"
                                        >
                                            <span class="text-xs truncate">{variableValue() ? variableValue().name : "Select Object..."}</span>
                                            <ChevronDown size={14} class="text-zinc-500"/>
                                        </button>
                                        <Show when={isObjMenuOpen()}>
                                            <div class="fixed inset-0 z-10" onClick={() => setIsObjMenuOpen(false)}></div>
                                            <div class="absolute top-full left-0 mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-md shadow-xl z-20 max-h-40 overflow-y-auto custom-scrollbar p-1">
                                                <button onClick={() => { setVariableValue(null); setIsObjMenuOpen(false); }} class="w-full text-left px-2 py-1.5 text-xs text-red-400 hover:bg-zinc-800 rounded">[Null]</button>
                                                <For each={state.objects}>
                                                    {(obj) => (
                                                        <button onClick={() => { setVariableValue(obj); setIsObjMenuOpen(false); }} class="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-800 rounded text-left group">
                                                            <Box size={12} class="text-zinc-500 group-hover:text-blue-400"/>
                                                            <span class="text-xs text-zinc-300 group-hover:text-white truncate">{obj.name}</span>
                                                        </button>
                                                    )}
                                                </For>
                                            </div>
                                        </Show>
                                    </div>
                                </Match>
                            </Switch>
                        </div>

                        <div class="flex flex-col gap-1.5">
                            <label class="text-[10px] font-bold uppercase text-transparent select-none">Action</label>
                            <button 
                                onClick={handleAddVariable}
                                disabled={!variableName().trim()}
                                class={`h-10 px-6   ease-in-out bg-blue-700 text-center duration-300 hover:bg-blue-600 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-md flex items-center gap-2 transition-all shadow-lg
                                        ${!variableName().trim() ? "w-24 " : " w-40 "}
                                    `}
                            >
                                <Plus size={16} />
                                <span>Add</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- LIST AREA --- */}
                <GlobalVariablesList getVariables={getVariables}/>
            </div>
        </Show>
    )
}

export default GlobalVariablesWindow