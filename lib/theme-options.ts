import type { ThemeName } from "@/types";

export type ThemeOption = {
  id: ThemeName;
  description: string;
};

export const THEME_OPTIONS: ThemeOption[] = [
  { id: "blush", description: "Soft, feminine and warm" },
  { id: "noir", description: "Polished, minimal and dramatic" },
  { id: "pearl", description: "Clean, soft and understated" },
  { id: "wine", description: "Rich, editorial and confident" },
  { id: "mocha", description: "Warm, grounded and luxe" },
  { id: "sage", description: "Calm, fresh and refined" },
  { id: "lilac", description: "Soft, expressive and modern" },
  { id: "custom", description: "Choose your own signature colour" },
];
