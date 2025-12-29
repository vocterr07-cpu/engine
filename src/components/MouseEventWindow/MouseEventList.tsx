import type MouseEventComponent from "../../engine/MouseEventComponent"
import { hexToRgb } from "../../helpers/hexToRgb";
import { rgbToHex } from "../../helpers/rgbToHex";
import MouseEventCheckboxOption from "./MouseEventCheckboxOption";
import MouseEventClickAudio from "./MouseEventClickAudio"; // Importujemy nowy komponent
import MouseEventClickColor from "./MouseEventClickColor";

interface Props {
    mouseEvent: MouseEventComponent;
}

const MouseEventList = (props: Props) => {

    return (
        <div class="h-full w-full p-6 flex flex-col flex-wrap">
            <div class="flex flex-col gap-4 h-full w-80">
                <h1 class="text-left font-black text-[10px] mb-1 ml-1 text-zinc-500 tracking-[0.1em] uppercase">Click Events</h1>
                
                {/* 1. Destroy */}
                <MouseEventCheckboxOption 
                    label="Destroy On Click?" 
                    checked={props.mouseEvent.destroyOnClick} 
                    handleInput={(e) => props.mouseEvent.destroyOnClick = e.currentTarget.checked} 
                />
                
                {/* 2. Duplicate */}
                <MouseEventCheckboxOption 
                    note="This only works in Player Mode." 
                    label="Duplicate On Click?" 
                    checked={props.mouseEvent.duplicateOnClick} 
                    handleInput={(e) => props.mouseEvent.duplicateOnClick = e.currentTarget.checked} 
                />
                
                {/* 3. Color - TO DZIAŁAŁO DOBRZE */}
                <MouseEventClickColor
                    checkboxOnInput={(e) => props.mouseEvent.clickColorChange = e.currentTarget.checked}
                    colorOnInput={(e) => props.mouseEvent.targetColor = hexToRgb(e.currentTarget.value)}
                    value={rgbToHex(props.mouseEvent.targetColor)}
                    checked={props.mouseEvent.clickColorChange}
                />
                
                {/* 4. Audio - TERAZ ZROBIONE IDENTYCZNIE JAK COLOR */}
                <MouseEventClickAudio />

            </div>
        </div>
    )
}

export default MouseEventList