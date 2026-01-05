import { Show } from "solid-js";
import { Info } from "lucide-solid";

interface Props {
    label: string;
    checked: boolean;
    handleInput: (e: Event & { currentTarget: HTMLInputElement }) => void;
    note?: string;
}

const MouseEventCheckboxOption = (props: Props) => {
    return (
        <div class="w-full flex flex-col p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 shadow-sm hover:border-zinc-600 transition-colors">
            <div class="flex items-center justify-between">
                <p class="font-bold text-xs tracking-wider uppercase text-zinc-400">{props.label}</p>
                <input
                    type="checkbox"
                    checked={props.checked}
                    onInput={props.handleInput}
                    class="inputCheckbox scale-90"
                />
            </div>
            <Show when={props.note}>
                <div class="mt-2 flex items-start gap-2 p-2 rounded bg-zinc-950/30 border border-zinc-800/50">
                    <Info size={12} class="text-zinc-500 mt-0.5 flex-shrink-0" />
                    <p class="text-[10px] text-zinc-500 italic leading-relaxed">{props.note}</p>
                </div>
            </Show>
        </div>
    )
}

export default MouseEventCheckboxOption;