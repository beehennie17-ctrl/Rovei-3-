import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", { status: 404 });
  }

  const html = await readFile(
    path.join(
      process.cwd(),
      "reference",
      "Rovei_APPROVED_FINAL_FRONTEND.html",
    ),
    "utf8",
  );

  const restore = `<script>
  (() => {
    try {
      const key = "rovei:full-process-preview-v3";
      const state = JSON.parse(localStorage.getItem(key) || "null");
      if (!state || state.version !== 3 || !state.studio) return;

      state.screen = "app";
      state.appPage = "settings";
      state.settings = {
        ...(state.settings || {}),
        tab: "support"
      };
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn("Preview restore unavailable", error);
    }
  })();
  </script>`;

  const page = html.replace("</head>", restore + "</head>");
  const end = page.lastIndexOf("</body>");
  const bridge = '<script src="/rovei-backend-bridge.js"></script>';

  return new Response(
    end < 0
      ? page + bridge
      : page.slice(0, end) + bridge + page.slice(end),
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
}
