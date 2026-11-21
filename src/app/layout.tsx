import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { ChunkErrorRecovery } from "@/components/ChunkErrorRecovery";

/**
 * Typography loading strategy (see DESIGN_SYSTEM.md §5):
 *   - The full type register (Fraunces / Inter / Newsreader / JetBrains Mono)
 *     is self-hosted from /public/fonts — no runtime CDN, no Google fetch.
 *   - Only the two above-the-fold-critical faces are preloaded (the UI
 *     workhorse Inter and the display serif Fraunces). Newsreader (lesson
 *     prose) and JetBrains Mono (code) are encountered after first paint and
 *     swap in lazily via font-display: swap.
 *   - No next/font/google downloads remain — the previous Geist import was
 *     removed (it fetched two families the UI never referenced).
 */

export const metadata: Metadata = {
  title: "DataVerse Academy — Learn Data Science From First Principles",
  description:
    "A complete, dependency-honest data-science curriculum: ten schools, interactive programmes with machine-verified outputs, real engines running in your browser, an AI tutor, practical projects and placement tests.",
  keywords: [
    "data science",
    "learn Python",
    "SQL course",
    "machine learning",
    "mathematics for data science",
    "interactive courses",
    "DataVerse Academy",
  ],
  openGraph: {
    title: "DataVerse Academy",
    description:
      "From first principles to data scientist — ten schools, real engines in your browser, every output machine-verified.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF9F7" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0D14" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        {/* Critical font preloads — hoisted to <head> by React 19 */}
        <link
          rel="preload"
          href="/fonts/inter-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/fraunces-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ChunkErrorRecovery />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
