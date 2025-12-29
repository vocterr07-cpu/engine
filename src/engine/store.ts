import { createMutable } from "solid-js/store";
import type Engine from "./Engine";
import type GameObject from "./GameObject";
import type Script from "./Script";
import type MouseEventComponent from "./MouseEventComponent";
import type Component from "./Component";

export interface LogEntry {
    id: string;
    type: 'info' | 'warn' | 'error' | 'success';
    message: string;
    timestamp: string;
}

interface EditorState {
    engine: Engine | null;
    objects: GameObject[];
    selectedObject: GameObject | null;
    selectedScript: Script | null;
    selectedMouseEvent: MouseEventComponent | null;
    openedContextMenuId: string | null;
    openedWindow: string;
    logs: LogEntry[];
    
    // NASZ "MŁOTEK" DO ODŚWIEŻANIA UI
    version: number;
}

export const state = createMutable<EditorState>({
    engine: null,
    objects: [],
    selectedObject: null,
    selectedScript: null,
    selectedMouseEvent: null,
    openedContextMenuId: null,
    openedWindow: "",
    logs: [],
    version: 0
});

export const storeActions = {
    setEngine: (engine: Engine) => { state.engine = engine; },

    setObjects: (newObjects: GameObject[]) => {
        state.objects = newObjects;
        state.version++; // Nowa lista = odświeżamy
    },
    
    addObject: (newObject: GameObject) => {
        state.engine?.scene.add(newObject);
        state.objects.push(newObject);
        state.version++; // Dodano obiekt = odświeżamy
    },
    
    removeObject: (object: GameObject) => {
        state.engine?.scene.remove(object);
        const idx = state.objects.indexOf(object);
        if (idx > -1) state.objects.splice(idx, 1);
        
        if (state.selectedObject === object) state.selectedObject = null;
        state.version++; // Usunięto obiekt = odświeżamy
    },

    setSelectedObject: (obj: GameObject | null) => { state.selectedObject = obj; },
    setSelectedScript: (script: Script | null) => { state.selectedScript = script; },
    setSelectedMouseEvent: (evt: MouseEventComponent | null) => { state.selectedMouseEvent = evt; },
    setOpenedContextMenuId: (id: string | null) => { state.openedContextMenuId = id; },
    setOpenedWindow: (windowName: string) => { state.openedWindow = windowName; },

    // PANCERNE DODAWANIE
    addComponentToObject: (targetObj: GameObject, component: Component) => {
        targetObj.components.push(component);
        
        state.version++;
    },

    addLogsBatch: (batch: LogEntry[]) => {
        state.logs.push(...batch);
        if (state.logs.length > 200) state.logs.splice(0, state.logs.length - 200);
    },
    
    clearLogs: () => { state.logs = []; },
};