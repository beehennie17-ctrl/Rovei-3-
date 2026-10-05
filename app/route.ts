import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const frontendPath = path.join(
    process.cwd(),
    "reference",
    "Rovei_APPROVED_FINAL_FRONTEND.html",
  );

  const html = await readFile(frontendPath, "utf8");

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Rovei-Frontend": "approved-locked",
    },
  });
}
