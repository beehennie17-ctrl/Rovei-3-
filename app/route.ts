import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const backendBridge =
  '<script src="/rovei-backend-bridge.js"></script>';

// ROVEI_AUTH_PRELUDE
// Runs before the locked frontend's first render so confirmed
// users do not briefly see the signup screen before activation/app.
const authPrelude = `
<script id="rovei-auth-prelude">
(() => {
  try {
    const params = new URLSearchParams(window.location.search);
    const target = params.get("rovei");

    if (target !== "activation" && target !== "app") {
      return;
    }

    const key = "rovei:full-process-preview-v3";
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      return;
    }

    const state = JSON.parse(raw);

    state.screen =
      target === "app"
        ? "app"
        : "activation";

    if (target === "app") {
      state.appPage = "home";
    }

    if (state.signupDraft) {
      state.signupDraft.password = "";
    }

    window.localStorage.setItem(
      key,
      JSON.stringify(state),
    );
  } catch {}
})();
</script>`;

export async function GET() {
  const frontendPath = path.join(
    process.cwd(),
    "reference",
    "Rovei_APPROVED_FINAL_FRONTEND.html",
  );

  const lockedHtml =
    await readFile(frontendPath, "utf8");

  const closingHeadIndex =
    lockedHtml.indexOf("</head>");

  const primedHtml =
    closingHeadIndex >= 0
      ? [
          lockedHtml.slice(0, closingHeadIndex),
          authPrelude,
          "\n",
          lockedHtml.slice(closingHeadIndex),
        ].join("")
      : `${authPrelude}\n${lockedHtml}`;

  const closingBodyIndex =
    primedHtml.lastIndexOf("</body>");

  const html =
    closingBodyIndex >= 0
      ? [
          primedHtml.slice(0, closingBodyIndex),
          backendBridge,
          "\n",
          primedHtml.slice(closingBodyIndex),
        ].join("")
      : `${primedHtml}\n${backendBridge}`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type":
        "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Rovei-Frontend":
        "approved-locked",
    },
  });
}
