import type MouseEventComponent from "../../engine/MouseEventComponent"
import { hexToRgb } from "../../helpers/hexToRgb";
import { rgbToHex } from "../../helpers/rgbToHex";
import MouseEventCheckboxOption from "./MouseEventCheckboxOption";
import MouseEventClickAudio from "./MouseEventClickAudio";
import MouseEventClickColor from "./MouseEventClickColor";

interface Props {
    mouseEvent: MouseEventComponent;
}

const MouseEventList = (props: Props) => {
    return (
        <div class="h-full w-full p-6 flex flex-col flex-wrap">
            <div class="flex flex-col gap-4 h-full w-80">
                <h1 class="text-left font-black text-[10px] mb-1 ml-1 text-zinc-500 tracking-[0.1em] uppercase border-b border-zinc-800 pb-2">
                    Click Events
                </h1>
                
                <MouseEventCheckboxOption 
                    label="Destroy Object" 
                    checked={props.mouseEvent.destroyOnClick} 
                    handleInput={(e) => props.mouseEvent.destroyOnClick = e.currentTarget.checked} 
                />
                
                <MouseEventCheckboxOption 
                    label="Duplicate Object" 
                    note="Copies are spawned at original coordinates. Active only in Player Mode." 
                    checked={props.mouseEvent.duplicateOnClick} 
                    handleInput={(e) => props.mouseEvent.duplicateOnClick = e.currentTarget.checked} 
                />
                
                <MouseEventClickColor
                    checkboxOnInput={(e) => props.mouseEvent.clickColorChange = e.currentTarget.checked}
                    colorOnInput={(e) => props.mouseEvent.targetColor = hexToRgb(e.currentTarget.value)}
                    value={rgbToHex(props.mouseEvent.targetColor)}
                    checked={props.mouseEvent.clickColorChange}
                />
                
                <MouseEventClickAudio />
            </div>
        </div>
    )
}

export default MouseEventList;