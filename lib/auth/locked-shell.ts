export type LockedShellScreen =
  | "landing"
  | "welcome"
  | "activation"
  | "app";

export function resolveLockedShellScreen({
  authenticated,
  requestedScreen,
  hasStudio,
  subscriptionStatus,
}: {
  authenticated: boolean;
  requestedScreen: string | null;
  hasStudio: boolean;
  subscriptionStatus: string | null;
}): LockedShellScreen {
  if (!authenticated) {
    return requestedScreen === "onboarding"
      ? "welcome"
      : "landing";
  }

  if (!hasStudio) {
    return requestedScreen === "onboarding"
      ? "welcome"
      : "activation";
  }

  return subscriptionStatus === "active" ||
    subscriptionStatus === "trialing"
    ? "app"
    : "activation";
}

export function getEmailConfirmationRedirect(origin: string) {
  return new URL("/auth/callback", origin).toString();
}

export function requiresEmailConfirmation(session: unknown) {
  return !session;
}

export function renderLockedShellDocument(
  html: string,
  initialState: Record<string, unknown> | null,
  requestedScreen: string | null,
) {
  const stateLiteral = JSON.stringify(initialState).replace(/</g, "\\u003c");
  const anonymousScreen =
    requestedScreen === "onboarding" ? "welcome" : "landing";
  const authPrelude = `
<script id="rovei-auth-prelude">
(() => {
  const key = "rovei:full-process-preview-v3";
  const initialState = ${stateLiteral};

  try {
    if (initialState) {
      window.localStorage.setItem(key, JSON.stringify(initialState));
      return;
    }

    const raw = window.localStorage.getItem(key);
    const state = raw ? JSON.parse(raw) : { version: 3 };
    state.screen = ${JSON.stringify(anonymousScreen)};

    if (state.signupDraft) {
      state.signupDraft.password = "";
    }

    window.localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.error("Unable to hydrate the locked Rovei shell:", error);
  }
})();
</script>`;
  const closingHeadIndex = html.indexOf("</head>");
  const hydratedHtml =
    closingHeadIndex >= 0
      ? [
          html.slice(0, closingHeadIndex),
          authPrelude,
          "\n",
          html.slice(closingHeadIndex),
        ].join("")
      : `${authPrelude}\n${html}`;
  const bridgeScript =
    '<script src="/rovei-backend-bridge.js"></script>';
  const closingBodyIndex = hydratedHtml.lastIndexOf("</body>");

  return closingBodyIndex >= 0
    ? [
        hydratedHtml.slice(0, closingBodyIndex),
        bridgeScript,
        "\n",
        hydratedHtml.slice(closingBodyIndex),
      ].join("")
    : `${hydratedHtml}\n${bridgeScript}`;
}
