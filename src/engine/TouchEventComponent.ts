import Component from "./Component";
import { state } from "./store"; // Import stanu globalnego
import type { ActionData } from "../components/VisualScripting/types"; 

export default class TouchEventComponent extends Component {
    public actions: ActionData[] = [];
    
    // --- POMOCNIK DO ZNAJDOWANIA ZMIENNYCH ---
    private getVariableValue(id: string): any {
        // 1. Szukaj w zmiennych lokalnych obiektu
        if (this.gameObject) {
            const local = this.gameObject.variables.find(v => v.id === id);
            if (local) return local.value;
        }
        
        // 2. Szukaj w zmiennych globalnych
        const global = state.variables.find(v => v.id === id);
        if (global) return global.value;

        console.warn(`Variable with ID ${id} not found!`);
        return null; // Zmienna nie istnieje
    }

    // --- SILNIK WYKONAWCZY (INTERPRETER) ---
    private executeActionList(actions: ActionData[]) {
        for (const action of actions) {
            
            // === LOGIKA IF ===
            if (action.type === "IF_CONDITION") {
                const varValue = this.getVariableValue(action.payload.variableId);
                const compareValue = parseFloat(action.payload.value); // Zakładamy liczby na start
                const op = action.payload.operator;
                
                let conditionMet = false;
                if (op === ">") conditionMet = varValue > compareValue;
                if (op === "<") conditionMet = varValue < compareValue;
                if (op === "==") conditionMet = varValue == compareValue; // == pozwala na string "5" == number 5
                if (op === "!=") conditionMet = varValue != compareValue;

                if (conditionMet) {
                    // REKURENCJA! Wykonaj dzieci
                    this.executeActionList(action.payload.thenActions || []);
                }
            }

            // === LOGIKA DEBUG ===
            else if (action.type === "DEBUG_LOG") {
                console.log(`[GAME SCRIPT]: ${action.payload.message}`);
                // Możesz tu dodać też powiadomienie na ekranie w grze!
            }

            // === LOGIKA TELEPORT ===
            else if (action.type === "TELEPORT_PLAYER") {
                const player = this.gameObject?.scene?.engine.getPlayer();
                if (player) {
                     player.position = [action.payload.x, action.payload.y, action.payload.z];
                }
            }
        }
    }

    public onTrigger() {
        if (this.actions.length > 0) {
            this.executeActionList(this.actions);
        }
    }
}