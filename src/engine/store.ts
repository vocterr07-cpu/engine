import { createMutable } from "solid-js/store";
import type Engine from "./Engine";
import type GameObject from "./GameObject";
import type Script from "./Script";
import type MouseEventComponent from "./MouseEventComponent";
import type Component from "./Component";
import type TouchEventComponent from "./TouchEventComponent";
import type ParticleSystem from "./ParticleSystem";
import type VisualScript from "./VisualScript";

// Zaktualizowany interfejs (dodane 'log')
export interface LogEntry {
    id: string;
    type: 'log' | 'info' | 'warn' | 'error' | 'success';
    message: string;
    timestamp: string;
}

export interface GameVariable {
    id: string;
    name: string;
    type: "Integer" | "Boolean" | "String" | "Float" | "Object Ref";
    value: any;
}

interface EditorState {
    language: string;
    deltaTime: number;
    engine: Engine | null;
    objects: GameObject[];
    selectedObject: GameObject | null;
    selectedScript: Script | null;
    selectedVisualScript: VisualScript | null;
    selectedComponent: Component | null;
    selectedMouseEvent: MouseEventComponent | null;
    selectedTouchEvent: TouchEventComponent | null;
    selectedParticleSystem: ParticleSystem | null;
    openedContextMenuId: string | null;
    openedWindow: string;
    logs: LogEntry[];
    version: number;
    mode: "camera" | "player";
    gameStarted: boolean;
    variables: GameVariable[];
}

export const state = createMutable<EditorState>({
    language: "en",
    deltaTime: 0.1,
    engine: null,
    objects: [],
    selectedObject: null,
    selectedScript: null,
    selectedVisualScript: null,
    selectedComponent: null,
    selectedMouseEvent: null,
    selectedTouchEvent: null,
    selectedParticleSystem: null,
    openedContextMenuId: null,
    openedWindow: "visualScript",
    logs: [],
    version: 0,
    mode: "camera",
    gameStarted: false,
    variables: [{id: "1", name: "TestInteger", type: "Integer", value: 1}, {id: "2", name: "TestString", type: "String", value: "testString"}],
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
    setSelectedVisualScript: (script: VisualScript | null) => {state.selectedVisualScript = script},
    setSelectedComponent: (component: Component | null) => { state.selectedComponent = component },
    setSelectedMouseEvent: (evt: MouseEventComponent | null) => { state.selectedMouseEvent = evt; },
    setSelectedTouchEvent: (event: TouchEventComponent | null) => { state.selectedTouchEvent = event },
    setSelectedParticleSystem: (particleSystem: ParticleSystem | null) => {state.selectedParticleSystem = particleSystem},
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

    setMode: (mode: "player" | "camera") => { state.mode = mode },
    removeVariable: (variableId: string) => {
        // Znajdź indeks
        const index = state.variables.findIndex(v => v.id === variableId);
        // Jeśli znaleziono, wytnij go z tablicy
        if (index !== -1) {
            state.variables.splice(index, 1);
        }
    },

    // Dodaj też updateVariable, bo będzie potrzebne do edycji:
    updateVariable: (id: string, data: Partial<GameVariable>) => {
        const v = state.variables.find(v => v.id === id);
        if (v) {
            // Nadpisz tylko te pola, które przyszły w 'data'
            if (data.name !== undefined) v.name = data.name;
            if (data.type !== undefined) v.type = data.type;
            if (data.value !== undefined) v.value = data.value;
        }
    },
    getVariable: (name: string) => {
        return state.variables.find(v => v.name === name);
    }
};