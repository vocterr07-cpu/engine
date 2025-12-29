import { createSignal, Show } from 'solid-js'
import { state } from '../../../engine/store'

const TouchEventPlayAudio = () => {
    // 1. Lokalny odświeżacz (Twój wzorzec)
    const [refresh, setRefresh] = createSignal(0);
    const update = () => setRefresh(r => r + 1);

    // 2. Helper dostępowy (Getter)
    // Dzięki temu kod w JSX jest czystszy i zawsze "zahacza" o refresh()
    const getEvent = () => {
        refresh(); // Subskrypcja
        return state.selectedTouchEvent;
    };

    const handleFileUpload = (e: Event & { currentTarget: HTMLInputElement }) => {
        const file = e.currentTarget.files?.[0];
        const ev = state.selectedTouchEvent; // Tu możemy brać bezpośrednio, bo to akcja
        if (!file || !ev) return;
        
        const url = URL.createObjectURL(file);
        ev.audioUrl = url;
        update();
    }

    return (
        <div class="h-full w-full p-6 flex flex-col flex-wrap">
            <div class="flex flex-col gap-4 h-full w-80">
                <div class="flex flex-col p-3 rounded-md bg-zinc-800 shadow-zinc-950 shadow-md">
                    
                    {/* --- MAIN TOGGLE --- */}
                    <div class="flex items-center justify-between">
                        <p class="font-black text-zinc-400 text-sm tracking-[0.1em]">Play Audio?</p>
                        <input
                            type="checkbox"
                            checked={getEvent()?.playAudio || false}
                            onInput={(e) => {
                                const ev = state.selectedTouchEvent;
                                if (ev) {
                                    ev.playAudio = e.currentTarget.checked;
                                    update();
                                }
                            }}
                            class="inputCheckbox"
                        />
                    </div>

                    <Show when={getEvent()?.playAudio}>
                        <div class="mt-3 flex flex-col gap-2 animate-in fade-in duration-200">
                            
                            {/* --- FILE INPUT --- */}
                            <input
                                accept="audio/*"
                                onInput={handleFileUpload}
                                type="file"
                                class="w-full text-[10px] text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-zinc-700 file:text-zinc-300 hover:file:bg-zinc-600 cursor-pointer"
                            />

                            <Show when={getEvent()?.audioUrl}>
                                <div class='flex flex-col gap-2'>
                                    {/* Status & Test Button */}
                                    <div class="flex items-center gap-2 mt-1">
                                        <span class="text-[9px] text-green-500 font-mono italic">Source loaded ✓</span>
                                        <button
                                            onClick={() => {
                                                const url = state.selectedTouchEvent?.audioUrl;
                                                if (url) new Audio(url).play();
                                            }}
                                            class="text-[9px] bg-zinc-700 px-2 py-0.5 rounded hover:bg-zinc-600 text-zinc-200 border border-zinc-600"
                                        >
                                            ▶ Test
                                        </button>
                                    </div>

                                    {/* --- REPEAT TOGGLE --- */}
                                    <div class='flex items-center justify-between bg-zinc-900/50 p-2 rounded border border-zinc-700/50'>
                                        <p class='tracking-[0.1em] font-black text-zinc-400 text-[10px]'>LOOP AUDIO</p>
                                        <input
                                            type="checkbox"
                                            class="inputCheckbox"
                                            checked={getEvent()?.repeatAudio || false}
                                            onInput={(e) => {
                                                const ev = state.selectedTouchEvent;
                                                if (ev) {
                                                    ev.repeatAudio = e.currentTarget.checked;
                                                    update();
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* --- INTERVAL INPUT --- */}
                                    <Show when={getEvent()?.repeatAudio}>
                                        <div class='flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1'>
                                            <p class='tracking-[0.1em] font-bold text-zinc-500 text-[10px] whitespace-nowrap'>
                                                Interval (sec):
                                            </p>
                                            <input 
                                                type='number'
                                                min="0.1"
                                                step="0.1"
                                                value={getEvent()?.repeatInterval || 1.0}
                                                onInput={(e) => {
                                                    const val = parseFloat(e.currentTarget.value);
                                                    const ev = state.selectedTouchEvent;
                                                    if (ev && !isNaN(val)) {
                                                        ev.repeatInterval = val;
                                                    }
                                                }}
                                                class='w-16 bg-zinc-950 border border-zinc-700 rounded text-xs text-center text-zinc-200 focus:border-blue-500 outline-none p-1'
                                            />
                                        </div>
                                    </Show>

                                </div>
                            </Show>
                        </div>
                    </Show>
                </div>
            </div>
        </div>
    )
}

export default TouchEventPlayAudio