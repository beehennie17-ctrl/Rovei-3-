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

  const closingBodyIndex =
    lockedHtml.lastIndexOf("</body>");

  const html =
    closingBodyIndex >= 0
      ? [
          lockedHtml.slice(0, closingBodyIndex),
          backendBridge,
          "\n",
          lockedHtml.slice(closingBodyIndex),
        ].join("")
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
