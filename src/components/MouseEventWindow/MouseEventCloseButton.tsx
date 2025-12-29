import { X } from "lucide-solid"
import { storeActions } from "../../engine/store"

const MouseEventCloseButton = () => {
    const {setSelectedComponent, setSelectedMouseEvent, setOpenedWindow} = storeActions

    const handleClose = () => {
        setSelectedComponent(null);
        setSelectedMouseEvent(null);
        setOpenedWindow("");
    }
    return (
        <button class="text-red-400 rounded-md p-2 hover:bg-zinc-700 transition-colors" onClick={handleClose}>
            <X size={20} />
        </button>
    )
}

export default MouseEventCloseButton