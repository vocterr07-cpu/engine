import Component from "./Component";
import type GameObject from "./GameObject";

// --- DEFINICJE TYPÓW DANYCH ---
// Zgodne z Twoim globalVariablesList
export type DataCode = "INT" | "FLOAT" | "STR" | "BOOL" | "OBJ";

// --- 1. DEFINICJA SCHEMATÓW INPUTÓW ---
export type NodeSchemas = {
    "Log Message": { Message: string };
    "Move Object": { Speed: string; X?: string; Y?: string };
    "If Condition": { Condition: string };
    "Jump": { Force: string };
    "Wait": { Seconds: string };
    "Loop": { Count: string };
    "Play Sound": { Clip: string; Vol: string };
    "Teleport": { Target: string };
    // NOWOŚĆ: Dodajemy pole Type, żeby wiedzieć jak parsować Value
    "Set Variable": { Name: string; Value: string; Type: DataCode };
};

export type NodeTitle = keyof NodeSchemas;

// --- TYPY STRUKTURALNE ---

export type NodeType = "action" | "logic";

export type EventName = 
    | "On Start" | "On Update" | "On Click" | "On Mouse Click" 
    | "On Touch" | "On Key Press" | "On Interact" | string;

export interface ScriptNode {
    id: string;
    type: NodeType;
    title: string;
    inputs: Record<string, string>; 
    children?: ScriptNode[]; 
}

export interface ScriptEvent {
    id: string;
    name: EventName; 
    nodes: ScriptNode[];
}

export default class VisualScript extends Component {
    public events: ScriptEvent[] = [];

    constructor(name: string) {
        super(name);
    }

    // --- LOGIKA PARSOWANIA WARTOŚCI ---
    private static parseValue(value: string, type: DataCode): any {
        switch (type) {
            case "INT":
                return parseInt(value) || 0;
            case "FLOAT":
                return parseFloat(value) || 0.0;
            case "BOOL":
                // Obsługa true/false (case insensitive)
                return value.toLowerCase() === "true";
            case "OBJ":
                return null; // Tu w przyszłości referencja do obiektu
            case "STR":
            default:
                // Usuwamy apostrofy jeśli user je wpisał
                return value.replace(/^'|'$/g, "");
        }
    }

    // --- 2. REGISTRY (LOGIKA KLOCKÓW) ---
    private static ACTION_REGISTRY: {
        [K in NodeTitle]?: (owner: GameObject, inputs: NodeSchemas[K], children: () => void) => void
    } = {
        "Log Message": (owner, inputs) => {
            const msg = inputs.Message?.replace(/'/g, "") || "";
            console.log(`%c[${owner.name}]: ${msg}`, "color: #8b5cf6");
        },
        "Move Object": (owner, inputs) => {
            const speed = parseFloat(inputs.Speed) || 0;
            const dt = (window as any).engineDeltaTime || 0.016;
            // Prosty ruch w górę dla testu
            owner.position[1] += speed * dt;
        },
        "Set Variable": (owner, inputs) => {
            // 1. Pobieramy surową wartość i typ
            const rawValue = inputs.Value;
            const type = inputs.Type as DataCode;

            // 2. Parsujemy używając helpera
            const finalValue = VisualScript.parseValue(rawValue, type);

            // 3. Ustawiamy w obiekcie
            owner.setVariable(inputs.Name, finalValue, type);
            
            // Debug log (opcjonalnie)
            // console.log(`Set Var [${inputs.Name}] =`, finalValue, `(${type})`);
        },
        "If Condition": (owner, inputs, runChildren) => {
            // Tutaj prosty eval (docelowo parser)
            // Jeśli input to np. "MyVar", trzeba by pobrać owner.getVariable("MyVar")
            const condition = inputs.Condition === "true"; 
            if (condition) runChildren();
        },
        "Jump": (owner, inputs) => {
            const force = parseFloat(inputs.Force) || 10;
            owner.position[1] += force * 0.1;
        },
        "Wait": () => {},
        "Loop": (owner, inputs, runChildren) => {
            const count = parseInt(inputs.Count) || 1;
            for(let i=0; i<count; i++) runChildren();
        },
        "Play Sound": () => {},
        "Teleport": () => {}
    };

    // --- WYKONYWANIE ---

    public executeEvent(eventName: EventName) {
        if (!this.gameObject) return;
        const event = this.events.find(e => e.name === eventName);
        if (event) {
            this.runNodes(event.nodes);
        }
    }

    private runNodes(nodes: ScriptNode[]) {
        for (const node of nodes) {
            const action = VisualScript.ACTION_REGISTRY[node.title as NodeTitle];
            
            if (action) {
                const runChildren = () => {
                    if (node.children) this.runNodes(node.children);
                };
                action(this.gameObject!, node.inputs as any, runChildren);
            }
        }
    }

    public update() {
        this.executeEvent("On Update");
    }

    public start(): void {
        this.executeEvent("On Start");
    }

    // --- CRUD ---

    public addEvent(name: EventName): ScriptEvent {
        const newEvent: ScriptEvent = {
            id: crypto.randomUUID(),
            name,
            nodes: []
        };
        this.events.push(newEvent);
        return newEvent;
    }

    public removeEvent(id: string) {
        this.events = this.events.filter(e => e.id !== id);
    }

    public addNode(eventId: string, node: ScriptNode, parentId: string | null = null) {
        const evt = this.events.find(e => e.id === eventId);
        if (!evt) return;

        if (!parentId) {
            evt.nodes.push(node);
        } else {
            this._findAndAddChild(evt.nodes, parentId, node);
        }
    }

    public removeNode(eventId: string, nodeId: string) {
        const evt = this.events.find(e => e.id === eventId);
        if (!evt) return;
        evt.nodes = this._recursiveRemove(evt.nodes, nodeId);
    }

    public updateNodeInput(eventId: string, nodeId: string, key: string, value: string) {
        const evt = this.events.find(e => e.id === eventId);
        if (!evt) return;

        const node = this._findNode(evt.nodes, nodeId);
        if (node) node.inputs[key] = value;
    }

    // --- HELPERY ---

    private _findAndAddChild(nodes: ScriptNode[], parentId: string, newNode: ScriptNode): boolean {
        for (const node of nodes) {
            if (node.id === parentId) {
                if (!node.children) node.children = [];
                node.children.push(newNode);
                return true;
            }
            if (node.children) {
                if (this._findAndAddChild(node.children, parentId, newNode)) return true;
            }
        }
        return false;
    }

    private _recursiveRemove(nodes: ScriptNode[], idToDelete: string): ScriptNode[] {
        return nodes
            .filter(n => n.id !== idToDelete)
            .map(n => ({
                ...n,
                children: n.children ? this._recursiveRemove(n.children, idToDelete) : undefined
            }));
    }

    public _findNode(nodes: ScriptNode[], id: string): ScriptNode | null {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                const found = this._findNode(node.children, id);
                if (found) return found;
            }
        }
        return null;
    }

    public serialize() {
        return {
            name: this.name,
            events: JSON.parse(JSON.stringify(this.events))
        };
    }

    public static createNodeFactory(type: NodeType, title: string, inputs: Record<string, string> = {}): ScriptNode {
        return {
            id: crypto.randomUUID(),
            type,
            title,
            inputs,
            children: type === "logic" ? [] : undefined
        };
    }
}