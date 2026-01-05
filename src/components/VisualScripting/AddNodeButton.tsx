import { Plus } from "lucide-solid"
import { createSignal, Show } from "solid-js"
import AddNodeModal from "./AddNodeModal";
import type { NodeType, ScriptNode } from "../../engine/VisualScript";

interface Props {
    onSelect: (type: NodeType, title: string, inputs: Record<string, string>) => void;
    node?: ScriptNode
}

const AddNodeButton = (props: Props) => {
    const [isWindowOpened, setIsWindowOpened] = createSignal(false);

    const handleOpenWindow = () => {
        if (isWindowOpened()) return;
        setIsWindowOpened(true);
    }

    const handleCloseWindow = () => {
        setIsWindowOpened(false);
    }


    return (
        <>
        <div onClick={handleOpenWindow} class='absolute group left-1/2 bottom-[8%] translate-x-[-50%] w-96  cursor-pointer transition-all duration-300 hover:border-purple-500/50 hover:bg-purple-500/15 hover:shadow-[0_0_30px_-5px_rgba(127,0,255,0.7)] flex items-center gap-4 justify-center  p-6 bg-purple-500/10 border border-purple-500/30 rounded-xl shadow-[0_0_20px_-5px_rgba(127,0,255,0.7)]'>
            <Plus class='group-hover:rotate-90 transition-all duration-300 text-purple-500/80 group-hover:text-purple-500' />
            <h1 class='text-purple-500/80 font-black text-lg tracking-[0.1em] uppercase group-hover:text-purple-500 transition-colors duration-300'>Add Event Node</h1>
            


        </div>
        <Show when={isWindowOpened()}>
                <AddNodeModal
                    node={props.node}
                    onSelect={props.onSelect}
                    onClose={handleCloseWindow}

                />
            </Show>
        </>
        
    )
}

export default AddNodeButton