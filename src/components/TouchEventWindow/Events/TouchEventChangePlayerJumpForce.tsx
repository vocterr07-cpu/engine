import { createSignal, Show, createEffect } from 'solid-js';
import { state } from '../../../engine/store';
import { parseNumericInput } from '../../../helpers/parseNumericInput';

const TouchEventChangePlayerJumpForce = () => {
    const [refresh, setRefresh] = createSignal(0);
    const update = () => setRefresh(r => r + 1);
    
    const getEvent = () => {
        refresh();
        return state.selectedTouchEvent;
    };

    // LOKALNY BUFOR TEKSTOWY
    // Inicjalizujemy go aktualną wartością z silnika
    const [inputValue, setInputValue] = createSignal(getEvent()?.jumpForceMultiplier.toString() || "1");

    // Reagujemy na zmianę wybranego obiektu - aktualizujemy bufor
    createEffect(() => {
        const ev = getEvent();
        if (ev) setInputValue(ev.jumpForceMultiplier.toString());
    });

    return (
        <div class="h-full w-full p-6 flex flex-col flex-wrap">
            <div class="flex flex-col gap-4 h-full w-80">
                <div class="flex flex-col p-3 rounded-md bg-zinc-800 shadow-zinc-950 shadow-md">
                    <div class="flex items-center gap-2">
                        <p class="font-black text-zinc-400 text-sm tracking-[0.1em]">Change Player Jump Force?</p>
                        <input
                            type="checkbox"
                            class="inputCheckbox"
                            checked={getEvent()?.changePlayerJumpForce}
                            onInput={(e) => {
                                const event = getEvent();
                                if (!event) return;
                                event.changePlayerJumpForce = e.currentTarget.checked;
                                update();
                            }}
                        />
                    </div>

                    <Show when={getEvent()?.changePlayerJumpForce}>
                        <div class='flex items-center gap-2 bg-zinc-900 mt-3 rounded-md p-3'>
                            <p class='text-left text-sm font-black text-zinc-400'>Jump Force Multiplier:</p>
                            <input
                                type="text"
                                class='inputText w-full bg-transparent outline-none text-zinc-200' 
                                // BARDZO WAŻNE: używamy lokalnego sygnału
                                value={inputValue()} 
                                onInput={(e) => {
                                    const raw = e.currentTarget.value;
                                    
                                    // 1. Zawsze pozwalamy użytkownikowi pisać w buforze
                                    setInputValue(raw); 

                                    // 2. Próbujemy sparsować do silnika
                                    const parsed = parseNumericInput(raw);
                                    const event = getEvent();
                                    
                                    if (event && parsed !== null) {
                                        event.jumpForceMultiplier = parsed;
                                    }
                                }}
                                // Gdy użytkownik kliknie poza input - czyścimy błędy
                                onBlur={() => {
                                    const event = getEvent();
                                    if (event) setInputValue(event.jumpForceMultiplier.toString());
                                }}
                            />
                        </div>
                    </Show>
                </div>
            </div>
        </div>
    );
};

export default TouchEventChangePlayerJumpForce;