import { X } from "lucide-solid"
import { storeActions } from "../../../engine/store"


const TouchEventCloseButton = () => {
    const { setSelectedComponent, setSelectedTouchEvent, setOpenedWindow } = storeActions
    const handleClose = () => {
        setSelectedComponent(null);
        setSelectedTouchEvent(null);
        setOpenedWindow("");
    }

    return (
        <button class="text-red-400 rounded-md p-2 hover:bg-zinc-700 transition-colors" onClick={handleClose}><X size={20} /></button>
    )
}

export default TouchEventCloseButton