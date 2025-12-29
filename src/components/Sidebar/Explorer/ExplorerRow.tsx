import { createSignal, Show, For, type Component as SolidComponent } from "solid-js"
import { Portal } from "solid-js/web"
import { 
    ChevronDown, ChevronRight, Box, FileCode, Folder, FolderOpen, 
    type LucideProps 
} from "lucide-solid"
import GameObject from "../../../engine/GameObject"
import type Component from "../../../engine/Component"
import Script from "../../../engine/Script"
import { state, storeActions } from "../../../engine/store"
import ExplorerContextMenuItem from "./ExplorerContextMenuItem"

interface ExplorerNodeProps {
    node: GameObject | Component; 
    type: 'object' | 'component';
    depth: number;
    icon?: SolidComponent<LucideProps>;
}

const ExplorerItem = (props: ExplorerNodeProps) => {
    const [isExpanded, setIsExpanded] = createSignal(false);
    const [menuPos, setMenuPos] = createSignal({ x: 0, y: 0 });
    
    const { setSelectedScript, setOpenedWindow, setOpenedContextMenuId, addComponentToObject, setSelectedObject } = storeActions;

    const isGameObject = (): boolean => props.type === 'object';

    // --- PANCERNA REAKTYWNOŚĆ ---
    // Te funkcje uruchomią się ponownie ZA KAŻDYM RAZEM, gdy zmieni się state.version.
    // Dzięki [...spread], zwracamy NOWĄ tablicę, więc <For> MUSI się przerysować.
    
    const getComponents = () => {
        state.version; // Subskrypcja (nie usuwać!)
        if (!isGameObject()) return [];
        return [...((props.node as GameObject).components || [])];
    };

    const getChildren = () => {
        state.version; // Subskrypcja
        if (!isGameObject()) return [];
        return [...((props.node as GameObject).children || [])];
    };

    const hasChildren = () => {
        // Ponieważ te funkcje zależą od version, hasChildren też zareaguje natychmiast
        return getComponents().length > 0 || getChildren().length > 0;
    };

    // --- HANDLERS ---

    const handleAddScript = () => {
        if (!isGameObject()) return;
        const obj = props.node as GameObject;
        
        const newScript = new Script(`Script_${obj.components.length}`);
        if (props.node instanceof GameObject) {
            newScript.gameObject = props.node
        }
        // To wywoła state.version++ w store.ts
        addComponentToObject(obj, newScript);

        setIsExpanded(true);
        setSelectedScript(newScript);
        setOpenedWindow("script");
        setOpenedContextMenuId(null);
    }

    const handleSelect = () => {
        if (isGameObject()) {
            setSelectedObject(props.node as GameObject);
        } else if ('sourceCode' in props.node) {
            setSelectedScript(props.node as Script);
            setOpenedWindow("script");
        }
    }

    const getIcon = () => {
        if (props.icon) return props.icon;
        if (!isGameObject()) return FileCode;
        if (hasChildren()) return isExpanded() ? FolderOpen : Folder;
        return Box;
    };

    return (
        <div class="flex flex-col select-none">
            <div
                class="flex items-center gap-1 p-1.5 rounded-md cursor-pointer transition-all group relative border border-transparent"
                style={{ "padding-left": `${props.depth * 12 + 8}px` }}
                classList={{
                    "bg-blue-600 text-white": isGameObject() && state.selectedObject === props.node,
                    "hover:bg-zinc-800 text-zinc-400": !(isGameObject() && state.selectedObject === props.node),
                    "text-blue-300": props.type === 'component'
                }}
                onClick={handleSelect}
                onContextMenu={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    setMenuPos({ x: e.clientX, y: e.clientY });
                    setOpenedContextMenuId(`${props.node.name}_${props.depth}_${props.type}`);
                    window.addEventListener("click", () => setOpenedContextMenuId(null), { once: true });
                }}
            >
                <div class="w-4 h-4 flex items-center justify-center shrink-0">
                    <Show when={hasChildren()}>
                        <div onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded()); }} class="hover:bg-white/20 rounded p-0.5">
                            {isExpanded() ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </div>
                    </Show>
                </div>

                <div class="flex items-center gap-2 overflow-hidden min-w-0">
                    {(() => { const Icon = getIcon(); return <Icon size={16} class="shrink-0"/> })()}
                    <span class="text-xs font-medium truncate tracking-tight">{props.node.name}</span>
                </div>

                <Show when={state.openedContextMenuId === `${props.node.name}_${props.depth}_${props.type}`}>
                    <Portal mount={document.body}>
                        <div class="fixed z-[9999] bg-zinc-900 border border-zinc-700 shadow-2xl rounded-md py-1 min-w-[150px]"
                             style={{ left: `${menuPos().x}px`, top: `${menuPos().y}px` }}
                             onClick={e => e.stopPropagation()}>
                            <Show when={isGameObject()}>
                                <ExplorerContextMenuItem label="Add Script" handleClick={handleAddScript} />
                                <div class="h-[1px] bg-zinc-800 my-1" />
                            </Show>
                            <ExplorerContextMenuItem label="Delete" handleClick={() => {}} />
                        </div>
                    </Portal>
                </Show>
            </div>

            <Show when={isExpanded() && hasChildren()}>
                <div class="flex flex-col relative">
                    <div class="absolute w-[1px] bg-zinc-800 h-full" style={{ left: `${props.depth * 12 + 15}px` }} />
                    
                    {/* TUTAJ JEST KLUCZ: Używamy naszych funkcji getterów.
                        Ponieważ zwracają one nowe tablice [...arr] przy każdej zmianie wersji,
                        Solid diffuje je poprawnie i aktualizuje widok.
                    */}
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

const ExplorerRow = (props: { obj: GameObject; icon: SolidComponent<LucideProps> }) => {
    return <ExplorerItem node={props.obj} type="object" depth={0} icon={props.icon} />;
}

export default ExplorerRow;