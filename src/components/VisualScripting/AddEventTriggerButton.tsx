import { createSignal, Show } from "solid-js";
import { Plus } from "lucide-solid";
import AddEventPopover from "./AddEventPopover"; // Importujemy komponent wyżej
import { state } from "../../engine/store";
import type { EventName } from "../../engine/VisualScript";

interface Props {
    update: () => void;
}
const AddEventTriggerButton = (props: Props) => {
    const [isOpen, setIsOpen] = createSignal(false);

    const handleSelect = (name: EventName) => {
        const vs = state.selectedVisualScript;
        if (!vs) return;
        vs.addEvent(name);
        setIsOpen(false);
        props.update();
    };

    return (
        // WRAPPER RELATIVE - to jest kluczowe dla pozycjonowania popovera
        <div class="relative w-full pt-4 border-t border-zinc-800">
            
            <button 
                onClick={() => setIsOpen(!isOpen())}
                class={`
                    group relative w-full flex items-center justify-center gap-2 
                    px-4 py-3 rounded-xl border transition-all duration-300
                    
                    /* Jeśli otwarte - świeć mocniej */
                    ${isOpen() 
                        ? "bg-purple-500/20 border-purple-500/60 text-purple-300 shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)]" 
                        : "bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-[0_0_15px_-5px_rgba(168,85,247,0.3)]"
                    }

                    hover:bg-purple-500/20 hover:border-purple-500/60 
                    hover:text-purple-300 hover:shadow-[0_0_25px_-5px_rgba(168,85,247,0.5)]
                    hover:-translate-y-0.5
                    active:scale-95 active:translate-y-0
                    
                    font-black text-[10px] uppercase tracking-[0.15em]
                `}
            >
                <Plus 
                    size={16} 
                    class={`transition-transform duration-500 ${isOpen() ? "rotate-45" : "group-hover:rotate-90"}`} 
                />
                
                <span>{isOpen() ? "Close Menu" : "Add Event Trigger"}</span>

                {/* Subtelny blask tła */}
                <div class="absolute inset-0 bg-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </button>

            {/* --- POPOVER (MODAL) --- */}
            {/* Wyświetlamy go tylko gdy isOpen === true */}
            <Show when={isOpen()}>
                {/* Backdrop Click (kliknięcie gdzieś indziej zamyka) */}
                <div 
                    class="fixed inset-0 z-40" 
                    onClick={() => setIsOpen(false)} 
                />
                
                {/* Sam Dymek */}
                <AddEventPopover onSelect={handleSelect} />
            </Show>

        </div>
    )
}

export default AddEventTriggerButton;