import { For } from "solid-js"
import type { ScriptEvent } from "../../engine/VisualScript"
import VisualScriptSidebarCard from "./VisualScriptSidebarCard";
import { Plus } from "lucide-solid";
import AddEventTriggerButton from "./AddEventTriggerButton";


interface Props {
    getEvents: () => ScriptEvent[] | undefined;
    handleSelectEventTrigger: (id: string) => void;
    selectedEventTriggerId: string;
    update: () => void;
}
const VisualScriptSidebar = (props: Props) => {

    
  return (
    <aside class="flex flex-col w-72 p-4 h-full border-r border-zinc-800">
                    <h1 class="text-center text-zinc-500 tracking-[0.1em] text-xs mb-3 font-black uppercase pb-2 border-b border-zinc-800 ">Event Triggers</h1>
                    <AddEventTriggerButton update={props.update}/>

                    <div class="flex flex-col space-y-3 overflow-y-scroll custom-scrollbar mt-3 ">
                        <For each={props.getEvents()}>
                            {(event) => (
                               <VisualScriptSidebarCard 
                               event={event}
                               handleSelectEventTrigger={props.handleSelectEventTrigger}
                               isSelected={props.selectedEventTriggerId === event.id}
                               />
                            )}
                        </For>

                    </div>
                </aside>
  )
}

export default VisualScriptSidebar