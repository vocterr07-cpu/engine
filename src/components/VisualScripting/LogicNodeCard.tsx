import { createSignal, For } from "solid-js";
import { GitFork, Repeat, Play, Plus } from "lucide-solid";
import type { ScriptEvent, ScriptNode } from "../../engine/VisualScript";
import { ActionNodeCard } from "./ActionNodeCard"; // Importujemy zwykłą kartę
import NodeRenderer from "./NodeRenderer";
import AddNodeButton from "./AddNodeButton";
import AddNodeWithParentButton from "./AddNodeWithParentButton";

interface Props {
    node: ScriptNode;
    isSelected: boolean;
    onClick: (id: string) => void;
    // Potrzebujemy przekazać te funkcje dalej do dzieci
    onNodeSelect: (id: string) => void;
    event: ScriptEvent;
    update: () => void;
    refresh: number;
}

export const LogicNodeCard = (props: Props) => {
    // Ikona zależna od typu logiki
    const Icon = props.node.title === "Loop" ? Repeat : GitFork;

    // Kolorystyka dla bloków logicznych (możesz zmienić na np. pomarańczowy dla Loop)
    const isIf = props.node.title === "If Condition";
    const accentColor = isIf ? "text-blue-400" : "text-orange-400";
    const borderColor = isIf ? "border-blue-500/30" : "border-orange-500/30";
    const bgColor = props.isSelected
        ? "bg-blue-500/10 border-blue-500"
        : "bg-zinc-900/40 hover:bg-zinc-900/60 " + borderColor;

    const getChildrenNodes = () => {
        props.refresh;
        return props.node.children;
    }

    return (
        <div class="flex flex-col w-full relative group">

            {/* --- NAGŁÓWEK BLOKU (HEADER) --- */}
            <div
                onClick={(e) => { e.stopPropagation(); props.onClick(props.node.id); }}
                class={`
                    cursor-pointer w-full p-3 rounded-lg border transition-all duration-200
                    flex items-center gap-3 shadow-sm z-20 relative
                    ${bgColor}
                `}
            >
                <Icon size={16} class={accentColor} />
                <span class="font-bold text-sm text-zinc-200">{props.node.title}</span>

                {/* Podgląd Warunku */}
                {isIf && (
                    <div class="ml-auto text-[10px] font-mono bg-black/30 px-2 py-1 rounded text-blue-300 truncate max-w-[150px]">
                        {props.node.inputs.Condition || "false"}
                    </div>
                )}
                {props.node.title === "Loop" && (
                    <div class="ml-auto text-[10px] font-mono bg-black/30 px-2 py-1 rounded text-orange-300">
                        {props.node.inputs.Count || "0"}x
                    </div>
                )}
            </div>

            {/* --- CIAŁO BLOKU (CHILDREN) --- */}
            <div class="flex relative">
                {/* Linia Drzewa (Wcięcie) */}
                <div class={`w-4 border-l-2 ${props.isSelected ? "border-blue-500/50" : "border-zinc-700"} ml-4 my-2`}></div>

                {/* Kontener Dzieci */}
                <div class="flex-1 flex flex-col gap-2 py-2 pl-2">

                    <For each={getChildrenNodes()}>
                        {(childNode) => (
                            // REKURENCJA: Tutaj używamy Renderera, który zdecyduje co wyrenderować
                            <NodeRenderer  
                                refresh={props.refresh}
                                update={props.update}
                                event={props.event}
                                node={childNode}
                                selectedId={props.isSelected ? props.node.id : ""} // To trzeba poprawić w logice wyżej
                                onSelect={props.onNodeSelect}
                            />
                        )}
                    </For>
                    <AddNodeWithParentButton
                        update={props.update}
                        node={props.node}
                        event={props.event}
                    />
                    
                </div>
            </div>

            <div class="h-2 w-4 border-b-2 border-l-2 border-zinc-700 rounded-bl-lg ml-4 opacity-50"></div>
        </div>
    );
};