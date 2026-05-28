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
          <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
            <Link href="/" className="font-semibold tracking-tight">
              Claude Sessions
            </Link>
            <nav className="flex gap-4 text-sm text-white/70">
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
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
