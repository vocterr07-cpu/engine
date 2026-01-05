import type { Component, JSX, SplitProps } from "solid-js";
import { Show } from "solid-js";
import type { LucideIcon } from "lucide-solid";

// 1. Kontener Główny (Pudełko Menu)
export const MenuContainer: Component<{ children: JSX.Element }> = (props) => {
    return (
        <div class="absolute top-[calc(100%+4px)] left-0 min-w-[240px] bg-zinc-950/95 backdrop-blur-md border border-zinc-800 rounded-lg shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-left">
            {props.children}
        </div>
    );
};

// 2. Nagłówek Sekcji (np. PROJECT, IMPORT)
export const MenuHeader: Component<{ title: string }> = (props) => {
    return (
        <div class="px-3 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider select-none">
            {props.title}
        </div>
    );
};

// 3. Separator (Linia)
export const MenuSeparator: Component = () => {
    return <div class="h-px bg-zinc-800 my-1 mx-2"></div>;
};

// 4. Element Menu (Przycisk)
interface MenuItemProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    icon?: LucideIcon; // Opcjonalna ikona z lucide
    shortcut?: string; // Np. "Ctrl+S"
    variant?: "default" | "danger"; // Możemy dodać np. czerwony przycisk usuwania
}

export const MenuItem: Component<MenuItemProps> = (props) => {
    // Rozdzielamy propsy, żeby onClick i inne trafiały do buttona
    const { label, icon: Icon, shortcut, variant, class: className, ...rest } = props;

    return (
        <button
            class={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between group
                ${props.disabled 
                    ? "opacity-50 cursor-not-allowed text-zinc-500" 
                    : "text-zinc-300 hover:bg-blue-600 hover:text-white"
                }
                ${className || ""}
            `}
            {...rest}
        >
            <div class="flex items-center gap-2">
                <Show when={Icon}>
                    <div class={`text-zinc-500 group-hover:text-white ${props.disabled ? "" : "group-hover:text-white"}`}>
                        {/* @ts-ignore - Solid czasem marudzi przy dynamicznych ikonach, ale działa */}
                        <Icon size={16} />
                    </div>
                </Show>
                <span>{label}</span>
            </div>
            
            <Show when={shortcut}>
                <span class="text-xs text-zinc-600 group-hover:text-blue-200 font-mono">
                    {shortcut}
                </span>
            </Show>
        </button>
    );
};