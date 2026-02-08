export function hexWithOpacity(hex: string, opacity: number): string {
  let cleanHex = hex.replace("#", "");

  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  if (cleanHex.length !== 6) {
    throw new Error("Hex inválido: use formato #rgb ou #rrggbb");
  }

  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");

  return `#${cleanHex}${alpha}`;
}
