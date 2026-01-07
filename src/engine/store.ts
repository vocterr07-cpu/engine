import { createMutable } from "solid-js/store";
import type Engine from "./Engine";
import GameObject from "./GameObject";
import type Script from "./Script";
import type MouseEventComponent from "./MouseEventComponent";
import type Component from "./Component";
import type TouchEventComponent from "./TouchEventComponent";
import type ParticleSystem from "./ParticleSystem";
import type VisualScript from "./VisualScript";

// --- Logi i Zmienne ---
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

// --- Ustawienia Edytora (Teren) ---
export interface TerrainSettings {
    brushRadius: number;
    brushStrength: number;
    selectedLayer: number;
}

// --- Ustawienia Projektu (To co edytujemy w modalu) ---
export interface ProjectSettings {
    // General
    projectName: string;
    version: string;
    author: string;
    description: string;
    
    // Physics
    gravity: number;
    fixedTimeStep: number; // np. 0.016 (60 FPS)
    
    // Graphics
    pixelRatio: number; // 0.5 - 2.0 (Skalowanie rozdzielczości)
    shadowsEnabled: boolean;
    antialiasing: boolean;
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
    editMode: "move" | "rotate" | "sculpt" | "paint";
    gameStarted: boolean;
    variables: GameVariable[];
    
    terrainSettings: TerrainSettings;
    projectSettings: ProjectSettings;
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
    openedWindow: "",
    logs: [],
    version: 0,
    mode: "camera",
    editMode: "move",
    gameStarted: false,
    variables: [
        { id: "1", name: "TestInteger", type: "Integer", value: 1 }, 
        { id: "2", name: "TestString", type: "String", value: "testString" }
    ],
    
    terrainSettings: {
        brushRadius: 3.0,
        brushStrength: 2.0,
        selectedLayer: 0
    },

    // Domyślne wartości nowego projektu
    projectSettings: {
        projectName: "New Game Project",
        version: "0.1.0",
        author: "Unknown Developer",
        description: "A solid game project.",
        gravity: 0.0007,
        fixedTimeStep: 0.016,
        pixelRatio: 1.0,
        shadowsEnabled: true,
        antialiasing: true
    }
});

export const storeActions = {
    setEngine: (engine: Engine) => { state.engine = engine; },
    setObjects: (newObjects: GameObject[]) => { state.objects = newObjects; state.version++; },
    addObject: (newObject: GameObject) => {
        if (!state.engine) return;
        state.engine.scene.add(newObject);
        state.objects.push(newObject);
        state.selectedObject = newObject;
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
    setSelectedVisualScript: (script: VisualScript | null) => { state.selectedVisualScript = script },
    setSelectedComponent: (component: Component | null) => { state.selectedComponent = component },
    setSelectedMouseEvent: (evt: MouseEventComponent | null) => { state.selectedMouseEvent = evt; },
    setSelectedTouchEvent: (event: TouchEventComponent | null) => { state.selectedTouchEvent = event },
    setSelectedParticleSystem: (particleSystem: ParticleSystem | null) => { state.selectedParticleSystem = particleSystem },
    setOpenedContextMenuId: (id: string | null) => { state.openedContextMenuId = id; },
    setOpenedWindow: (windowName: string) => { state.openedWindow = windowName; },
    addComponentToObject: (targetObj: GameObject, component: Component) => {
        targetObj.components.push(component);
        state.version++;
    },
    addLogsBatch: (batch: LogEntry[]) => {
        let updated = [...state.logs, ...batch];
        if (updated.length > 500) updated = updated.slice(updated.length - 500);
        state.logs = updated;
    },
    clearLogs: () => { state.logs = []; },
    setMode: (mode: "player" | "camera") => { state.mode = mode },
    setEditMode: (mode: "move" | "rotate" | "sculpt" | "paint") => { state.editMode = mode; },
    
    // Terrain Actions
    setTerrainLayer: (layerIndex: number) => { state.terrainSettings.selectedLayer = layerIndex; },
    setBrushRadius: (radius: number) => { state.terrainSettings.brushRadius = radius; },
    setBrushStrength: (strength: number) => { state.terrainSettings.brushStrength = strength; },

    // Variables Actions
    removeVariable: (variableId: string) => {
        const index = state.variables.findIndex(v => v.id === variableId);
        if (index !== -1) state.variables.splice(index, 1);
    },
    updateVariable: (id: string, data: Partial<GameVariable>) => {
        const v = state.variables.find(v => v.id === id);
        if (v) Object.assign(v, data);
    },
    getVariable: (name: string) => {
        return state.variables.find(v => v.name === name);
    },

    // Entity Actions
    deleteEntity: (entity: GameObject | Component) => {
        if (entity instanceof GameObject) {
            storeActions.removeObject(entity);
            return;
        }
        // Szukanie rodzica komponentu
        if (state.selectedObject) {
            const index = state.selectedObject.components.indexOf(entity);
            if (index !== -1) {
                state.selectedObject.components.splice(index, 1);
                state.version++;
                if (state.selectedComponent === entity) state.selectedComponent = null;
                return;
            }
        }
        for (const obj of state.objects) {
            const index = obj.components.indexOf(entity);
            if (index !== -1) {
                obj.components.splice(index, 1);
                state.version++;
                if (state.selectedComponent === entity) state.selectedComponent = null;
                break;
            }
        }
    },

    // --- PROJECT SETTINGS ACTION ---
    updateProjectSettings: (data: Partial<ProjectSettings>) => {
        Object.assign(state.projectSettings, data);
        // Opcjonalnie: Tutaj dodaj zapis do localStorage
        // localStorage.setItem("projectSettings", JSON.stringify(state.projectSettings));
    }
};