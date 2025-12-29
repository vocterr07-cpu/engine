import { Move, Rotate3d } from "lucide-solid"
import { state } from "../../engine/store"

const EditMode = () => {
    return (
        <div class='absolute top-4 left-4 flex items-center p-2 rounded-lg shadow-md shadow-zinc-950 border border-zinc-900'>
            <button onClick={() => state.engine!.editMode = "move"} class='rounded-md hover:bg-zinc-800 transition-colors p-2'>
                <Move class='text-blue-600' />
            </button>
            <button onClick={() => state.engine!.editMode = "rotate"} class='rounded-md hover:bg-zinc-800 transition-colors p-2'>
                <Rotate3d class='text-green-600' />
            </button>

        </div>
    )
}

export default EditMode