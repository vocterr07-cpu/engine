import { Database, Hash, Type, ToggleLeft, Box } from "lucide-solid";
import { state } from "../../engine/store";
import { For, Switch, Match } from "solid-js";
import PropertyWindowSidebarGlobalVariableCard from "./PropertyWindowSidebar/PropertyWindowSidebarGlobalVariableCard";

interface Props {
    onVariableClick: (id: string) => void;
}

const GlobalVariablesListNodePropertyWindow = (props: Props) => {
    const getGlobalVariables = () => {
        return state.variables;
    };

    // Mały pomocnik do ikon typów (opcjonalnie, ale dodaje "pro" wyglądu)
    const getTypeIcon = (type: string) => {
        switch (type) {
            case "Integer": case "Float": return <Hash size={12} />;
            case "String": return <Type size={12} />;
            case "Boolean": return <ToggleLeft size={12} />;
            default: return <Box size={12} />;
        }
    };

    return (
        <div class="flex flex-col p-4 fixed h-[100vh] w-[20%] right-0 top-0 z-[999] bg-zinc-950 border-l border-zinc-900 shadow-2xl overflow-y-auto custom-scrollbar">
            <div class="group flex flex-col p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 hover:border-orange-500/30 transition-all duration-500 select-none">
                
                {/* Header */}
                <div class="flex items-center justify-between pb-4 mb-4 border-b border-orange-500/20">
                    <div class="flex items-center gap-3">
                        <div class="h-5 w-1 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                        <h1 class="text-orange-500 font-black uppercase tracking-widest text-[10px]">Global Variables</h1>
                    </div>
                    <Database class="text-orange-500/50 group-hover:text-orange-500 transition-colors duration-500" size={18} />
                </div>

                {/* List */}
                <div class="flex flex-col space-y-2">
                    <For each={getGlobalVariables()}>
                        {(variable) => (
                            <PropertyWindowSidebarGlobalVariableCard
                                variable={variable}
                                getTypeIcon={getTypeIcon}
                                onVariableClick={props.onVariableClick}
                            />
                        )}
                    </For>
                    
                    {/* Empty State */}
                    {getGlobalVariables().length === 0 && (
                        <div class="text-center py-6 border-2 border-dashed border-zinc-900 rounded-xl">
                            <span class="text-[10px] text-zinc-600 uppercase font-bold tracking-tighter">No Variables Found</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalVariablesListNodePropertyWindow;