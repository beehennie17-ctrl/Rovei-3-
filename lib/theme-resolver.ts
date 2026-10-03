import { chooseAccessibleOnPrimary, isValidHexColour, normalizeHexColour } from "@/lib/colour-utils";
import { clientThemes } from "@/lib/themes";
import type { ClientTheme, ThemeName } from "@/types";

export const DEFAULT_CUSTOM_PRIMARY = "#560F1F";

export function isThemeName(value: unknown): value is ThemeName {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(clientThemes, value);
}

export function resolveClientTheme(
  themeName: ThemeName | null | undefined,
  customPrimary = DEFAULT_CUSTOM_PRIMARY,
): ClientTheme {
  if (!themeName) return clientThemes.wine;
  if (themeName !== "custom") return clientThemes[themeName];

  const primary = isValidHexColour(customPrimary)
    ? normalizeHexColour(customPrimary)
    : DEFAULT_CUSTOM_PRIMARY;

  return {
    ...clientThemes.custom,
    primary,
    onPrimary: chooseAccessibleOnPrimary(primary),
    border: primary,
  };
}
