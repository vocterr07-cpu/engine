import { Database } from "lucide-solid"
import { state } from "../../engine/store"
import { For } from "solid-js";


const GlobalVariablesListNodePropertyWindow = () => {

    const getGlobalVariables = () => {
        return state.variables;
    }
    return (
        <div class="flex flex-col p-4 fixed h-[100vh] w-[20%] right-0 top-0 z-[999] bg-zinc-950 border-l border-zinc-900">
            <div class="group flex flex-col p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/15 hover:border-orange-500/35 shadow-[0_0_20px_-5px_rgba(255,128,0,0.4)] hover:shadow-[0_0_20px_-5px_rgba(255,128,0,0.6)] transition-all duration-300 select-none">
                <div class="flex items-center justify-between pb-3 border-b border-orange-500/30">
                    <div class="flex items-center gap-4">
                        <div class="h-[20px] w-2 rounded-[2px] bg-orange-500/90 group-hover:bg-orange-500 transition-all group-hover:h-6 duration-300 "></div>
                        <h1 class="text-orange-500/90 group-hover:text-orange-500 font-black uppercase tracking-[0.07em] text-xs">Global Variables</h1>
                    </div>
                    <div class="p-2 rounded-lg bg-orange-500/20 border border-orange-500/40 group-hover:bg-orange-500/30 group-hover:border-orange-500/50 transition-colors duration-300">
                        <Database class="text-orange-500/90 group-hover:text-orange-500" size={20} />
                    </div>
                </div>
                <div class="flex flex-col space-y-2 mt-3">
                    <For each={getGlobalVariables()}>
                        {(variable) => (
                            <div class="flex items-center p-2 bg-orange-500/20  rounded-md">
                                <h1 class="p-1 rounded bg-orange-500/25 text-[10px] font-black tracking-[0.01em] text-orange-500">BOOL</h1>
                            </div>
                        )}
                    </For>
                </div>
            </div>
        </div>
    )
}

export default GlobalVariablesListNodePropertyWindow