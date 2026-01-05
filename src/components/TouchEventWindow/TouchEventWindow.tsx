import { Show, createSignal, For } from "solid-js";
import { state } from "../../engine/store";
import { Search, X, } from "lucide-solid"; // Dodaj ikonę Workflow
const TouchEventWindow = () => {
    const [searchQuery, setSearchQuery] = createSignal("");


    return (
        <div class="flex flex-col bg-zinc-900 h-full w-full overflow-hidden">
            <Show when={state.selectedTouchEvent}>
                {(touchEvent) => (
                    <>
                        {/* Header */}
                        <div class="flex items-center justify-between px-6 w-full h-12 border-b border-zinc-600 flex-shrink-0 bg-zinc-900 z-10">
                            <div class="flex items-center gap-4">
                                <h1 class="tracking-[0.1em] font-black text-blue-500 text-xs uppercase">
                                    {touchEvent().name}
                                </h1>

                                {/* SEARCH BAR */}
                                <div class="relative flex items-center">
                                    <Search size={14} class="absolute left-3 text-zinc-500" />
                                    <input
                                        type="text"
                                        placeholder="Search parameters..."
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
                            <button>
                                <X />
                            </button>
                        </div>
                        <div class="p-4 bg-zinc-950/20 h-full min-h-[90%] flex flex-col flex-wrap bg-red-500 rounded-lg border border-zinc-800">
                            
                        </div>
                    </>
                )}
            </Show>
        </div>
    );
};

export default TouchEventWindow;