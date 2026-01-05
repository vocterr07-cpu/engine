import { Plus } from "lucide-solid"
import { createSignal, Show } from "solid-js"
import AddEventModal from "./AddEventModal";
import type { EventName } from "../../engine/VisualScript";
import { state } from "../../engine/store";


interface Props {
    update: () => void;
}

const AddFirstTriggerButton = (props: Props) => {
    const [isWindowOpened, setIsWindowOpened] = createSignal(false);

    const handleSelect = (name: EventName) => {
            const vs = state.selectedVisualScript;
            if (!vs) return;
            vs.addEvent(name);
            setIsWindowOpened(false);
            props.update();
            
        };
    return (
        <>
            <div onClick={() => setIsWindowOpened(true)} class="group cursor-pointer flex items-center gap-4 justify-center w-full p-10 bg-yellow-500/20 border border-yellow-500/40 hover:bg-yellow-500/30 hover:border-yellow-500/50 rounded-lg transition-all duration-300 shadow-[0_0_20px_-5px_rgba(255,255,0,0.5)] hover:shadow-[0_0_30px_-5px_rgba(255,255,0,0.5)]">
                <Plus class="text-yellow-500/80 group-hover:text-yellow-500 group-hover:rotate-90 duration-300 transition-all" />
                <h1 class="text-yellow-500/80 group-hover:text-yellow-500  duration-300 transition-all font-black text-lg uppercase tracking-[0.05em]">Add your First Event Trigger</h1>
            </div>
            <Show when={isWindowOpened()}>
                <AddEventModal
                    onClose={() => setIsWindowOpened(false)}
                    onSelect={handleSelect}

                />
            </Show>
        </>

    )
}

export default AddFirstTriggerButton