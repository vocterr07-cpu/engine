import { createSignal, Show, For, type Component as SolidComponent } from "solid-js"
import { 
    ChevronDown, ChevronRight, Box, FileCode, Folder, FolderOpen, 
    type LucideProps 
} from "lucide-solid"
import GameObject from "../../../engine/GameObject"
import Component from "../../../engine/Component"
import Script from "../../../engine/Script"
import { state, storeActions } from "../../../engine/store"
import ExplorerContextMenu from "./ExplorerContextMenu"
import MouseEventComponent from "../../../engine/MouseEventComponent"
import TouchEventComponent from "../../../engine/TouchEventComponent"
import ParticleSystem from "../../../engine/ParticleSystem"
import VisualScript from "../../../engine/VisualScript"

// --- TYPES ---

interface ExplorerNodeProps {
    node: GameObject | Component; 
    type: 'object' | 'component';
    depth: number;
    icon?: SolidComponent<LucideProps>;
}

// --- HELPERS ---

const isGameObject = (node: any): node is GameObject => node instanceof GameObject;

// --- COMPONENT ---

const ExplorerItem = (props: ExplorerNodeProps) => {
    // 1. State
    const [isExpanded, setIsExpanded] = createSignal(false);
    const [menuPos, setMenuPos] = createSignal({ x: 0, y: 0 });
    
    const { 
        setSelectedScript, 
        setOpenedWindow, 
        setOpenedContextMenuId, 
        setSelectedObject, 
        setSelectedMouseEvent,
        setSelectedTouchEvent,
        setSelectedComponent,
        setSelectedParticleSystem,
        setSelectedVisualScript
    } = storeActions;

    // 2. Computed Data
    const getComponents = () => {
        state.version; // Subskrypcja zmian
        if (!isGameObject(props.node)) return [];
        return [...(props.node.components || [])];
    };

    const getChildren = () => {
        state.version; // Subskrypcja zmian
        if (!isGameObject(props.node)) return [];
        return [...(props.node.children || [])];
    };

    const hasChildren = () => getComponents().length > 0 || getChildren().length > 0;

    const getNodeIcon = () => {
        if (props.icon) return props.icon;
        if (!isGameObject(props.node)) return FileCode;
        if (hasChildren()) return isExpanded() ? FolderOpen : Folder;
        return Box;
    };

    const isSelected = () => {
        if (isGameObject(props.node)) return state.selectedObject === props.node;
        return state.selectedComponent === props.node;
    };

    // 3. Styles
    const getRowClasses = () => {
        const isObj = isGameObject(props.node);
        const selected = isSelected();
        const isComp = props.type === 'component';

        return {
            "hover:bg-zinc-600": isObj && !selected,
            "bg-blue-600 text-white hover:bg-blue-500": isObj && selected,
            "hover:bg-zinc-800 text-zinc-400": !isObj && !selected && !isComp,
            "text-blue-300 hover:bg-zinc-600": isComp && !selected,
            "bg-zinc-700 text-white hover:bg-zinc-600": isComp && selected
        };
    };

    // 4. Handlers
    const handleSelect = (e: MouseEvent) => {
        e.stopPropagation();
        if (isGameObject(props.node)) {
            setSelectedObject(props.node);
        } else if (props.node instanceof Script) {
            setSelectedScript(props.node);
            setOpenedWindow("script");
            setSelectedComponent(props.node);
        } else if (props.node instanceof VisualScript) {
            setSelectedVisualScript(props.node);
            setOpenedWindow("visualScript");
            setSelectedComponent(props.node);
        } else if (props.node instanceof MouseEventComponent) {
            setSelectedComponent(props.node);
            setOpenedWindow("mouseEvent");
            setSelectedMouseEvent(props.node);
        }
        else if (props.node instanceof TouchEventComponent) {
            setSelectedComponent(props.node);
            setOpenedWindow("touchEvent");
            setSelectedTouchEvent(props.node);
        } else if (props.node instanceof ParticleSystem) {
            setSelectedComponent(props.node);
            setOpenedWindow("particleSystem");
            setSelectedParticleSystem(props.node);
        }
    }

    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        
        setMenuPos({ x: e.clientX, y: e.clientY });
        
        // Unikalne ID dla menu
        setOpenedContextMenuId(`${props.node.name}_${props.depth}_${props.type}`);
        
        // Auto-zamknięcie po kliknięciu gdziekolwiek
        window.addEventListener("click", () => setOpenedContextMenuId(null), { once: true });
    }

    const toggleExpand = (e: MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded());
    }

    // 5. Render
    return (
        <div class="flex flex-col select-none">
            {/* ROW */}
            <div
                class="flex items-center gap-1 p-1.5 rounded-md cursor-pointer mt-1 transition-all group relative border border-transparent"
                style={{ "padding-left": `${props.depth * 12 + 8}px` }}
                classList={getRowClasses()}
                onClick={handleSelect}
                onContextMenu={handleContextMenu}
            >
                {/* ICON ARROW */}
                <div class="w-4 h-4 flex items-center justify-center shrink-0">
                    <Show when={hasChildren()}>
                        <div onClick={toggleExpand} class="hover:bg-white/20 rounded p-0.5">
                            {isExpanded() ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </div>
                    </Show>
                </div>

                {/* ICON TYPE & NAME */}
                <div class="flex items-center gap-2 overflow-hidden min-w-0">
                    {(() => { const Icon = getNodeIcon(); return <Icon size={16} class="shrink-0"/> })()}
                    <span class="text-xs font-medium truncate tracking-tight">{props.node.name}</span>
                </div>

                {/* CONTEXT MENU */}
                {/* Teraz przekazujemy tylko callbacki, a nie logikę! */}
                <Show when={state.openedContextMenuId === `${props.node.name}_${props.depth}_${props.type}`}>
                    <ExplorerContextMenu 
                        node={props.node}
                        menuPos={menuPos()}
                        onClose={() => setOpenedContextMenuId(null)}
                        onExpand={() => setIsExpanded(true)}
                    />
                </Show>
            </div>

            {/* CHILDREN */}
            <Show when={isExpanded() && hasChildren()}>
                <div class="flex flex-col relative">
                    <div class="absolute w-[1px] bg-zinc-800 h-full" style={{ left: `${props.depth * 12 + 15}px` }} />
                    <For each={getComponents()}>
                        {(comp) => <ExplorerItem node={comp} type="component" depth={props.depth + 1} />}
                    </For>
                    <For each={getChildren()}>
                        {(child) => <ExplorerItem node={child} type="object" depth={props.depth + 1} icon={Box} />}
                    </For>
                </div>
            </Show>
        </div>
    )
}

export default ExplorerItem;