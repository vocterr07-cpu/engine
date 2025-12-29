import { Portal, Show } from "solid-js/web"
import ExplorerContextMenuItem from "./ExplorerContextMenuItem"
import GameObject from "../../../engine/GameObject";
import Component from "../../../engine/Component";
import Script from "../../../engine/Script";
import MouseEventComponent from "../../../engine/MouseEventComponent"; // Zakładam import
import { state, storeActions } from "../../../engine/store";
import TouchEventComponent from "../../../engine/TouchEventComponent";

interface Props {
    menuPos: { x: number, y: number };
    node: GameObject | Component;
    onClose: () => void;   // Callback do zamknięcia menu
    onExpand: () => void;  // Callback do rozwinięcia folderu po dodaniu
}

const ExplorerContextMenu = (props: Props) => {
    const { 
        addComponentToObject, 
        setSelectedScript, 
        setOpenedWindow,
        setSelectedMouseEvent,
        setSelectedTouchEvent
    } = storeActions;

    // Helper typu
    const isGameObject = (node: any): node is GameObject => node instanceof GameObject;

    // --- ACTIONS ---

    const handleAddScript = () => {
        if (!isGameObject(props.node)) return;
        const obj = props.node;
        
        const newScript = new Script(`Script_${obj.components.length}`);
        newScript.gameObject = obj;
        
        addComponentToObject(obj, newScript);

        // UI Updates
        props.onExpand(); // Rozwijamy folder
        setSelectedScript(newScript);
        setOpenedWindow("script");
        props.onClose(); // Zamykamy menu
    }

    const handleAddMouseEvent = () => {
        if (!isGameObject(props.node)) return;
        const obj = props.node;
        if (!state.selectedObject) return;
        const len = state.selectedObject.components.length;
        const newEvent = new MouseEventComponent(`MouseEvent_${len}`); // Zakładam konstruktor
        newEvent.gameObject = obj;
        addComponentToObject(obj, newEvent);
        setOpenedWindow("mouseEvent");
        props.onExpand();
        setSelectedMouseEvent(newEvent); // Zakładam że masz taką akcję
        props.onClose();
    }

    const handleAddTouchEvent = () => {
        if (!isGameObject(props.node)) return;
        const obj = props.node;
        if (!state.selectedObject) return;
        const len = state.selectedObject.components.length;
        const newEvent = new TouchEventComponent(`TouchEvent_${len}`);
        newEvent.gameObject = obj;
        addComponentToObject(obj, newEvent);
        setOpenedWindow("touchEvent");
        props.onExpand();
        setSelectedTouchEvent(newEvent);
        props.onClose();
    }

    const handleDelete = () => {
        // Tu logika usuwania
        console.log("Delete", props.node.name);
        props.onClose();
    }

    return (
        <Portal mount={document.body}>
            <div
                class="fixed z-[9999] bg-zinc-900 border border-zinc-700 shadow-xl rounded-md py-1 min-w-[160px]"
                style={{ left: `${props.menuPos.x}px`, top: `${props.menuPos.y}px` }}
                onClick={e => e.stopPropagation()}
            >
                <Show when={isGameObject(props.node)}>
                    <ExplorerContextMenuItem label="Add Script" handleClick={handleAddScript} />
                    <ExplorerContextMenuItem label="Add Mouse Event" handleClick={handleAddMouseEvent} />
                    <ExplorerContextMenuItem label="Add Touch Event" handleClick={handleAddTouchEvent}/>
                </Show>
                
                <ExplorerContextMenuItem label="Delete" handleClick={handleDelete} />
            </div>
        </Portal>
    )
}

export default ExplorerContextMenu;