import { X } from "lucide-solid"
import { state, storeActions } from "../../engine/store"


const ParticleSystemTopbar = () => {
    const { setOpenedWindow, setSelectedComponent, setSelectedParticleSystem } = storeActions;
    let inputRef: HTMLInputElement | undefined;
    const ps = () => {
        return state.selectedParticleSystem
    }

    const closeWindow = () => {
        setOpenedWindow("");
        setSelectedComponent(null);
        setSelectedParticleSystem(null);
    }

    const handleFileUpload = (e: Event & {currentTarget: HTMLInputElement}) => {
        const file = e.currentTarget.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        const ps = state.selectedParticleSystem;
        const engine = state.engine;
        if (!ps || !engine) return;
        ps.loadTexture(engine.gl, url);
    }
    return (
        <nav class="flex items-center justify-between h-16 w-full px-6 bg-zinc-900 border-b border-zinc-800/60">
            <div class="flex items-center gap-4">
                <h1 class="text-blue-500/60 text-[14px] font-black tracking-[0.1em] uppercase">Particle System Panel</h1>
                <div class="flex flex-col">
                    <p class="font-black uppercase text-[10px] font-mono text-zinc-500">Currently Editing:</p>
                    <p class="font-black text-[10px] font-mono text-zinc-300/80">{ps()?.name}</p>
                </div>

            </div>
            <div class="flex items-center gap-4">
                <button class="bg-zinc-800/70 rounded-md p-2 border border-zinc-800 text-zinc-300 font-bold text-sm tracking-[0.05em] hover:border-zinc-700 hover:bg-zinc-800/90 hover:text-zinc-100 transition-all" onClick={() => inputRef?.click()}>
                    Import Particle
                </button>
                <input 
                accept="image/*"
                type="file" 
                class="hidden"
                ref={inputRef}
                onChange={handleFileUpload}
                 />
                <button onClick={closeWindow} class="rounded-md p-2 hover:bg-zinc-800 transition-colors">
                    <X />
                </button>
            </div>

        </nav>
    )
}

export default ParticleSystemTopbar