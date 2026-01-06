import { Mountain, Move, Paintbrush, Rotate3d } from "lucide-solid"
import { state } from "../../engine/store"
import { onCleanup } from "solid-js"

const EditMode = () => {
    onCleanup(() => {
        state.editMode = "move";
    })
    return (
        <div class='absolute top-4 left-4 flex items-center p-2 rounded-lg shadow-md shadow-zinc-950 border border-zinc-900'>
            <button onClick={() => state.editMode = "move"} class='rounded-md hover:bg-zinc-800 transition-colors p-2'>
                <Move class='text-blue-600' />
            </button>
            <button onClick={() => state.editMode = "rotate"} class='rounded-md hover:bg-zinc-800 transition-colors p-2'>
                <Rotate3d class='text-green-600' />
            </button>
            <button onClick={() => state.editMode = "sculpt"} class='rounded-md hover:bg-zinc-800 transition-colors p-2'>
                <Mountain class='text-green-600' />
            </button>
            <button onClick={() => state.editMode = "paint"} class='rounded-md hover:bg-zinc-800 transition-colors p-2'>
                <Paintbrush class='text-green-600' />
            </button>

        </div>
    )
}

export default EditMode