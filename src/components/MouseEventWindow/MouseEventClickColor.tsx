interface Props {
    value: string;
    checkboxOnInput: (e: Event & {currentTarget: HTMLInputElement}) => void;
    checked: boolean;
    colorOnInput: (e: Event & {currentTarget: HTMLInputElement}) => void;
}
const MouseEventClickColor = (props: Props) => {
  return (
    <div class="flex flex-col rounded-md p-3 bg-zinc-800 shadow-md shadow-zinc-950">
                    <div class="flex items-center gap-2">
                        <p class="font-black text-zinc-400 text-sm tracking-[0.1em]">Change Color On Click?</p>
                        <input
                            type="checkbox"
                            class="inputCheckbox"
                            checked={props.checked}
                            onInput={props.checkboxOnInput}
                        />
                        <input 
                            type="color"
                            class="bg-transparent w-8 h-8 cursor-pointer border-none"
                            value={props.value}
                            onInput={props.colorOnInput}
                        />

                    </div>

                </div>
  )
}

export default MouseEventClickColor