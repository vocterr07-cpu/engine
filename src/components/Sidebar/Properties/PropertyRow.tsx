import { createEffect, createSignal } from "solid-js";

interface PropertyRowProps {
    label: string;
    value: number;
    colorClass: string;
    min?: number;
    max?: number;
    step?: number;
    // Ważne: onInput przyjmuje number, bo walidację robimy w środku
    onInput: (val: number) => void;
}

const PropertyRow = (props: PropertyRowProps) => {
    // 1. Lokalny stan dla tekstu (bufor edycji)
    const [inputValue, setInputValue] = createSignal(props.value.toFixed(2));
    const [isEditing, setIsEditing] = createSignal(false);

    // 2. Synchronizacja: Props -> Text Input
    // To odpala się, gdy Silnik LUB Suwak zmieni wartość, a my NIE piszemy
    createEffect(() => {
        if (!isEditing()) {
            setInputValue(props.value.toFixed(2));
        }
    });

    // 3. Obsługa wpisywania tekstu (z walidacją)
    const handleTextInput = (e: InputEvent & { currentTarget: HTMLInputElement }) => {
        let val = e.currentTarget.value;
        
        // Zezwól tylko na cyfry, kropkę i minus
        val = val.replace(/[^0-9.-]/g, "");
        if ((val.match(/\./g) || []).length > 1) return;
        if (val.lastIndexOf("-") > 0) return;

        setInputValue(val); // Aktualizuj tekst w okienku

        // Próbuj wysłać do silnika/suwaka
        const parsed = parseFloat(val);
        if (!isNaN(parsed) && val !== "-" && !val.endsWith(".")) {
            props.onInput(parsed);
        }
    };

    return (
        <div class="flex flex-col gap-1">
            <div class="flex items-center justify-between px-1">
                <span class={`text-[10px] font-bold ${props.colorClass}`}>{props.label}</span>
                <span class="text-[10px] text-zinc-500 font-mono">{props.value.toFixed(2)}</span>
            </div>
            
            <div class="flex items-center gap-2">
                {/* SUWAK: Sterowany bezpośrednio przez props.value */}
                <input 
                    type="range" 
                    min={props.min ?? -10} 
                    max={props.max ?? 10} 
                    step={props.step ?? 0.01}
                    value={props.value}
                    onInput={(e) => props.onInput(parseFloat(e.currentTarget.value))}
                    class="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                
                {/* TEXT INPUT: Sterowany przez lokalny bufor */}
                <input
                    type="text"
                    value={inputValue()} 
                    onFocus={() => setIsEditing(true)}
                    onBlur={() => {
                        setIsEditing(false);
                        setInputValue(props.value.toFixed(2));
                    }}
                    onInput={handleTextInput}
                    class="w-14 bg-zinc-950 border border-zinc-700 rounded px-1 py-0.5 text-[10px] text-zinc-200 focus:border-blue-500 outline-none transition-colors font-mono"
                />
            </div>
        </div>
    );
};

export default PropertyRow;