import { Plus } from "lucide-solid"
import { createSignal, Show } from "solid-js"
import AddNodeModal from "./AddNodeModal";
import type { EventName, NodeType, ScriptEvent, ScriptNode } from "../../engine/VisualScript";
import VisualScript from "../../engine/VisualScript";
import { state } from "../../engine/store";


interface Props {
    event: ScriptEvent;
    node: ScriptNode;
    update: () => void;
}

const AddNodeWithParentButton = (props: Props) => {
    const [isWindowOpened, setIsWindowOpened] = createSignal(false);

    const handleOpenWindow = () => {
        setIsWindowOpened(true);
    }

    const handleCloseWindow = () => {
        setIsWindowOpened(false);
    }

    const handleAddNode = (type: NodeType, title: EventName, defaultInputs: Record<string, string>) => {
        const newNode = VisualScript.createNodeFactory(type, title, defaultInputs);
        const vs = state.selectedVisualScript;
        if (!vs) return;
        vs.addNode(props.event.id, newNode, props.node.id);
        props.update();
    }
    return (
        <>
            <div onClick={handleOpenWindow} class="group cursor-pointer flex items-center justify-center gap-4 w-full h-12 bg-indigo-500/10 border border-indigo-500/30 rounded-lg shadow-[0_0_20px_-5px_rgba(102,102,255,0.4)] hover:bg-indigo-500/15 hover:border-indigo-500/35 hover:shadow-[0_0_20px_-5px_rgba(102,102,255,0.6)] transition-all duration-300">
                <Plus class="text-indigo-500/80 group-hover:text-indigo-500 group-hover:rotate-90 transition-all duration-300 " />
                <h1 class="text-indigo-500/80 group-hover:text-indigo-500 transition-colors duration-300 font-bold uppercase text-sm tracking-[0.1em]">Add Event Node</h1>
            </div>
            <Show when={isWindowOpened()}>
                    <AddNodeModal
                        node={props.node}
                        onClose={handleCloseWindow}
                        onSelect={handleAddNode}
                    />
            </Show>
            
        </>

    )
}

export default AddNodeWithParentButton