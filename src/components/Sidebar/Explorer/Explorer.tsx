import { Folder, Box } from "lucide-solid"
import SectionHeader from "../../SectionHeader"
import { For } from "solid-js"
import { state } from "../../../engine/store"
import ExplorerRow from "./ExplorerRow"

const Explorer = () => {
  return (
    // ZMIANY STYLI TUTAJ:
    <div class="flex flex-col h-[50%] rounded-lg bg-zinc-900 border border-zinc-700/60 shadow-xl shadow-black/40 overflow-hidden">
        
        {/* Header z delikatnym tłem */}
        <div class="bg-zinc-900/50 p-2 border-b border-zinc-800">
             <SectionHeader icon={Folder} label="Explorer"/>
        </div>

        {/* Lista z własnym scrollem */}
        <div class="flex flex-col flex-1 p-2 overflow-y-auto overflow-x-hidden custom-scrollbar bg-zinc-900/30">
             <div class="flex flex-col gap-0.5">
                <For each={state.objects}>
                    {(obj) => (
                        <ExplorerRow icon={Box} node={obj} type="object" depth={0} />
                    )}
                </For>
             </div>
        </div>
    </div>
  )
}

export default Explorer