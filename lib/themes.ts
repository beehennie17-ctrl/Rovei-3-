import type { ClientTheme, ThemeName } from "@/types";

export const clientThemes: Record<ThemeName, ClientTheme> = {
  blush: { name: "Blush", primary: "#C98591", onPrimary: "#24191D", secondary: "#E7BDC3", background: "#FFF8F9", surface: "#FFFFFF", text: "#3C252B", muted: "#8E6D75", border: "#DDAAB3", shimmer: "rgba(255,255,255,.20)" },
  noir: { name: "Noir", primary: "#2C2528", onPrimary: "#FFFFFF", secondary: "#A79B9F", background: "#F7F4F5", surface: "#FFFFFF", text: "#211D1F", muted: "#756B6F", border: "#4A4245", shimmer: "rgba(255,255,255,.12)" },
  pearl: { name: "Pearl", primary: "#D8D0CD", onPrimary: "#24191D", secondary: "#F0E9E5", background: "#FCFAF8", surface: "#FFFFFF", text: "#443A37", muted: "#887B77", border: "#D8CCC6", shimmer: "rgba(255,255,255,.40)" },
  wine: { name: "Wine", primary: "#560F1F", onPrimary: "#FFFFFF", secondary: "#EECBD1", background: "#FBF6F7", surface: "#FFFFFF", text: "#2C171D", muted: "#7D6269", border: "#560F1F", shimmer: "rgba(255,255,255,.16)" },
  mocha: { name: "Mocha", primary: "#71584E", onPrimary: "#FFFFFF", secondary: "#D9CBC3", background: "#F8F4F1", surface: "#FFFFFF", text: "#332923", muted: "#7C6B62", border: "#82685C", shimmer: "rgba(255,255,255,.15)" },
  sage: { name: "Sage", primary: "#697667", onPrimary: "#FFFFFF", secondary: "#CFD6CA", background: "#F6F8F4", surface: "#FFFFFF", text: "#2B332A", muted: "#727D70", border: "#778676", shimmer: "rgba(255,255,255,.15)" },
  lilac: { name: "Lilac", primary: "#786579", onPrimary: "#FFFFFF", secondary: "#D8CADB", background: "#FAF7FA", surface: "#FFFFFF", text: "#352B36", muted: "#7A6B7B", border: "#8A758C", shimmer: "rgba(255,255,255,.17)" },
  custom: { name: "Custom", primary: "#560F1F", onPrimary: "#FFFFFF", secondary: "#D2C5CE", background: "#FFFFFF", surface: "#FFFFFF", text: "#24191D", muted: "#74656B", border: "#560F1F", shimmer: "rgba(255,255,255,.14)" },
};
