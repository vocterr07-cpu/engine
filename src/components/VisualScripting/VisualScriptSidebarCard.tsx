import { createMemo, Show, type Component } from 'solid-js'
import { Dynamic } from 'solid-js/web';
import { Keyboard, MousePointerClick, PlayCircle, Timer, Touchpad, Zap, type LucideProps } from "lucide-solid";
import type { ScriptEvent } from '../../engine/VisualScript';

interface Props {
    handleSelectEventTrigger: (id: string) => void;
    event: ScriptEvent;
    isSelected: boolean;
}

// 1. Definicja kolorów - MUSIMY podać pełne klasy dla Tailwinda
const THEMES: Record<string, { 
    glow: string, 
    borderActive: string, 
    borderHover: string, 
    bgActive: string, 
    bgHover: string,
    textActive: string,
    textIcon: string,
    dot: string
}> = {
    "On Start": { 
        glow: "rgba(59, 130, 246, 0.5)",
        borderActive: "border-blue-500/50",
        borderHover: "hover:border-blue-500/40",
        bgActive: "from-blue-500/20",
        bgHover: "hover:bg-blue-500/5",
        textActive: "text-blue-400",
        textIcon: "group-hover:text-blue-400",
        dot: "bg-blue-500"
    },
    "On Update": { 
        glow: "rgba(16, 185, 129, 0.5)",
        borderActive: "border-emerald-500/50",
        borderHover: "hover:border-emerald-500/40",
        bgActive: "from-emerald-500/20",
        bgHover: "hover:bg-emerald-500/5",
        textActive: "text-emerald-400",
        textIcon: "group-hover:text-emerald-400",
        dot: "bg-emerald-500"
    },
    "On Click": { 
        glow: "rgba(249, 115, 22, 0.5)",
        borderActive: "border-orange-500/50",
        borderHover: "hover:border-orange-500/40",
        bgActive: "from-orange-500/20",
        bgHover: "hover:bg-orange-500/5",
        textActive: "text-orange-400",
        textIcon: "group-hover:text-orange-400",
        dot: "bg-orange-500"
    },
    "On Mouse Click": { 
        glow: "rgba(249, 115, 22, 0.5)",
        borderActive: "border-orange-500/50",
        borderHover: "hover:border-orange-500/40",
        bgActive: "from-orange-500/20",
        bgHover: "hover:bg-orange-500/5",
        textActive: "text-orange-400",
        textIcon: "group-hover:text-orange-400",
        dot: "bg-orange-500"
    },
    "On Touch": { 
        glow: "rgba(245, 158, 11, 0.5)",
        borderActive: "border-amber-500/50",
        borderHover: "hover:border-amber-500/40",
        bgActive: "from-amber-500/20",
        bgHover: "hover:bg-amber-500/5",
        textActive: "text-amber-400",
        textIcon: "group-hover:text-amber-400",
        dot: "bg-amber-500"
    },
    "On Key Press": { 
        glow: "rgba(99, 102, 241, 0.5)",
        borderActive: "border-indigo-500/50",
        borderHover: "hover:border-indigo-500/40",
        bgActive: "from-indigo-500/20",
        bgHover: "hover:bg-indigo-500/5",
        textActive: "text-indigo-400",
        textIcon: "group-hover:text-indigo-400",
        dot: "bg-indigo-500"
    },
    "On Interact": { 
        glow: "rgba(99, 102, 241, 0.5)",
        borderActive: "border-indigo-500/50",
        borderHover: "hover:border-indigo-500/40",
        bgActive: "from-indigo-500/20",
        bgHover: "hover:bg-indigo-500/5",
        textActive: "text-indigo-400",
        textIcon: "group-hover:text-indigo-400",
        dot: "bg-indigo-500"
    },
    "Default": { 
        glow: "rgba(161, 161, 170, 0.5)",
        borderActive: "border-zinc-500/50",
        borderHover: "hover:border-zinc-500/40",
        bgActive: "from-zinc-500/20",
        bgHover: "hover:bg-zinc-500/5",
        textActive: "text-zinc-400",
        textIcon: "group-hover:text-zinc-400",
        dot: "bg-zinc-500"
    }
};

const EVENT_ICONS: Record<string, any> = {
    "On Start": PlayCircle,
    "On Update": Timer,
    "On Click": MousePointerClick,
    "On Mouse Click": MousePointerClick,
    "On Touch": Touchpad,
    "On Key Press": Keyboard,
};

const VisualScriptSidebarCard = (props: Props) => {
    const currentTheme = () => THEMES[props.event.name] || THEMES["Default"];
    const getIcon = () => EVENT_ICONS[props.event.name] || Zap;

    const cardStyles = createMemo(() => {
        const theme = currentTheme();
        const isSel = props.isSelected;

        return {
            container: isSel 
                ? `${theme.borderActive} bg-gradient-to-br ${theme.bgActive} via-zinc-900/40 to-transparent shadow-[0_0_20px_-5px_${theme.glow}]`
                : `border-zinc-800/60 bg-zinc-950/20 ${theme.borderHover} ${theme.bgHover}`,
            
            iconBox: isSel
                ? `bg-white/5 border-white/10 ${theme.textActive}`
                : `bg-zinc-900/50 border-zinc-800 text-zinc-500 ${theme.textIcon}`,
            
            text: isSel ? theme.textActive : `text-zinc-400 group-hover:text-zinc-200`
        };
    });

    return (
        <div 
            onClick={() => props.handleSelectEventTrigger(props.event.id)} 
            class={`self-center w-full group flex cursor-pointer flex-col p-3 rounded-xl border transition-all duration-300 ${cardStyles().container}`}
        >
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class={`p-2 rounded-lg border transition-all duration-300 ${cardStyles().iconBox}`}>
                        <Dynamic component={getIcon()} size={16} stroke-width={2.5} />
                    </div>
                    
                    <div class="flex flex-col">
                        <h1 class={`font-black tracking-[0.1em] text-[10px] uppercase transition-colors duration-300 ${cardStyles().text}`}>
                            {props.event.name}
                        </h1>
                        <Show when={props.isSelected}>
                            <span class={`text-[8px] font-bold uppercase opacity-50 ${currentTheme().textActive} animate-pulse`}>
                                Active View
                            </span>
                        </Show>
                    </div>
                </div>

                <Show when={props.isSelected}>
                    <div class={`w-1.5 h-1.5 rounded-full ${currentTheme().dot} shadow-[0_0_8px_${currentTheme().glow}]`} />
                </Show>
            </div>
        </div>
    )
}

export default VisualScriptSidebarCard;