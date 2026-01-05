import { Palette } from "lucide-solid";

interface Props {
    value: string;
    checkboxOnInput: (e: Event & {currentTarget: HTMLInputElement}) => void;
    checked: boolean;
    colorOnInput: (e: Event & {currentTarget: HTMLInputElement}) => void;
}

const MouseEventClickColor = (props: Props) => {
    return (
        <div class="w-full flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 shadow-sm hover:border-zinc-600 transition-colors">
            <div class="flex items-center gap-2 text-zinc-400">
                <Palette size={14} class="text-pink-500" />
                <p class="font-bold text-xs tracking-wider uppercase">Change Color</p>
            </div>
            
            <div class="flex items-center gap-3">
                 <div 
                    class="relative w-8 h-5 rounded border border-zinc-600 overflow-hidden cursor-pointer shadow-sm hover:scale-105 transition-transform"
                    style={{ "background-color": props.value }}
                 >
                     <input
                        type="color"
                        class="absolute -top-2 -left-2 w-16 h-16 opacity-0 cursor-pointer"
                        value={props.value}
                        onInput={props.colorOnInput}
                    />
                 </div>
                 <input
                    type="checkbox"
                    checked={props.checked}
                    onInput={props.checkboxOnInput}
                    class="inputCheckbox scale-90"
                />
            </div>
        </div>
    )
}

export default MouseEventClickColor;