export function rgbToHex(rgb: [number, number, number]): string {
    const toHex = (c: number) => {
        const hex = Math.round(c * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    return "#" + toHex(rgb[0]) + toHex(rgb[1]) + toHex(rgb[2]);
}