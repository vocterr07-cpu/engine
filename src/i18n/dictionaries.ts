// src/i18n/dictionaries.ts

// Słownik Angielski (Domyślny)
export const en = {
    events: {
        change_color: "Change Color",
        toggle_collision: "Toggle Collision",
        play_audio: "Play Audio",
        change_speed: "Change Player Speed",
        change_jump: "Change Jump Force",
        teleport: "Teleport Player",
        search_placeholder: "Search events...",
        no_results: "No events found matching",
    },
    // Tu możesz dodawać kolejne sekcje, np. topbar: { ... }
};

// Słownik Polski
export const pl = {
    events: {
        change_color: "Zmień Kolor",
        toggle_collision: "Przełącz Kolizję",
        play_audio: "Odtwórz Dźwięk",
        change_speed: "Zmień Prędkość Gracza",
        change_jump: "Zmień Siłę Skoku",
        teleport: "Teleportuj Gracza",
        search_placeholder: "Szukaj zdarzeń...",
        no_results: "Nie znaleziono zdarzeń pasujących do",
    }
};

// Typ słownika (pomaga w podpowiadaniu kluczy w VS Code)
export type RawDictionary = typeof en;