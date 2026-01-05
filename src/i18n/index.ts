// src/i18n/index.ts
import * as i18n from "@solid-primitives/i18n";
import { createMemo } from "solid-js";
import { state } from "../engine/store"; // Twoj store
import { en, pl, type RawDictionary } from "./dictionaries";

export const useI18n = () => {
    // 1. Reagujemy na zmianę state.language
    // createMemo sprawia, że słownik zmienia się tylko wtedy, gdy zmieni się język
    const dict = createMemo((): RawDictionary => {
        switch (state.language) {
            case 'pl': return pl;
            default: return en;
        }
    });

    // 2. Tworzymy funkcję t(), która automatycznie spłaszcza obiekt (np. events.change_color)
    const t = i18n.translator(dict);

    return t;
};