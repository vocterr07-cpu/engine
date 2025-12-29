import { Show, createSignal, For } from "solid-js";
import { state } from "../../engine/store";
import { Search, X } from "lucide-solid";
import TouchEventCloseButton from "./Events/TouchEventCloseButton";
import TouchEventPlayAudio from "./Events/TouchEventPlayAudio";
import TouchEventChangePlayerSpeed from "./Events/TouchEventChangePlayerSpeed";
import TouchEventChangePlayerJumpForce from "./Events/TouchEventChangePlayerJumpForce";
import TouchEventChangeColor from "./Events/TouchEventChangeColor";
import TouchEventToggleCanCollide from "./Events/TouchEventToggleCanCollide";
import TouchEventTeleportPlayer from "./Events/TouchEventTeleportPlayer";

const TouchEventWindow = () => {
    const [searchQuery, setSearchQuery] = createSignal("");

    // Definiujemy listę wszystkich dostępnych eventów
    const allEvents = [
        { label: "Change Color", component: TouchEventChangeColor },
        { label: "Toggle Collision", component: TouchEventToggleCanCollide },
        { label: "Play Audio", component: TouchEventPlayAudio },
        { label: "Change Player Speed", component: TouchEventChangePlayerSpeed },
        { label: "Change Jump Force", component: TouchEventChangePlayerJumpForce },
        { label: "Teleport Player", component: TouchEventTeleportPlayer },
    ];

    // Funkcja filtrująca
    const filteredEvents = () => 
        allEvents.filter(event => 
            event.label.toLowerCase().includes(searchQuery().toLowerCase())
        );

    return (
        <div class="flex flex-col bg-zinc-900 h-full w-full overflow-hidden">
            <Show when={state.selectedTouchEvent}>
                {(touchEvent) => (
                    <>
                        {/* Header */}
                        <div class="flex items-center justify-between px-6 w-full h-12 border-b border-zinc-600 flex-shrink-0">
                            <div class="flex items-center gap-4">
                                <h1 class="tracking-[0.1em] font-black text-blue-500 text-xs">
                                    {touchEvent().name}
                                </h1>
                                
                                {/* SEARCH BAR */}
                                <div class="relative flex items-center">
                                    <Search size={14} class="absolute left-3 text-zinc-500" />
                                    <input 
                                        type="text"
                                        placeholder="Search events..."
                                        value={searchQuery()}
                                        onInput={(e) => setSearchQuery(e.currentTarget.value)}
                                        class="bg-zinc-800 text-[11px] text-zinc-300 pl-9 pr-8 py-1.5 rounded-full border border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-48 transition-all"
                                    />
                                    <Show when={searchQuery().length > 0}>
                                        <button 
                                            onClick={() => setSearchQuery("")}
                                            class="absolute right-2 text-zinc-500 hover:text-zinc-300"
                                        >
                                            <X size={14} />
                                        </button>
                                    </Show>
                                </div>
                            </div>
                            <TouchEventCloseButton />
                        </div>

                        {/* GŁÓWNY KONTENER Z FILTROWANIEM */}
                        <div 
                            class="flex flex-col flex-wrap gap-4 p-6 h-[calc(100%-48px)] w-full content-start overflow-x-auto"
                        >
                            <For each={filteredEvents()} fallback={
                                <div class="w-80 p-10 text-center text-zinc-600 text-xs italic">
                                    No events found matching "{searchQuery()}"
                                </div>
                            }>
                                {(item) => (
                                    <div class="w-80 flex-shrink-0  duration-200">
                                        <item.component />
                                    </div>
                                )}
                            </For>
                        </div>
                    </>
                )}
            </Show>
        </div>
    );
};

export default TouchEventWindow;