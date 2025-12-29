export const ENGINE_API_TYPES = `
    interface Player {
        position: [number, number, number];
    }
    interface Object {
        position: [number, number, number];
    }
    /**
     * Pobiera instancję gracza.
     */
    declare function getPlayer(): Player;

    /**
     * Pobiera dane obiektu (rodzica tego skryptu).
     */
     declare function getObject(): Object;
     
`   