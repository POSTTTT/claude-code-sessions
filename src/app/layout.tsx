import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claude Sessions",
  description: "Manage Claude Code session logs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/60 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3">
            <Link href="/" className="font-semibold tracking-tight">
              Sessions
            </Link>
            <nav className="flex items-center gap-3 text-sm text-white/70">
              <span className="text-[10px] uppercase tracking-wide text-white/30">
                Claude
              </span>
              <Link href="/" className="hover:text-white">
                Projects
              </Link>
              <Link href="/search" className="hover:text-white">
                Search
              </Link>
              <Link href="/stats" className="hover:text-white">
                Stats
              </Link>
            </nav>
            <span className="h-4 w-px bg-white/10" />
            <nav className="flex items-center gap-3 text-sm text-white/70">
              <span className="text-[10px] uppercase tracking-wide text-white/30">
                Codex
              </span>
              <Link href="/codex" className="hover:text-white">
                Projects
              </Link>
              <Link href="/codex/search" className="hover:text-white">
                Search
              </Link>
              <Link href="/codex/stats" className="hover:text-white">
                Stats
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
