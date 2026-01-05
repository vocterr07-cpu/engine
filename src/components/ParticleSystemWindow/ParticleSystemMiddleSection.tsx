import { createSignal } from "solid-js"
import { RangeControl } from "./ParticleSystemWindow"
import { state } from "../../engine/store";

interface Props {
    refreshValues: number;
}

const ParticleSystemMiddleSection = (props: Props) => {
    const [refresh, setRefresh] = createSignal(0);
    const update = () => setRefresh(r => r + 1);
    const ps = () => {
        props.refreshValues
        refresh();
        return state.selectedParticleSystem;
    }

    const getLifetimeValue = () => {
        const particle = ps();
        if (!particle) return 0;
        return particle.lifetime;
    }

    const getStartSizeValue = () => {
        const particle = ps();
        if (!particle) return 0;
        return particle.startSize;
    }

    const getEmissionRateValue = () => {
        const particle = ps();
        if (!particle) return 0;
        return particle.maxParticles;
    }

    const getSpreadValue = () => {
        const particle = ps();
        if (!particle) return 0;
        return particle.spread;
    }
  return (
    <div class="col-span-5 bg-zinc-900/50 border-r border-zinc-800 p-4">
        {/* HEADER */}
        <div class="pb-3 w-full border-b border-zinc-800 mb-4 flex justify-between items-center">
             <h1 class="font-black text-zinc-500/80 text-[10px] uppercase tracking-[0.2em]">Main Emitter</h1>
             <div class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
        </div>

        {/* CONTROLS */}
        <div class="flex flex-col space-y-1">
            {/* Przykłady z różnymi kolorami */}
            <RangeControl 
                label="Emission Rate" 
                value={getStartSizeValue()} 
                min={0.1} max={5} 
                step={0.1} 
                unit="p"
                accentColor="blue" 
                onInput={(e: Event & {currentTarget: HTMLInputElement}) => {
                    const particle = ps();
                    if (!particle) return;
                    particle.startSize = parseFloat(e.currentTarget.value);
                    update();
                }}
            />
            
            <RangeControl 
                label="Particle Lifetime" 
                value={getLifetimeValue()} 
                min={0.1} max={10} 
                step={0.1} 
                unit="s"
                accentColor="orange" 
                onInput={(e: Event & {currentTarget: HTMLInputElement}) => {
                    const particle = ps();
                    if (!particle) return;
                    particle.lifetime = parseFloat(e.currentTarget.value);
                    update();
                }}
            />

            <RangeControl 
                label="Start Size" 
                value={getEmissionRateValue()} 
                min={10} max={1000} 
                step={5} 
                unit="p"
                accentColor="purple" 
                onInput={(e: Event & {currentTarget: HTMLInputElement}) => {
                    const particle = ps();
                    if (!particle) return;
                    particle.maxParticles = parseFloat(e.currentTarget.value);
                    update();
                }}
            />
            <RangeControl 
                label="Spread Rate" 
                value={getSpreadValue()} 
                min={0.001} max={1} 
                step={0.01} 
                unit=""
                accentColor="blue" 
                onInput={(e: Event & {currentTarget: HTMLInputElement}) => {
                    const particle = ps();
                    if (!particle) return;
                    particle.spread = parseFloat(e.currentTarget.value);
                    update();
                }}
            />
        </div>
    </div>
  )
}

export default ParticleSystemMiddleSection;