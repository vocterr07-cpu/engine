import { MousePointerClick, Zap, type LucideProps } from "lucide-solid";
import type { ScriptEvent } from "../../engine/VisualScript";
import type { Component } from "solid-js";

interface TriggerProps {
    event: ScriptEvent;
    isSelected: boolean;
    onClick: () => void;
    icon: Component<LucideProps>
}

export const TriggerCard = (props: TriggerProps) => {
    const theme = () => props.isSelected 
        ? {
            border: "border-purple-500/40",
            bg: "bg-purple-500/10",
            text: "text-purple-500",
            glow: "shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)]"
          }
        : {
            border: "border-orange-500/30",
            bg: "bg-orange-500/10",
            text: "text-orange-500",
            glow: "hover:shadow-[0_0_15px_-5px_rgba(249,115,22,0.3)]"
          };

    return (
        <div class="relative z-10 w-full mb-8">
            <div 
                onClick={props.onClick}
                class={`
                    relative flex cursor-pointer flex-col p-5 w-full rounded-2xl border transition-all duration-300
                    bg-gradient-to-br from-zinc-800/40 to-zinc-900/40 backdrop-blur-md
                    ${theme().border} ${theme().bg} ${theme().glow}
                `}
            >
                <div class="flex items-center gap-4">
                    {/* Wywołujemy theme().text */}
                    <div class={`p-3 rounded-xl border bg-zinc-950/30 ${theme().border} ${theme().text}`}>
                        {props.icon({size: 20})}
                    </div>

                    <div class="flex flex-col">
                        <span class={`text-[10px] font-black uppercase tracking-[0.15em] opacity-60 ${theme().text}`}>
                            Event Trigger
                        </span>
                        <span class="text-lg font-black uppercase tracking-wide text-zinc-200">
                            {props.event.name}
                        </span>
                    </div>
                </div>
            </div>
            <div class="absolute left-[9px] -bottom-8 w-px h-8 bg-zinc-700"></div>
        </div>
    );
};