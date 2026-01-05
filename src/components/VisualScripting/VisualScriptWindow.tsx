import { createSignal, For, Show } from "solid-js"
import { state, storeActions } from "../../engine/store";
import { CodeXmlIcon, Play, Plus, X, Zap } from "lucide-solid";
import VisualScriptEventList from "./VisualScriptEventList";
import VisualScriptSidebar from "./VisualScriptSidebar";
import AddFirstTriggerButton from "./AddFirstTriggerButton";


const VisualScriptWindow = () => {
    const [refresh, setRefresh] = createSignal(0);
    const update = () => setRefresh(r => r + 1);
    const [selectedEventTriggerId, setSelectedEventTriggerId] = createSignal("update");
    const { setOpenedWindow, setSelectedComponent, setSelectedVisualScript } = storeActions
    const handleClose = () => {
        setOpenedWindow("");
        setSelectedComponent(null);
        setSelectedVisualScript(null);
    }

    const handleSelectEventTrigger = (id: string) => {
        setSelectedEventTriggerId(id);
        update();
    }

    const vs = () => {
        refresh();
        return state.selectedVisualScript;
    }

    const getEvents = () => {
        const trigger = vs();
        if (!trigger) return;
        return trigger.events;
    }

    const getEventToDraw = () => {
        refresh();
        return vs()?.events.find(e => e.id === selectedEventTriggerId()) || null;
    }

    return (
        <div class="relative flex flex-col w-full h-full bg-zinc-900">
            <nav class="flex items-center justify-between w-full bg-zinc-900 h-16 border-b border-zinc-800 px-6">
                <div class="flex items-center gap-4">
                    <div class="p-2 rounded-lg border border-zinc-800 bg-zinc-800/50">
                        <CodeXmlIcon class="text-zinc-400" />
                    </div>
                    <div>
                        <p class="text-zinc-500 font-black tracking-[0.1em] text-[8px] uppercase">Currently Editing:</p>
                        <h1 class="text-zinc-300 font-black tracking-[0.03em] text-[12px]  font-mono"></h1>
                    </div>

                </div>

                <button onClick={handleClose}>
                    <X />
                </button>
            </nav>
            <div class="flex w-full h-full">
                <VisualScriptSidebar
                    update={update}
                    selectedEventTriggerId={selectedEventTriggerId()}
                    getEvents={getEvents}
                    handleSelectEventTrigger={handleSelectEventTrigger}
                />


                <Show when={getEventToDraw()} fallback={
                    <div class="relative flex flex-grow justify-center overflow-y-auto w-full h-full">
                        <div class="flex flex-col w-[60%] max-w-3xl py-12">
                            <AddFirstTriggerButton update={update}/>
                        </div>
                    </div>
                }>
                    {(event) => (
                        <VisualScriptEventList update={update} refresh={refresh} event={event()} />
                    )}

                </Show>

            </div>


        </div>
    )
}

export default VisualScriptWindow