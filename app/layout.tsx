import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rovei",
  description: "Client experience for independent beauty professionals.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
