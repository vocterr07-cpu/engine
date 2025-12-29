export function hexToRgb(hex: string): [number, number, number] {
    // Usuwamy # jeśli jest obecny
    hex = hex.replace(/^#/, "");

    // Parsujemy składowe
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    return [r, g, b];
}