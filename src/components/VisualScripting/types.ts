// 1. Definicja wszystkich dostępnych typów akcji
export type ActionType = 
    | "TELEPORT_PLAYER" 
    | "CHANGE_COLOR" 
    | "PLAY_AUDIO" 
    | "IF_CONDITION" 
    | "DEBUG_LOG";

// 2. Główny interfejs danych klocka
export interface ActionData {
    id: string;         // Unikalne ID (UUID)
    type: ActionType;   // Typ klocka
    payload: any;       // Dane specyficzne dla typu (współrzędne, URL, warunki)
}

/**
 * FABRYKA AKCJI
 * Ta funkcja tworzy gotowy obiekt akcji z domyślnymi wartościami.
 * Używaj jej w ActionList przy dodawaniu nowego klocka.
 */
export const createAction = (type: ActionType): ActionData => {
    const id = crypto.randomUUID();

    switch (type) {
        case "IF_CONDITION":
            return {
                id,
                type,
                payload: {
                    variableId: "",    // ID wybranej zmiennej ze Store
                    operator: ">",     // Domyślny operator
                    value: "0",        // Wartość do porównania
                    thenActions: []    // Tutaj będą zagnieżdżone klocki
                }
            };

        case "TELEPORT_PLAYER":
            return {
                id,
                type,
                payload: { x: 0, y: 0, z: 0 }
            };

        case "CHANGE_COLOR":
            return {
                id,
                type,
                payload: { hex: "#3b82f6" } // Domyślny niebieski
            };

        case "PLAY_AUDIO":
            return {
                id,
                type,
                payload: { 
                    audioUrl: "", 
                    repeatAudio: false, 
                    repeatInterval: 1 
                }
            };

        case "DEBUG_LOG":
            return {
                id,
                type,
                payload: { message: "Action triggered!" }
            };

        default:
            return { id, type, payload: {} };
    }}