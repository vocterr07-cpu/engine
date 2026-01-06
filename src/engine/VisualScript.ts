import Component from "./Component";
import type GameObject from "./GameObject";
import { state } from "./store";

// --- DEFINICJE TYPÓW DANYCH ---
export type DataCode = "INT" | "FLOAT" | "STR" | "BOOL" | "OBJ";

export type NodeSchemas = {
    "Log Message": { Message: string };
    "Move Object": { Speed: string; X?: string; Y?: string };
    "If Condition": { Condition: string };
    "Jump": { Force: string };
    "Wait": { Seconds: string };
    "Loop": { Count: string };
    "Play Sound": { Clip: string; Vol: string };
    "Teleport": { Target: string };
    "Set Variable": { Name: string; Value: string; Type: DataCode };
};

export type NodeTitle = keyof NodeSchemas;
export type NodeType = "action" | "logic";
export type EventName = string;

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

    // --- HELPERY FORMATOWANIA ---
    private static formatValueForEval(val: any, type: string): string {
        if (type === "STR") return `'${val}'`;
        if (type === "BOOL") return String(val).toLowerCase();
        return String(val); // INT, FLOAT
    }

    // --- GŁÓWNY RESOLVER (MAGICZNA RÓŻDŻKA) ---
    // Zamienia stringa z inputa na konkretną wartość (liczba, tekst, bool)
    public static resolveValue(input: string, owner: GameObject): any {
        if (!input) return null;

        try {
            // 1. Podmiana Zmiennych GLOBALNYCH (gv.get.XYZ)
            let parsed = input.replace(/gv\.get\.([a-zA-Z0-9_]+)/g, (match, varName) => {
                const variable = state.variables.find(v => v.name === varName);
                if (!variable) {
                    console.warn(`[Script Global] Variable '${varName}' not found! Using 0.`);
                    return "0";
                }
                return VisualScript.formatValueForEval(variable.value, variable.type);
            });

            // 2. Podmiana Zmiennych LOKALNYCH (lv.get.XYZ)
            parsed = parsed.replace(/lv\.get\.([a-zA-Z0-9_]+)/g, (match, varName) => {
                const variable = owner.variables.find(v => v.name === varName);
                if (!variable) {
                    console.warn(`[Script Local] Variable '${varName}' on '${owner.name}' not found! Using 0.`);
                    return "0";
                }
                return VisualScript.formatValueForEval(variable.value, variable.type);
            });

            // 3. PRÓBA EWALUACJI (Dla matematyki i logiki: "10 * 5" -> 50)
            // Używamy new Function, żeby policzyć wyrażenie
            return new Function(`return ${parsed}`)();

        } catch (e) {
            // 4. FALLBACK (Dla zwykłego tekstu)
            // Jeśli input to np. "Hello World", new Function wyrzuci błąd (bo Hello nie jest zdefiniowane).
            // Wtedy po prostu zwracamy stringa z podmienionymi zmiennymi.
            // Ale uwaga: Musimy znowu zrobić replace, bo w 'try' operowaliśmy na zmiennej lokalnej 'parsed'.
            // Dla wydajności można by to zoptymalizować, ale tutaj dla czytelności powtarzamy replace.
            
            // Wersja uproszczona fallbacku: zwracamy to co udało się sparsować w kroku 1 i 2, 
            // ale traktujemy to jako zwykły string.
            
            // Powtórzenie logiki replace (w produkcji warto wydzielić do osobnej funkcji `parseVariablesString`)
            let textFallback = input.replace(/gv\.get\.([a-zA-Z0-9_]+)/g, (match, varName) => {
                 const v = state.variables.find(v => v.name === varName);
                 return v ? String(v.value) : match;
            });
            textFallback = textFallback.replace(/lv\.get\.([a-zA-Z0-9_]+)/g, (match, varName) => {
                 const v = owner.variables.find(v => v.name === varName);
                 return v ? String(v.value) : match;
            });

            return textFallback;
        }
    }

    // --- REGISTRY ---
    private static ACTION_REGISTRY: {
        [K in NodeTitle]?: (owner: GameObject, inputs: NodeSchemas[K], children: () => void) => void
    } = {
        "Log Message": (owner, inputs) => {
            // TERAZ: Możesz wpisać "Mam lv.get.HP zdrowia"
            const msg = VisualScript.resolveValue(inputs.Message, owner);
            console.log(`%c[${owner.name}]:`, "color: #8b5cf6", msg);
        },

        "Move Object": (owner, inputs) => {
            // TERAZ: Speed może być "lv.get.Agility * 2"
            const speed = Number(VisualScript.resolveValue(inputs.Speed, owner)) || 0;
            
            // Opcjonalne wektory X/Y
            const x = inputs.X ? Number(VisualScript.resolveValue(inputs.X, owner)) : 0;
            const y = inputs.Y ? Number(VisualScript.resolveValue(inputs.Y, owner)) : 1; // Default UP

            const dt = (window as any).engineDeltaTime || 0.016;
            
            owner.position[0] += x * speed * dt;
            owner.position[1] += y * speed * dt;
        },

        "Set Variable": (owner, inputs) => {
            // TERAZ: Value może być "gv.get.GlobalDifficulty + 10"
            const resolvedValue = VisualScript.resolveValue(inputs.Value, owner);
            const type = inputs.Type as DataCode;

            // Ustawiamy zmienną w obiekcie (rzutując na typ, jeśli trzeba)
            // Tutaj proste przypisanie, parser typów w GameObject powinien zadbać o resztę
            owner.setVariable(inputs.Name, resolvedValue, type);
        },

        "If Condition": (owner, inputs, runChildren) => {
            // TERAZ: Condition może być "lv.get.HP > 0 && gv.get.GameActive"
            const result = VisualScript.resolveValue(inputs.Condition, owner);
            if (result === true) {
                runChildren();
            }
        },

        "Jump": (owner, inputs) => {
            const force = Number(VisualScript.resolveValue(inputs.Force, owner)) || 10;
            owner.position[1] += force * 0.1;
        },

        "Loop": (owner, inputs, runChildren) => {
            // TERAZ: Count może być "lv.get.EnemyCount"
            const count = Number(VisualScript.resolveValue(inputs.Count, owner)) || 1;
            for(let i=0; i<count; i++) runChildren();
        },

        "Wait": (owner, inputs) => {
             // To placeholder, bo Wait wymaga asynchroniczności (setTimeout/Promise)
             // w pętli gry synchronicznej to nie zadziała tak łatwo bez zmiany architektury
        }, 
        "Play Sound": () => {},
        "Teleport": (owner, inputs) => {
            // Przykład targetowania po nazwie
            const targetName = VisualScript.resolveValue(inputs.Target, owner);
            // const target = findObjectByName(targetName)...
        }
    };

    // --- EXECUTION (Bez zmian) ---

    public executeEvent(eventName: EventName) {
        if (!this.gameObject) return;
        const event = this.events.find(e => e.name === eventName);
        if (event) this.runNodes(event.nodes);
    }

    private runNodes(nodes: ScriptNode[]) {
        for (const node of nodes) {
            const action = VisualScript.ACTION_REGISTRY[node.title as NodeTitle];
            if (action) {
                const runChildren = () => {
                    if (node.children) this.runNodes(node.children);
                };
                // Przekazujemy 'any', bo ACTION_REGISTRY typuje inputsy dynamicznie
                action(this.gameObject!, node.inputs as any, runChildren);
            }
        }
    }

    public update() { this.executeEvent("On Update"); }
    public start(): void { this.executeEvent("On Start"); }

    // --- CRUD ---
    public addEvent(name: EventName): ScriptEvent {
        const newEvent: ScriptEvent = { id: crypto.randomUUID(), name, nodes: [] };
        this.events.push(newEvent);
        return newEvent;
    }
    public removeEvent(id: string) { this.events = this.events.filter(e => e.id !== id); }
    public addNode(eventId: string, node: ScriptNode, parentId: string | null = null) {
        const evt = this.events.find(e => e.id === eventId);
        if (!evt) return;
        if (!parentId) evt.nodes.push(node);
        else this._findAndAddChild(evt.nodes, parentId, node);
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
    
    // --- HELPERY DRZEWA ---
    private _findAndAddChild(nodes: ScriptNode[], parentId: string, newNode: ScriptNode): boolean {
        for (const node of nodes) {
            if (node.id === parentId) {
                if (!node.children) node.children = [];
                node.children.push(newNode);
                return true;
            }
            if (node.children && this._findAndAddChild(node.children, parentId, newNode)) return true;
        }
        return false;
    }
    private _recursiveRemove(nodes: ScriptNode[], idToDelete: string): ScriptNode[] {
        return nodes
            .filter(n => n.id !== idToDelete)
            .map(n => ({ ...n, children: n.children ? this._recursiveRemove(n.children, idToDelete) : undefined }));
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
        return { name: this.name, events: JSON.parse(JSON.stringify(this.events)) };
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