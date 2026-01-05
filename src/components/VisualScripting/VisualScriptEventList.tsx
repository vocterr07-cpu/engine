import { createSignal, For, Show } from 'solid-js';
import type { NodeType, ScriptEvent, ScriptNode } from '../../engine/VisualScript';
import { TriggerCard } from './TriggerCard';
import { ActionNodeCard } from './ActionNodeCard';
import {
    Zap,
    MousePointerClick,
    Touchpad,
    Keyboard,
    Timer,
    PlayCircle,
    Plus,
    Play,
    X
} from 'lucide-solid';
import AddNodeButton from './AddNodeButton';
import VisualScript from '../../engine/VisualScript';
import { state } from '../../engine/store';
import NodePropertyWindow from './NodePropertyWindow';
import NodeRenderer from './NodeRenderer';

interface Props {
    event: ScriptEvent;
    refresh: () => number;
    update: () => void;
}

// Mapa ikon przypisana do nazw eventów
const EVENT_ICONS: Record<string, any> = {
    "On Start": PlayCircle,
    "On Update": Timer,
    "On Click": MousePointerClick,
    "On Mouse Click": MousePointerClick,
    "On Touch": Touchpad,
    "On Key Press": Keyboard,
};

const VisualScriptEventList = (props: Props) => {
    const [selectedId, setSelectedId] = createSignal("");
    const [isNodeWindowOpened, setIsNodeWindowOpened] = createSignal(true);
    const getIcon = () => {
        props.refresh();
        return EVENT_ICONS[props.event.name] || Zap;
    };

    const handleSelectEvent = (id: string) => {
        setSelectedId(id);
        props.update();
    }

    const handleNodeSelect = (type: NodeType, title: string, defaultInputs: Record<string, string>) => {
        const inputsCopy = {...defaultInputs};
        const newNode = VisualScript.createNodeFactory(type, title, inputsCopy);
        const vs = state.selectedVisualScript;
        if (!vs) return;
        vs.addNode(props.event.id, newNode)
        props.update();

        console.log(`Added node: ${title} to event: ${props.event.name}`);
    };

    const getNodes = () => {

        props.refresh();
        return [...props.event.nodes || []];
    }

    const handleNodeClick = (id: string) => {
        setSelectedId(id);
        setIsNodeWindowOpened(true);
    }

    const getNodeById = () => {
        const vs = state.selectedVisualScript;
        if (!vs) return;
        return vs._findNode(getNodes(), selectedId()) || undefined;
    }

    const handleCloseNodeWindow = () => {
        setIsNodeWindowOpened(false);
        setSelectedId("");
    }

    const handleNodeDelete = (id: string) => {
        const vs = state.selectedVisualScript;
        if (!vs) return;

        // Używamy metody klasy VisualScript, bo ona obsługuje też usuwanie zagnieżdżonych dzieci
        vs.removeNode(props.event.id, id);
        
        setIsNodeWindowOpened(false);
        props.update(); // Ważne: Odśwież UI
    }

    // Helper do rekurencyjnej aktualizacji drzewa (niemutowalność)
const updateNodeInTree = (nodes: ScriptNode[], nodeId: string, newInputs: Record<string, string>): ScriptNode[] => {
    return nodes.map(node => {
        // 1. Jeśli to ten node - zwracamy nową kopię z nowymi inputami
        if (node.id === nodeId) {
            return { ...node, inputs: { ...newInputs } };
        }

        // 2. Jeśli ma dzieci - schodzimy głębiej
        if (node.children) {
            const updatedChildren = updateNodeInTree(node.children, nodeId, newInputs);
            
            // Jeśli dzieci się zmieniły (referencja tablicy jest inna),
            // musimy też zwrócić nową kopię TEGO noda (rodzica), żeby Solid zauważył zmianę wyżej.
            if (updatedChildren !== node.children) {
                return { ...node, children: updatedChildren };
            }
        }

        // 3. Jeśli nic się nie zmieniło, zwracamy starego noda bez zmian
        return node;
    });
};

const handleNodeUpdate = (nodeId: string, newInputs: Record<string, string>) => {
    const vs = state.selectedVisualScript;
    if (!vs) return;

    // A. Aktualizacja w silniku (logika gry)
    Object.entries(newInputs).forEach(([key, value]) => {
        vs.updateNodeInput(props.event.id, nodeId, key, value);
    });

    // B. Aktualizacja dla UI (SolidJS Reactivity) - Rekurencja
    // To stworzy nową strukturę drzewa tylko na ścieżce, która się zmieniła
    props.event.nodes = updateNodeInTree(props.event.nodes, nodeId, newInputs);

    // C. Wymuszenie odświeżenia
    props.update();
};

    return (
        <div class="relative flex flex-grow justify-center overflow-y-auto w-full h-full">
            <div class="flex flex-col w-[60%] max-w-3xl py-12">

                <TriggerCard
                    icon={getIcon}
                    event={props.event}
                    isSelected={selectedId() === props.event.id}
                    onClick={() => handleSelectEvent(props.event.id)}
                />

                <div class="flex flex-col w-full pl-12 space-y-4 overflow-y-scroll custom-scrollbar max-h-[60%] overflow-x-hidden">
                    <For each={getNodes()}>
                        {(node, index) => (
                            <NodeRenderer
                                refresh={props.refresh()}
                                update={props.update}
                                event={props.event}
                                node={node}
                                selectedId={selectedId()}
                                onSelect={handleNodeClick}
                            />
                        )}
                    </For>


                </div>
                {getNodes().length === 0 && (
                    <div class='flex flex-col'>
                        <div class="relative left-[-24px] text-zinc-600 text-xs italic py-4 border-l border-zinc-800 pl-6 border-dashed">
                            No actions yet. Add one below.
                        </div>
                    </div>

                )}
                <AddNodeButton onSelect={handleNodeSelect} node={getNodeById()}/>
            </div>
            <Show when={isNodeWindowOpened() && getNodeById()}>
                {(node) => (
                    <>
                        <NodePropertyWindow
                            node={node()}
                            onClose={handleCloseNodeWindow}
                            onDelete={handleNodeDelete}
                            onUpdate={handleNodeUpdate}
                        />
                    </>
                )}


            </Show>
        </div>
    )
}

export default VisualScriptEventList;