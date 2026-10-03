export type ClientStatus = "ready" | "waiting" | "complete" | "draft";

export type ThemeName = "blush" | "noir" | "pearl" | "wine" | "mocha" | "sage" | "lilac" | "custom";

export type ClientTheme = {
  name: string;
  primary: string;
  onPrimary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  shimmer: string;
};

export type DashboardClient = {
  id: string;
  name: string;
  service: string;
  time: string;
  status: ClientStatus;
  initials: string;
};
