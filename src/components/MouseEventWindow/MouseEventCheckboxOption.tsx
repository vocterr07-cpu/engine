import { Show } from "solid-js";

interface Props {
    label: string;
    checked: boolean;
    handleInput: (e: Event & { currentTarget: HTMLInputElement }) => void;
    note?: string;
}

const MouseEventCheckboxOption = (props: Props) => {
    return (
        <div class="flex flex-col rounded-md p-3 bg-zinc-800 shadow-md shadow-zinc-950">
            <div class=" flex items-center gap-2">
                <p class="font-black text-zinc-400 text-sm tracking-[0.1em]">{props.label}</p>
                <input
                    type="checkbox"
                    checked={props.checked}
                    onInput={props.handleInput}
                    class="inputCheckbox"
                />

            </div>
            <Show when={props.note}>
                <p class="text-zinc-500 mt-4 text-left text-sm">{props.note}</p>
            </Show>
        </div>

    )
}

export default MouseEventCheckboxOption