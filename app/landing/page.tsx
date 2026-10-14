import { redirect } from "next/navigation";

// Isolated preview of the approved marketing design + Beauty Packs showcase.
// The existing / and /app routes are deliberately unchanged.
export default function LandingPage() {
  redirect("/rovei-landing.html");
}
