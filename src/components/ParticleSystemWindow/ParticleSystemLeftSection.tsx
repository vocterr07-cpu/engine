import { Bubbles, Flame } from "lucide-solid"
import { ParticlePresetCard } from "./ParticleSystemWindow"
import { createSignal, For } from "solid-js"
import { state } from "../../engine/store";

interface Props {
    updateValues: () => void;
}

const ParticleSystemLeftSection = (props: Props) => {
    const [activePreset, setActivePreset] = createSignal("Fire");
    const PRESETS = [
        {label: "Fire", icon: Flame, bgColor: "bg-orange-500/10", textColor: "text-orange-500", gradient: "from-orange-600/10 via-transparent to-transparent", borderColor: "border-orange-600/30", hoverColor: "hover:border-orange-600/50", values: {
            spread: 0.5,
            lifetime: 1,
            startSize: 100,
            maxParticles: 1000
        }
            
        },
        {label: "Bubbles", icon: Bubbles, bgColor: "bg-blue-500/10", textColor: "text-blue-500", gradient: "from-blue-600/10 via-transparent to-transparent", borderColor: "border-blue-600/30", hoverColor: "horver:border-blue-600/50", values: {
            spread: 0.75,
            lifetime: 2.75,
            startSize: 300,
            maxParticles: 500}
        }
    ]

    const changePreset = (label: string) => {
        const ps = state.selectedParticleSystem;
        if (!ps) return;
        const preset = PRESETS.find(p => p.label === label);
        if (!preset) return;
        ps.spread = preset.values.spread;
        ps.lifetime = preset.values.lifetime;
        ps.startSize = preset.values.startSize;
        ps.maxParticles = preset.values.maxParticles
        setActivePreset(label);
        
        props.updateValues();
    }
    return (
        <div class="flex flex-col space-y-6 col-span-3  bg-zinc-800/30 border-r border-zinc-700/30 p-4">
            <div class="pb-3 w-full border-b border-zinc-800">
                <h1 class="font-black text-zinc-500/80 text-[10px] uppercase tracking-[0.1em]">Completed Presets</h1>
            </div>
            <For each={PRESETS}>
                {(preset) => (
                    <ParticlePresetCard
                    hoverColor={preset.hoverColor}
                    borderColor={preset.borderColor}
                    gradient={preset.gradient}
                    bgColor={preset.bgColor}
                    textColor={preset.textColor}
                    isActive={activePreset() === preset.label}
                    onClick={() => changePreset(preset.label)}
                     icon={preset.icon} 
                    label={preset.label} 
                    />
                )}
            </For>
        </div>
    )
}

export default ParticleSystemLeftSection