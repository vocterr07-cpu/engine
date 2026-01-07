import { For, onCleanup, Show, type Component } from "solid-js";
import { Mountain, Move, Paintbrush, Rotate3d, type LucideProps } from "lucide-solid";
import { state, storeActions } from "../../engine/store";

// Definiujemy typ dla naszych przycisków
interface EditTool {
    id: typeof state.editMode;
    label: string;
    icon: Component<LucideProps>;
}

const TOOLS: EditTool[] = [
    { id: "move", label: "Move Tool", icon: Move },
    { id: "rotate", label: "Rotate Tool", icon: Rotate3d },
    { id: "sculpt", label: "Sculpt Terrain", icon: Mountain },
    { id: "paint", label: "Paint Terrain", icon: Paintbrush },
];

const EditMode = () => {
    onCleanup(() => {
        storeActions.setEditMode("move");
    });

    return (
        <div class="absolute top-6 left-6 flex items-center p-1.5 gap-1 bg-zinc-900/90 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 ring-1 ring-black/50">
            <For each={TOOLS}>
                {(tool) => (
                    <ButtonEditMode
                        icon={tool.icon}
                        isSelected={state.editMode === tool.id}
                        onClick={() => storeActions.setEditMode(tool.id)}
                        title={tool.label}
                    />
                )}
            </For>
        </div>
    );
};

interface ButtonProps {
    onClick: () => void;
    icon: Component<LucideProps>;
    isSelected: boolean;
    title: string;
}

const ButtonEditMode = (props: ButtonProps) => {
    return (
        <button
            onClick={props.onClick}
            title={props.title}
            class={`
                relative flex items-center justify-center p-2.5 rounded-lg transition-all duration-200 group
                ${props.isSelected 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" 
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"}
            `}
        >
            {/* Ikona */}
            <props.icon 
                size={20} 
                strokeWidth={props.isSelected ? 2.5 : 2}
                class="relative z-10 transition-transform group-active:scale-90" 
            />

            {/* Delikatny blask pod wybranym przyciskiem */}
            <Show when={props.isSelected}>
                <div class="absolute inset-0 bg-blue-400/20 blur-md rounded-lg" />
            </Show>
        </button>
    );
};

export default EditMode;