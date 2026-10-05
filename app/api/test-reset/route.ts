import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Reset page should still clear browser prototype state.
  }

  return new Response(
    `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Resetting Rovei</title>
</head>
<body>
<script>
  localStorage.removeItem("rovei:full-process-preview-v3");
  sessionStorage.clear();
  location.replace("/");
</script>
</body>
</html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
}
