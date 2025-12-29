
import { state } from '../../../engine/store'
import { createSignal } from 'solid-js'
import { rgbToHex } from '../../../helpers/rgbToHex';
import { hexToRgb } from '../../../helpers/hexToRgb';

const TouchEventChangeColor = () => {
    const [refresh, setRefresh] = createSignal(0);
    const update = () => setRefresh(r => r + 1);
    const getEvent = () => {
        refresh();
        return state.selectedTouchEvent;
    }

    const getValue = () => {
        const event = getEvent();
        if (!event) return;
        return rgbToHex(event.targetColor);
    }
  return (
    <div class="h-full w-full p-6 flex flex-col flex-wrap">
                            <div class="flex flex-col gap-4 h-full w-80">
                                <div class="flex flex-col p-3 rounded-md bg-zinc-800 shadow-zinc-950 shadow-md">
                                    <div class="flex items-center gap-2">
                                        <p class="font-black text-zinc-400 text-sm tracking-[0.1em]">Change Color?</p>
                                        <input
                                            type="checkbox"
                                            class="inputCheckbox"
                                            checked={getEvent()?.changeColor}
                                            onInput={(e) => {
                                                const event = getEvent();
                                                if (!event) return;
                                                event.changeColor = e.currentTarget.checked;
                                                update();
                                            }}
                                        />
                                        <input
                                            type="color"
                                            value={getValue()}
                                            onInput={(e) => {
                                                const event = getEvent();
                                                if (!event) return;
                                                event.targetColor = hexToRgb(e.currentTarget.value)
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
  )
}

export default TouchEventChangeColor