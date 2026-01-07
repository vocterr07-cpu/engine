import { Atom, Globe, Monitor, Settings2, X, type LucideProps } from "lucide-solid";
import { createSignal, For, Match, Switch, type Component } from "solid-js";
import { state, storeActions } from "../../../../engine/store";
import { parseNumericInput } from "../../../../helpers/parseNumericInput";

interface Props {
    isOpened: boolean,
    setModalOpened: (modalName: string) => void;
}

interface Tab {
    name: string;
    icon: Component<LucideProps>
}

const GamePropertiesModal = (props: Props) => {
    const [activeTab, setActiveTab] = createSignal("General");

    const tabs = [
        { name: "General", icon: Globe },
        { name: "Physics", icon: Atom },
        { name: "Graphics", icon: Monitor },
    ]

    const handleCloseWindow = () => {
        props.setModalOpened("")
    }

    return (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">

            <div class="absolute inset-0" onClick={handleCloseWindow}></div>

            <div class="relative bg-zinc-900 border border-zinc-700 w-[90vw] max-w-4xl h-[80vh] max-h-[700px] rounded-xl shadow-2xl shadow-black flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* --- HEADER --- */}
                <nav class="flex items-center justify-between p-6 border-b border-zinc-700 bg-zinc-900/50">
                    <div class="flex items-center gap-4">
                        <div class="p-2.5 rounded-lg bg-orange-500/10 border-orange-500/30 border shadow-[0_0_15px_-5px_rgba(249,115,22,0.3)]">
                            <Settings2 class="text-orange-500" />
                        </div>
                        <div>
                            <h1 class="text-lg font-extrabold tracking-[0.005em] text-zinc-100">Game Properties</h1>
                            <p class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.05em]">Project Settings</p>
                        </div>
                    </div>
                    <button onClick={handleCloseWindow} class="rounded-lg p-2 hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors duration-200">
                        <X />
                    </button>
                </nav>

                {/* --- BODY --- */}
                <div class="flex w-full h-full overflow-hidden">
                    {/* SIDEBAR */}
                    <aside class="flex flex-col w-[25%] min-w-[200px] bg-zinc-950 border-r border-zinc-700 p-3 space-y-1 h-full overflow-y-auto shrink-0">
                        <h1 class="text-zinc-600 font-black uppercase tracking-widest text-[10px] py-2 mb-1 px-2">Categories</h1>
                        <For each={tabs}>
                            {(tab) => (
                                <CategoryTab
                                    isSelected={activeTab() === tab.name}
                                    tab={tab}
                                    onClick={() => setActiveTab(tab.name)}
                                />
                            )}
                        </For>
                    </aside>

                    {/* CONTENT */}
                    <main class="flex flex-col flex-grow bg-zinc-900 overflow-y-auto custom-scrollbar">
                        <div class="p-8 max-w-2xl">
                            <Switch>
                                {/* --- GENERAL TAB --- */}
                                <Match when={activeTab() === "General"}>
                                    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div class="space-y-1 border-b border-zinc-800 pb-4">
                                            <h1 class="font-extrabold text-2xl text-white">General Settings</h1>
                                            <p class="font-medium text-zinc-500 text-xs">Basic information regarding your game project.</p>
                                        </div>
                                        
                                        <div class="space-y-5">
                                            <Input
                                                value={state.projectSettings.projectName}
                                                onInput={(e) => storeActions.updateProjectSettings({ projectName: e.currentTarget.value })}
                                                label="Project Name"
                                            />
                                            <div class="flex gap-4">
                                                <div class="w-1/3">
                                                    <Input
                                                        value={state.projectSettings.version}
                                                        onInput={(e) => storeActions.updateProjectSettings({ version: e.currentTarget.value })}
                                                        label="Version"
                                                    />
                                                </div>
                                                <div class="flex-grow">
                                                    <Input
                                                        value={state.projectSettings.author}
                                                        onInput={(e) => storeActions.updateProjectSettings({ author: e.currentTarget.value })}
                                                        label="Author / Company"
                                                    />
                                                </div>
                                            </div>
                                            <TextArea
                                                value={state.projectSettings.description}
                                                onInput={(e) => storeActions.updateProjectSettings({ description: e.currentTarget.value })}
                                                label="Description"
                                                rows={4}
                                            />
                                        </div>
                                    </div>
                                </Match>

                                {/* --- PHYSICS TAB --- */}
                                <Match when={activeTab() === "Physics"}>
                                    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div class="space-y-1 border-b border-zinc-800 pb-4">
                                            <h1 class="font-extrabold text-2xl text-white">Physics Simulation</h1>
                                            <p class="font-medium text-zinc-500 text-xs">Global gravity and time stepping configuration.</p>
                                        </div>

                                        <div class="space-y-6">
                                            <div class="p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl space-y-6">
                                                <Input
                                                    label="Gravity Y (Vertical)"
                                                    value={state.projectSettings.gravity.toString()}
                                                    onInput={(e) => {
                                                        const val = parseNumericInput(e.currentTarget.value);
                                                        storeActions.updateProjectSettings({ gravity: val ?? 0 })
                                                    }}
                                                />
                                                <Input
                                                    label="Fixed Time Step (sec)"
                                                    value={state.projectSettings.fixedTimeStep.toString()}
                                                    onInput={(e) => {
                                                        const val = parseNumericInput(e.currentTarget.value);
                                                        storeActions.updateProjectSettings({ fixedTimeStep: val ?? 0.016 })
                                                    }}
                                                />
                                            </div>
                                            <p class="text-[10px] text-zinc-600 italic">
                                                * Changes to physics settings might require restarting the scene to take full effect.
                                            </p>
                                        </div>
                                    </div>
                                </Match>

                                {/* --- GRAPHICS TAB --- */}
                                <Match when={activeTab() === "Graphics"}>
                                    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div class="space-y-1 border-b border-zinc-800 pb-4">
                                            <h1 class="font-extrabold text-2xl text-white">Rendering & Quality</h1>
                                            <p class="font-medium text-zinc-500 text-xs">Adjust visual fidelity and performance.</p>
                                        </div>

                                        <div class="space-y-6">
                                            <Range 
                                                label="Pixel Ratio (Resolution Scale)"
                                                value={state.projectSettings.pixelRatio}
                                                min={0.5} max={2.0} step={0.1}
                                                onInput={(e) => storeActions.updateProjectSettings({ pixelRatio: parseFloat(e.currentTarget.value) })}
                                            />
                                            
                                            <div class="grid grid-cols-2 gap-4">
                                                <Toggle 
                                                    label="Enable Shadows"
                                                    checked={state.projectSettings.shadowsEnabled}
                                                    onChange={(val) => storeActions.updateProjectSettings({ shadowsEnabled: val })}
                                                />
                                                <Toggle 
                                                    label="Anti-Aliasing (MSAA)"
                                                    checked={state.projectSettings.antialiasing}
                                                    onChange={(val) => storeActions.updateProjectSettings({ antialiasing: val })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Match>
                            </Switch>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}

// --- SUB COMPONENTS ---

interface CategoryTabProps {
    tab: Tab;
    isSelected: boolean;
    onClick: () => void;
}
export const CategoryTab = (props: CategoryTabProps) => {
    return (
        <div onClick={props.onClick} class={`flex cursor-pointer select-none items-center gap-3 rounded-lg border transition-all duration-200 px-3 py-2.5 ${
            props.isSelected 
                ? "bg-orange-500/10 border-orange-500/20 text-orange-500 shadow-sm" 
                : "border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            }`}>
            <props.tab.icon size={18} class={`transition-transform duration-200 ${props.isSelected ? "scale-105" : ""}`} />
            <span class="font-bold text-xs uppercase tracking-wide">{props.tab.name}</span>
        </div>
    );
}

interface InputProps {
    label: string;
    onInput: (e: Event & { currentTarget: HTMLInputElement }) => void;
    value: string;
}
export const Input = (props: InputProps) => {
    return (
        <div class="flex flex-col text-left space-y-1.5">
            <label class="font-semibold text-zinc-400 text-[11px] uppercase tracking-wider ml-1">{props.label}</label>
            <input
                spellcheck={false}
                value={props.value}
                onInput={props.onInput}
                type="text"
                class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 shadow-sm placeholder-zinc-700 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 outline-none transition-all duration-200"
            />
        </div>
    );
}

interface TextAreaProps {
    label: string;
    onInput: (e: Event & { currentTarget: HTMLTextAreaElement }) => void;
    value: string;
    rows?: number;
}
export const TextArea = (props: TextAreaProps) => {
    return (
        <div class="flex flex-col text-left space-y-1.5">
            <label class="font-semibold text-zinc-400 text-[11px] uppercase tracking-wider ml-1">{props.label}</label>
            <textarea
                spellcheck={false}
                value={props.value}
                onInput={props.onInput}
                rows={props.rows || 3}
                class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 shadow-sm resize-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 outline-none transition-all duration-200 custom-scrollbar"
            />
        </div>
    );
}

interface RangeProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onInput: (e: Event & { currentTarget: HTMLInputElement }) => void;
}
export const Range = (props: RangeProps) => {
    return (
        <div class="flex flex-col space-y-3 p-4 bg-zinc-950/30 border border-zinc-800/50 rounded-xl">
            <div class="flex justify-between items-center">
                <label class="font-semibold text-zinc-400 text-[11px] uppercase tracking-wider">{props.label}</label>
                <span class="font-mono text-xs text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">{props.value}</span>
            </div>
            <input 
                type="range" 
                min={props.min} max={props.max} step={props.step} value={props.value} 
                onInput={props.onInput}
                class="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
        </div>
    )
}

interface ToggleProps {
    label: string;
    checked: boolean;
    onChange: (val: boolean) => void;
}
export const Toggle = (props: ToggleProps) => {
    return (
        <div 
            onClick={() => props.onChange(!props.checked)}
            class="flex select-none items-center justify-between p-3 bg-zinc-950/30 border border-zinc-800/50 rounded-xl cursor-pointer hover:bg-zinc-900/50 transition-colors group"
        >
            <span class="font-semibold text-zinc-400 text-[11px] uppercase tracking-wider group-hover:text-zinc-300 transition-colors">{props.label}</span>
            <div class={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${props.checked ? "bg-orange-600" : "bg-zinc-700"}`}>
                <div class={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-300 ${props.checked ? "translate-x-5" : "translate-x-0"}`}></div>
            </div>
        </div>
    )
}

export default GamePropertiesModal;