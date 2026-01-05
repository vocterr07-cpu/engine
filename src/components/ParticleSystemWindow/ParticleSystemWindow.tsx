
// Importujemy nasze nowe, śliczne komponenty

import { createSignal, Show, type Component } from "solid-js";
import ParticleSystemTopbar from "./ParticleSystemTopbar";
import { Flame, Info, Magnet, type LucideProps } from "lucide-solid";
import ParticleSystemLeftSection from "./ParticleSystemLeftSection";
import ParticleSystemMiddleSection from "./ParticleSystemMiddleSection";
import ParticleSystemRightSection from "./ParticleSystemRightSection";
import type { JSX } from "solid-js";
const ParticleSystemWindow: Component = () => {
    const [refeshValues, setRefreshValues] = createSignal(0);
    const updateValues = () => setRefreshValues(r => r + 1);

    return (
        <div class="bg-zinc-900 h-full w-full flex flex-col text-zinc-300 select-none overflow-hidden font-sans">
            <ParticleSystemTopbar />
            <div class="h-full w-full bg-zinc-900 grid grid-cols-12">
                <ParticleSystemLeftSection  updateValues={updateValues}/>
                <ParticleSystemMiddleSection refreshValues={refeshValues()} />
                <ParticleSystemRightSection />
            </div>
        </div>
    );
};

interface PresetCardProps {
    label: string;
    icon: Component<LucideProps>;
    isActive: boolean;
    onClick: () => void;
    bgColor: string;
    textColor: string;
    gradient: string;
    borderColor: string;
    hoverColor: string;
}

export const ParticlePresetCard = (props: PresetCardProps) => {
    return (
        <div onClick={props.onClick} class={`group  flex flex-col p-4 bg-zinc-800/30 border transition-all  cursor-pointer  rounded-lg ${props.isActive ? "bg-gradient-to-br from-purple-600/10 via-transparent to-transparent border-purple-600/60 hover:border-purple-600/80 shadow-[0_0_15px_-5px_rgba(147,51,234,0.4)]" : `bg-gradient-to-br ${props.gradient} ${props.borderColor} ${props.hoverColor}`}`}>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class={`p-2 rounded-lg ${props.bgColor}`}>
                        <props.icon class={`${props.textColor}`} />
                    </div>
                    <h1 class="text-zinc-300 group-hover:text-zinc-100 transition-colors duration-300 font-bold tracking-[0.05em] text-sm uppercase">{props.label}</h1>
                </div>
                <div class={`w-3 h-3 rounded-full ${props.isActive ? `bg-purple-600/70` : "bg-zinc-700"}`}></div>
            </div>
        </div>
    )
}

// 1. Zestaw kolorów (możesz to wynieść do osobnego pliku config)
const RANGE_COLORS = {
    blue: {
        text: "text-blue-500",
        bg: "bg-blue-500",
        bgLight: "bg-blue-500/10",
        border: "border-blue-500/20",
        focusBorder: "focus-within:border-blue-500/60",
        glow: "shadow-[0_0_10px_rgba(59,130,246,0.5)]",
        hex: "#3b82f6"
    },
    orange: {
        text: "text-orange-500",
        bg: "bg-orange-500",
        bgLight: "bg-orange-500/10",
        border: "border-orange-500/20",
        focusBorder: "focus-within:border-orange-500/60",
        glow: "shadow-[0_0_10px_rgba(249,115,22,0.5)]",
        hex: "#f97316"
    },
    purple: {
        text: "text-purple-500",
        bg: "bg-purple-500",
        bgLight: "bg-purple-500/10",
        border: "border-purple-500/20",
        focusBorder: "focus-within:border-purple-500/60",
        glow: "shadow-[0_0_10px_rgba(168,85,247,0.5)]",
        hex: "#a855f7"
    },
    // Domyślny szary/biały
    zinc: {
        text: "text-zinc-400",
        bg: "bg-zinc-400",
        bgLight: "bg-zinc-800",
        border: "border-zinc-700",
        focusBorder: "focus-within:border-zinc-500",
        glow: "shadow-none",
        hex: "#a1a1aa"
    }
};

interface RangeProps {
    label: string;
    value: number;       // To przychodzi z góry
    min?: number;
    max?: number;
    step?: number;
    accentColor?: keyof typeof RANGE_COLORS; // np. "blue", "orange"
    unit?: string;       // np. "px", "%", "s"
    // Logikę onChange dodasz sobie sam
    onInput?: any;
}

export const RangeControl: Component<RangeProps> = (props) => {
    const min = () => props.min ?? 0;
    const max = () => props.max ?? 100;

    // Obliczamy procent dla gradientu tła (wypełnienie paska)
    const percentage = () => ((props.value - min()) / (max() - min())) * 100;

    const theme = () => RANGE_COLORS[props.accentColor || "blue"] || RANGE_COLORS.blue;

    return (
        <div class="mb-4 last:mb-0 group select-none">
            {/* --- HEADER: LABEL + VALUE --- */}
            <div class="flex items-end justify-between mb-2">
                <label class="text-[9px] font-black text-zinc-500 uppercase tracking-[0.1em] ml-0.5 group-hover:text-zinc-300 transition-colors">
                    {props.label}
                </label>

                <div class={`
                    flex items-center gap-2 px-2 py-0.5 rounded border bg-zinc-900/50 transition-colors duration-300
                    ${theme().border} ${theme().focusBorder}
                `}>
                    <span class={`text-[8px] font-bold uppercase ${theme().text} opacity-70`}>Val:</span>
                    <input
                        type="number"
                        value={props.value.toFixed(3)}
                        class="w-12 bg-transparent text-[10px] font-mono text-zinc-300 outline-none text-right"
                        onInput={(e) => props.onInput(e)}
                    />
                    {props.unit && <span class="text-[8px] text-zinc-600 font-mono">{props.unit}</span>}
                </div>
            </div>

            {/* --- NATIVE RANGE INPUT --- */}
            <div class="relative h-4 flex items-center">
                <input
                    type="range"
                    min={min()}
                    max={max()}
                    step={props.step || 0.01}
                    value={props.value}
                    onInput={(e) => props.onInput(e)}
                    class={`
                        w-full appearance-none bg-transparent cursor-pointer
                        /* STYLIZACJA PASKA (Track) */
                        [&::-webkit-slider-runnable-track]:h-1
                        [&::-webkit-slider-runnable-track]:rounded-full
                        [&::-moz-range-track]:h-1
                        [&::-moz-range-track]:rounded-full

                        /* STYLIZACJA KROPKI (Thumb) */
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:h-3
                        [&::-webkit-slider-thumb]:w-3
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-zinc-100
                        [&::-webkit-slider-thumb]:border-2
                        [&::-webkit-slider-thumb]:border-zinc-900
                        [&::-webkit-slider-thumb]:-mt-[4px] /* Wycentrowanie względem tracka */
                        [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,0,0,0.5)]
                        [&::-webkit-slider-thumb]:transition-transform
                        [&::-webkit-slider-thumb]:duration-75
                        active:[&::-webkit-slider-thumb]:scale-125

                        [&::-moz-range-thumb]:appearance-none
                        [&::-moz-range-thumb]:h-3
                        [&::-moz-range-thumb]:w-3
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-zinc-100
                        [&::-moz-range-thumb]:border-2
                        [&::-moz-range-thumb]:border-zinc-900
                        [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(0,0,0,0.5)]
                    `}
                    style={{
                        // Magia: gradient udający wypełnienie paska
                        background: `linear-gradient(to right, ${theme().hex} ${percentage()}%, #27272a ${percentage()}%)`,
                        "border-radius": "999px"
                    }}
                />
            </div>
        </div>
    );
};


// 1. Definiujemy propsy, żebyś mógł sterować wszystkim z góry
interface BehaviorCardProps {
    title: string;
    description: string;
    icon: Component<LucideProps>; // Typ dla ikony z Lucide
    isActive: boolean;            // Czy moduł jest włączony?
    onToggle: () => void;         // Funkcja zmieniająca stan
    children?: JSX.Element;       // To są te suwaki, które wpadną do środka

    // Opcjonalnie: kolor akcentu (default: orange)
    accent?: "orange" | "blue" | "purple" | "green";
    disclaimer: string;
}

// 2. Mapa stylów (żeby nie śmiecić w JSX)
const THEMES = {
    orange: {
        activeBorder: "border-orange-500/50",
        activeBg: "bg-zinc-800/60",
        glow: "shadow-[0_0_20px_-10px_rgba(249,115,22,0.3)]",
        iconBg: "bg-orange-500/10",
        iconText: "text-orange-500",
        indicator: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"
    },
    blue: {
        activeBorder: "border-blue-500/50",
        activeBg: "bg-zinc-800/60",
        glow: "shadow-[0_0_20px_-10px_rgba(59,130,246,0.3)]",
        iconBg: "bg-blue-500/10",
        iconText: "text-blue-500",
        indicator: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
    },
    purple: {
        activeBorder: "border-purple-500/50",
        activeBg: "bg-zinc-800/60",
        glow: "shadow-[0_0_20px_-10px_rgba(168,85,247,0.3)]",
        iconBg: "bg-purple-500/10",
        iconText: "text-purple-500",
        indicator: "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
    },
    green: {
        activeBorder: "border-green-500/50",
        activeBg: "bg-zinc-800/60",
        glow: "shadow-[0_0_20px_-10px_rgba(34,197,94,0.3)]",
        iconBg: "bg-green-500/10",
        iconText: "text-green-500",
        indicator: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"
    }
};

export const ParticleBehaviorCard: Component<BehaviorCardProps> = (props) => {
    const [showInfoModal, setShowInfoModal] = createSignal(false);
    const theme = THEMES[props.accent || "orange"];

    return (
        <div

            class={`
                relative flex flex-col transition-all duration-300 rounded-xl border
                ${props.isActive
                    ? `${theme.activeBg} ${theme.activeBorder} ${theme.glow}`
                    : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/20"
                }
            `}
        >
            {/* --- HEADER (Zawsze widoczny, klikalny) --- */}
            <div
                onClick={props.onToggle}
                class="flex items-center justify-between p-4 cursor-pointer group select-none"
            >
                <div class="flex items-center gap-4">
                    {/* IKONA */}
                    <div class={`
                        rounded-lg p-2.5 transition-colors duration-300 border border-transparent
                        ${props.isActive ? theme.iconBg : "bg-zinc-800 group-hover:bg-zinc-700"}
                    `}>
                        <props.icon
                            size={20}
                            class={`transition-colors duration-300 ${props.isActive ? theme.iconText : "text-zinc-500 group-hover:text-zinc-300"}`}
                        />
                    </div>

                    {/* TEKSTY */}
                    <div class="flex flex-col space-y-1">
                        <h1 class={`
                            font-black tracking-[0.1em] text-[11px] uppercase transition-colors duration-300
                            ${props.isActive ? "text-zinc-100" : "text-zinc-400 group-hover:text-zinc-200"}
                        `}>
                            {props.title}
                        </h1>
                        <p class="font-mono text-[10px] text-zinc-600 font-medium leading-tight max-w-[180px]">
                            {props.description}
                        </p>
                    </div>
                    <div onMouseOver={() => setShowInfoModal(true)} onMouseLeave={() => setShowInfoModal(false)} class="relative bg-blue-500/20 rounded-full">
                        <Info class="text-blue-500 cursor-help" />
                        <Show when={showInfoModal()}>
                            <div class="absolute top-[120%] z-50 left-1/2 w-60 translate-x-[-50%]  bg-zinc-800 rounded-lg border border-blue-500/30 p-3">
                                <p class="text-blue-300/80  text-xs font-mono">{props.disclaimer}</p>
                            </div>
                        </Show>
                    </div>
                </div>

                {/* INDICATOR (Kropka) */}
                <div class={`
                    h-2.5 w-2.5 rounded-full transition-all duration-500
                    ${props.isActive ? theme.indicator : "bg-zinc-700 border border-zinc-600"}
                `}>
                    {/* Opcjonalny efekt pulsowania wewnątrz kropki */}
                    <Show when={props.isActive}>
                        <div class={`w-full h-full rounded-full animate-ping opacity-75 ${theme.indicator}`}></div>
                    </Show>
                </div>
            </div>

            {/* --- BODY (Rozwijane inputy) --- */}
            {/* Używamy CSS Grid trick do animacji height: 0 -> auto */}
            <div class={`
                grid transition-[grid-template-rows] duration-300 ease-in-out
                ${props.isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}
            `}>
                <div class="overflow-hidden">
                    {/* Padding dodajemy tutaj, żeby nie psuł animacji zamknięcia */}
                    <div class="px-4 pb-4 pt-0 space-y-3">
                        {/* Delikatna linia oddzielająca */}
                        <div class="h-[1px] w-full bg-zinc-800/50 mb-3" />

                        {/* Tutaj renderujemy inputy przekazane jako children */}
                        {props.children}
                    </div>
                </div>
            </div>

        </div>
    );
}

export default ParticleSystemWindow;