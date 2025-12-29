import { createSignal, Show } from "solid-js";
import { state } from "../../../engine/store";


const TouchEventTeleportPlayer = () => {
    const [refresh, setRefresh] = createSignal(0);
    const update = () => setRefresh(r => r + 1);

    const getEvent = () => {
        refresh();
        return state.selectedTouchEvent;
    }
    return (
        <div class="h-full w-full p-6 flex flex-col flex-wrap">
            <div class="flex flex-col gap-4 h-full w-80">
                <div class="flex flex-col p-3 rounded-md bg-zinc-800 shadow-zinc-950 shadow-md">
                    <div class="flex items-center gap-2">
                        <p class="font-black text-zinc-400 text-sm tracking-[0.1em]">Teleport Player?</p>
                        <input
                            type="checkbox"
                            class="inputCheckbox"
                            checked={getEvent()?.teleportPlayer}
                            onInput={(e) => {
                                const event = getEvent();
                                if (!event) return;
                                event.teleportPlayer = e.currentTarget.checked;
                                update();
                            }}
                        />
                    </div>

                    <Show when={getEvent()?.teleportPlayer}>
                        <div class='flex flex-col  gap-2 bg-zinc-900 mt-3 rounded-md p-3'>
                            <p class='text-left text-sm font-black text-zinc-400'>At:</p>
                            <div class="flex items-center gap-2">
                                <p class="text-red-500 text-[12px] font-black">X:</p>
                                <input
                                    type="text"
                                    class="inputText"
                                />
                            </div>
                            <div class="flex items-center gap-2">
                                <p class="text-green-500 text-[12px] font-black">Y:</p>
                                <input
                                    type="text"
                                    class="inputText"
                                />
                            </div>
                            <div class="flex items-center gap-2">
                                <p class="text-blue-500 text-[12px] font-black">Z:</p>
                                <input
                                    type="text"
                                    class="inputText"
                                />
                            </div>

                        </div>
                    </Show>
                </div>
            </div>
        </div>
    )
}

export default TouchEventTeleportPlayer