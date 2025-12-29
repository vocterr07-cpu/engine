// helpers/numberUtils.ts

export const parseNumericInput = (value: string): number | null => {
    // 1. Zamień przecinki na kropki (obsługa klawiatur numerycznych w PL)
    const normalized = value.replace(',', '.');

    // 2. Jeśli pole jest puste lub zawiera tylko znak minus/kropkę, 
    // zwracamy null, aby nie psuć stanu w trakcie wpisywania
    if (normalized === '' || normalized === '-' || normalized === '.') {
        return null;
    }

    const parsed = parseFloat(normalized);

    // 3. Sprawdzamy czy wynik to faktycznie liczba
    return isNaN(parsed) ? null : parsed;
};