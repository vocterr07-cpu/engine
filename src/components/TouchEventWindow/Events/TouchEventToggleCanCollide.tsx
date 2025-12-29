import { createSignal } from "solid-js";
import { state } from "../../../engine/store";


const TouchEventToggleCanCollide = () => {
    const [refresh, setRefresh] = createSignal(0);
    const update = () => setRefresh(r => r + 1);

    const getEvent = () =>{
        refresh();
        return state.selectedTouchEvent
    }
  return (
    <div class="h-full w-full p-6 flex flex-col flex-wrap">
                            <div class="flex flex-col gap-4 h-full w-80">
                                <div class="flex flex-col p-3 rounded-md bg-zinc-800 shadow-zinc-950 shadow-md">
                                    <div class="flex items-center gap-2">
                                        <p class="font-black text-zinc-400 text-sm tracking-[0.1em]">Toggle canCollide?</p>
                                        <input
                                            type="checkbox"
                                            class="inputCheckbox"
                                            checked={getEvent()?.gameObject?.canCollide}
                                            onInput={(e) => {
                                                const event = getEvent();
                                                if (!event?.gameObject) return;
                                                event.gameObject.canCollide = e.target.checked;
                                                update();
                                            }}
                                        />

                                    </div>
                                </div>
                            </div>
                        </div>
  )
}

export default TouchEventToggleCanCollide