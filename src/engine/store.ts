import { createMutable } from "solid-js/store";
import type Engine from "./Engine";
import type GameObject from "./GameObject";
import type Script from "./Script";
import type MouseEventComponent from "./MouseEventComponent";
import type Component from "./Component";
import type TouchEventComponent from "./TouchEventComponent";

// Zaktualizowany interfejs (dodane 'log')
export interface LogEntry {
    id: string;
    type: 'log' | 'info' | 'warn' | 'error' | 'success'; 
    message: string;
    timestamp: string;
}

interface EditorState {
    language: string;
    engine: Engine | null;
    objects: GameObject[];
    selectedObject: GameObject | null;
    selectedScript: Script | null;
    selectedComponent: Component | null;
    selectedMouseEvent: MouseEventComponent | null;
    selectedTouchEvent: TouchEventComponent | null;
    openedContextMenuId: string | null;
    openedWindow: string;
    logs: LogEntry[];
    version: number;
    mode: "camera" | "player";
}

export const state = createMutable<EditorState>({
    language: "en",
    engine: null,
    objects: [],
    selectedObject: null,
    selectedScript: null,
    selectedComponent: null,
    selectedMouseEvent: null,
    selectedTouchEvent: null,
    openedContextMenuId: null,
    openedWindow: "",
    logs: [],
    version: 0,
    mode: "camera"
});

export const storeActions = {
    setEngine: (engine: Engine) => { state.engine = engine; },

    setObjects: (newObjects: GameObject[]) => {
        state.objects = newObjects;
        state.version++;
    },
    
    addObject: (newObject: GameObject) => {
        if (!state.engine) return;
        state.engine?.scene.add(newObject);
        state.objects.push(newObject);
        state.version++;
    },
    
    removeObject: (object: GameObject) => {
        state.engine?.scene.remove(object);
        const idx = state.objects.indexOf(object);
        if (idx > -1) state.objects.splice(idx, 1);
        
        if (state.selectedObject === object) state.selectedObject = null;
        state.version++;
    },

    setSelectedObject: (obj: GameObject | null) => { state.selectedObject = obj; },
    setSelectedScript: (script: Script | null) => { state.selectedScript = script; },
    setSelectedComponent: (component: Component | null) => {state.selectedComponent = component},
    setSelectedMouseEvent: (evt: MouseEventComponent | null) => { state.selectedMouseEvent = evt; },
    setSelectedTouchEvent: (event: TouchEventComponent | null) => {state.selectedTouchEvent = event},
    setOpenedContextMenuId: (id: string | null) => { state.openedContextMenuId = id; },
    setOpenedWindow: (windowName: string) => { state.openedWindow = windowName; },

    addComponentToObject: (targetObj: GameObject, component: Component) => {
        targetObj.components.push(component);
        state.version++;
    },

    // --- NAPRAWIONE DLA CREATEMUTABLE ---
    addLogsBatch: (batch: LogEntry[]) => {
        // 1. Łączymy obecne logi z nowymi
        let updated = [...state.logs, ...batch];
        
        // 2. Przycinamy bufor do 500, jeśli przekroczono
        if (updated.length > 500) {
            updated = updated.slice(updated.length - 500);
        }
        
        // 3. Bezpośrednie przypisanie (Solid wykryje zmianę)
        state.logs = updated;
    },
    
    clearLogs: () => { state.logs = []; },

    setMode: (mode: "player" | "camera") => {state.mode = mode}
};