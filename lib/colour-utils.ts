const SIX_DIGIT_HEX = /^#[0-9A-Fa-f]{6}$/;

export const LIGHT_ON_PRIMARY = "#FFFFFF";
export const DARK_ON_PRIMARY = "#24191D";

export function isValidHexColour(value: string): boolean {
  return SIX_DIGIT_HEX.test(value);
}

export function normalizeHexColour(value: string): string {
  return value.toUpperCase();
}

function hexChannelToLinear(channel: string): number {
  const srgb = Number.parseInt(channel, 16) / 255;
  return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  if (!isValidHexColour(hex)) {
    throw new Error("relativeLuminance requires a six-digit hex colour.");
  }

  const normalized = hex.slice(1);
  const red = hexChannelToLinear(normalized.slice(0, 2));
  const green = hexChannelToLinear(normalized.slice(2, 4));
  const blue = hexChannelToLinear(normalized.slice(4, 6));

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(first: string, second: string): number {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

export function chooseAccessibleOnPrimary(primary: string): typeof LIGHT_ON_PRIMARY | typeof DARK_ON_PRIMARY {
  if (!isValidHexColour(primary)) return LIGHT_ON_PRIMARY;

  const lightContrast = contrastRatio(primary, LIGHT_ON_PRIMARY);
  const darkContrast = contrastRatio(primary, DARK_ON_PRIMARY);

  return darkContrast >= lightContrast ? DARK_ON_PRIMARY : LIGHT_ON_PRIMARY;
}
