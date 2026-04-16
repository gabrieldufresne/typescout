/**
 * Root layout for TypeScout.
 * Loads Lilex via next/font/google — sole typeface for the entire UI.
 */

import type { Metadata } from "next";
import { Lilex } from "next/font/google";
import "./globals.css";

const lilex = Lilex({
  variable: "--font-lilex",
  subsets: ["latin"],
  weight: "variable",
});

export const metadata: Metadata = {
  title: "TypeScout — Typeface Discovery",
  description:
    "Find typefaces with natural language. Describe what you're looking for and TypeScout returns curated matches from hand-picked foundries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lilex.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
