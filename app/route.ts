import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const backendBridge =
  '<script src="/rovei-backend-bridge.js"></script>';

export async function GET() {
  const frontendPath = path.join(
    process.cwd(),
    "reference",
    "Rovei_APPROVED_FINAL_FRONTEND.html",
  );

  const lockedHtml =
    await readFile(frontendPath, "utf8");

  const html = lockedHtml.includes("</body>")
    ? lockedHtml.replace(
        "</body>",
        `${backendBridge}\n</body>`,
      )
    : `${lockedHtml}\n${backendBridge}`;

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
