import { Folder, Box } from "lucide-solid"
import SectionHeader from "../../SectionHeader"
import { For } from "solid-js"
import { state } from "../../../engine/store"
import ExplorerRow from "./ExplorerRow"

const Explorer = () => {
  return (
     <div class="flex flex-col p-2 h-[50%] rounded-md shadow-md scrollbar shadow-zinc-950 overflow-y-scroll overflow-x-hidden">
                <SectionHeader icon={Folder} label="Explorer"/>
                <div class="flex flex-col pt-4 mt-2 border-t border-zinc-700">
                    <For each={state.objects}>
                        {(obj) => (
                            <ExplorerRow icon={Box} obj={obj}/>
                        )}
                    </For>
                </div>
            </div>
  )
}

export default Explorer