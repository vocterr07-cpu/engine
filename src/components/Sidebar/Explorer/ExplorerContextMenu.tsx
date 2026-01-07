import { Portal, Show } from "solid-js/web"
import ExplorerContextMenuItem from "./ExplorerContextMenuItem"
import GameObject from "../../../engine/GameObject";
import Component from "../../../engine/Component";
import Script from "../../../engine/Script";
import MouseEventComponent from "../../../engine/MouseEventComponent";
import { state, storeActions } from "../../../engine/store";
import TouchEventComponent from "../../../engine/TouchEventComponent";
import ParticleSystem from "../../../engine/ParticleSystem";
import VisualScript from "../../../engine/VisualScript";

interface Props {
    menuPos: { x: number, y: number };
    node: GameObject | Component;
    onClose: () => void;
    onExpand: () => void;
}

const ExplorerContextMenu = (props: Props) => {
    const { 
        addComponentToObject, 
        setSelectedScript, 
        setOpenedWindow,
        setSelectedMouseEvent,
        setSelectedTouchEvent,
        setSelectedComponent,
        setSelectedParticleSystem,
        setSelectedVisualScript
    } = storeActions;

    const isGameObject = (node: any): node is GameObject => node instanceof GameObject;

    const handleAddScript = () => {
        if (!isGameObject(props.node)) return;
        const obj = props.node;
        const newScript = new Script(`Script_${obj.components.length}`);
        newScript.gameObject = obj;
        addComponentToObject(obj, newScript);
        props.onExpand();
        setSelectedScript(newScript);
        setSelectedComponent(newScript)
        setOpenedWindow("script");
        props.onClose();
    }

    const handleAddVisualScript = () => {
        if (!isGameObject(props.node)) return;
        const obj = props.node;
        const newScript = new VisualScript(`Script_${obj.components.length}`);
        newScript.gameObject = obj;
        addComponentToObject(obj, newScript);
        props.onExpand();
        setSelectedVisualScript(newScript);
        setSelectedComponent(newScript)
        setOpenedWindow("visualScript");
        props.onClose();
    }
    

    // --- NOWE: Dodawanie Particle System ---
    const handleAddParticleSystem = () => {
        if (!isGameObject(props.node)) return;
        if (!state.engine) return; // Potrzebujemy dostępu do GL

        const obj = props.node;
        const ps = new ParticleSystem(state.engine.gl);
        obj.particleSystem = ps;
        ps.gameObject = obj;
        addComponentToObject(obj, ps);
        setOpenedWindow("particleSystem");
        setSelectedComponent(ps);
        setSelectedParticleSystem(ps);
        props.onExpand();
        
        console.log("Particle System added to " + obj.name);
        props.onClose();
    }

    // ----------------------------------------

    const handleDelete = () => {
        console.log("Delete", props.node.name);
        props.onClose();
        storeActions.deleteEntity(props.node);
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
                    <ExplorerContextMenuItem label="Add Visual Script" handleClick={handleAddVisualScript} />
                    <ExplorerContextMenuItem label="Add Particle System" handleClick={handleAddParticleSystem} />
                </Show>
                
                <div class="h-px bg-zinc-700 my-1"></div>
                <ExplorerContextMenuItem label="Delete" handleClick={handleDelete} />
            </div>
        </Portal>
    )
}

export default ExplorerContextMenu;