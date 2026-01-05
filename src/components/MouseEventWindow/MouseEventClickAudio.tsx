import { createSignal, Show } from 'solid-js'
import { state } from '../../engine/store'
import { Volume2, Music, Repeat } from "lucide-solid"

const MouseEventClickAudio = () => {
    const [refresh, setRefresh] = createSignal(0);
    const update = () => setRefresh(r => r + 1);

    const getEvent = () => {
        refresh();
        return state.selectedMouseEvent;
    };

    const handleFileUpload = (e: Event & { currentTarget: HTMLInputElement }) => {
        const file = e.currentTarget.files?.[0];
        const ev = state.selectedMouseEvent;
        if (!file || !ev) return;

        const url = URL.createObjectURL(file);
        ev.audioUrl = url;
        update();
    }

    return (
        <div class="w-full flex flex-col p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 shadow-sm hover:border-zinc-600 transition-colors">
            <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2 text-zinc-400">
                    <Volume2 size={14} class="text-blue-400" />
                    <p class="font-bold text-xs tracking-wider uppercase">Audio Trigger</p>
                </div>
                <input
                    type="checkbox"
                    checked={getEvent()?.clickPlayAudio || false}
                    onInput={(e) => {
                        const ev = state.selectedMouseEvent;
                        if (ev) {
                            ev.clickPlayAudio = e.currentTarget.checked;
                            update();
                        }
                    }}
                    class="inputCheckbox scale-90"
                />
            </div>

            <Show when={getEvent()?.clickPlayAudio}>
                <div class="mt-3 flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div class="flex flex-col gap-1.5">
                        <label class="group relative flex items-center justify-center w-full h-8 bg-zinc-950 border border-dashed border-zinc-700 rounded-md hover:border-blue-500/50 hover:bg-zinc-900 transition-all cursor-pointer">
                            <div class="flex items-center gap-2 text-zinc-500 group-hover:text-zinc-300">
                                <Music size={12} />
                                <span class="text-[10px] font-mono truncate max-w-[180px]">
                                    {getEvent()?.audioUrl ? "Change File..." : "Select Audio File"}
                                </span>
                            </div>
                            <input accept="audio/*" onInput={handleFileUpload} type="file" class="absolute inset-0 opacity-0 cursor-pointer" />
                        </label>
                    </div>

                    <Show when={getEvent()?.audioUrl}>
                        <div class="flex flex-col gap-3 p-2 rounded-md bg-zinc-950/30 border border-zinc-800/50">
                            <div class="flex items-center justify-between">
                                <span class="text-[9px] text-green-500 font-mono italic flex items-center gap-1">
                                    <span class="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span> READY
                                </span>
                                <button 
                                    onClick={() => {
                                        const url = state.selectedMouseEvent?.audioUrl;
                                        if (url) new Audio(url).play();
                                    }}
                                    class="text-[9px] bg-blue-600/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all font-bold"
                                >
                                    PLAY TEST
                                </button>
                            </div>

                            <div class="space-y-2 pt-2 border-t border-zinc-800/50">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-2 text-zinc-500">
                                        <Repeat size={12} />
                                        <p class="text-[10px] font-bold uppercase tracking-tight">Auto-Repeat</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        class="inputCheckbox scale-75"
                                        checked={getEvent()?.repeatAudio || false}
                                        onInput={(e) => {
                                            const ev = state.selectedMouseEvent;
                                            if (ev) {
                                                ev.repeatAudio = e.currentTarget.checked;
                                                update();
                                            }
                                        }}
                                    />
                                </div>
                                <Show when={getEvent()?.repeatAudio}>
                                    <div class="flex items-center justify-between gap-2 pl-5">
                                        <p class="text-[10px] text-zinc-500 font-medium">Delay (sec)</p>
                                        <input 
                                            type='number' step="0.1"
                                            value={getEvent()?.repeatInterval || 1.0}
                                            onInput={(e) => {
                                                const val = parseFloat(e.currentTarget.value);
                                                if (!isNaN(val)) state.selectedMouseEvent!.repeatInterval = val;
                                            }}
                                            class='w-16 bg-zinc-900 border border-zinc-700 rounded text-[10px] text-center text-zinc-200 outline-none p-1 font-mono'
                                        />
                                    </div>
                                </Show>
                            </div>
                        </div>
                    </Show>
                </div>
            </Show>
        </div>
    )
}

export default MouseEventClickAudio;