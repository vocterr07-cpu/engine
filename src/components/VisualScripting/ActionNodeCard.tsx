import { Play } from "lucide-solid";
import type { ScriptNode } from "../../engine/VisualScript";
import { For } from "solid-js";

interface NodeProps {
    node: ScriptNode;
    isSelected: boolean;
    isLast: boolean; // Ważne: czy to ostatni element?
    onClick: () => void;
}

export const ActionNodeCard = (props: NodeProps) => {
    // Style dla Node'a (Domyślnie zielony, po wybraniu fioletowy)
    const theme = props.isSelected
        ? {
            border: "border-purple-500/50",
            bg: "from-purple-500/10 to-purple-900/5",
            line: "bg-purple-500",
            dot: "bg-purple-400 ring-purple-500/30"
        }
        : {
            border: "border-zinc-700 group-hover:border-zinc-500",
            bg: "from-zinc-800/30 to-zinc-900/30",
            line: "bg-zinc-700",
            dot: "bg-zinc-500 ring-zinc-700/50 group-hover:bg-zinc-300"
        };

    return (
        <div class="relative w-full pl-0 group">

            {/* --- TIMELINE (LINIA) --- */}
            {/* left-9 to połowa szerokości paddingu/marginesu rodzica, celujemy w środek */}
            <div
                class={`absolute left-[-39px] top-0 w-px transition-colors duration-300 ${theme.line}`}
                // Jeśli to ostatni element, linia idzie tylko do połowy (do kropki). 
                // Jeśli nie, idzie do samego dołu + odstęp (space-y).
                style={{ height: "calc(100% + 16px)" }}
            ></div>

            {/* --- TIMELINE (KROPKA) --- */}
            <div class={`
                absolute left-[-42px] top-1/2 -translate-y-1/2 
                w-2 h-2 rounded-full ring-4 transition-all duration-300 z-10
                ${theme.dot}
            `}></div>


            {/* --- KARTA --- */}
            <div
                onClick={props.onClick}
                class={`
                    cursor-pointer w-full p-4 rounded-xl border transition-all duration-200
                    bg-gradient-to-br shadow-lg hover:shadow-xl hover:translate-x-1
                    ${theme.border} ${theme.bg}
                `}
            >
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <Play size={14} class={props.isSelected ? "text-purple-400" : "text-zinc-400"} />
                        <span class="font-bold text-sm text-zinc-200">{props.node.title}</span>
                    </div>
                </div>

                {/* Renderowanie Inputów (Opcjonalnie) */}
                <div class="mt-2 flex flex-wrap gap-2">
                    <For each={Object.entries(props.node.inputs)}>
                        {([key, val]) => (
                            <div class="text-[10px] bg-zinc-950/50 border border-zinc-800 px-2 py-0.5 rounded text-zinc-500 font-mono">
                                {key}: <span class="text-zinc-300">{val}</span>
                            </div>
                        )}
                    </For>
                </div>
            </div>
        </div>
    );
};