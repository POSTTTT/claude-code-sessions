"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tool = "claude" | "codex" | "gemini";
type Section = "projects" | "search" | "stats";

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const tool: Tool =
    pathname === "/codex" || pathname.startsWith("/codex/")
      ? "codex"
      : pathname === "/gemini" || pathname.startsWith("/gemini/")
        ? "gemini"
        : "claude";

  const section: Section = pathname.includes("/search")
    ? "search"
    : pathname.includes("/stats")
      ? "stats"
      : "projects";

  const base = tool === "claude" ? "" : `/${tool}`;
  const sub: { key: Section; label: string; href: string }[] = [
    { key: "projects", label: "Projects", href: `${base}/` || "/" },
    { key: "search", label: "Search", href: `${base}/search` },
    { key: "stats", label: "Stats", href: `${base}/stats` },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur">
      {/* Row 1: brand + settings */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <TerminalIcon />
          <span className="text-lg font-semibold tracking-tight">
            Local CLI Sessions
          </span>
        </Link>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-white/70 hover:border-white/20 hover:text-white"
        >
          <GearIcon />
          Settings
        </button>
      </div>

      {/* Row 2: tool toggle */}
      <div className="flex justify-center pb-1">
        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
          <ToolTab
            href="/"
            active={tool === "claude"}
            icon={<BrandMark src="/claudecode-logo.png" alt="Claude Code" />}
            label="Claude"
          />
          <ToolTab
            href="/codex"
            active={tool === "codex"}
            icon={<BrandMark src="/codex-logo.png" alt="Codex" />}
            label="Codex"
          />
          <ToolTab
            href="/gemini"
            active={tool === "gemini"}
            icon={<BrandMark src="/gemini-logo.png" alt="Gemini" />}
            label="Gemini"
          />
        </div>
      </div>

      {/* Row 3: section nav */}
      <nav className="flex justify-center gap-8 px-6">
        {sub.map((s) => {
          const active = s.key === section;
          return (
            <Link
              key={s.key}
              href={s.href}
              className={`relative py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
                active
                  ? "text-amber-400"
                  : "text-sky-300/70 hover:text-sky-200"
              }`}
            >
              {s.label}
              {active && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-amber-400" />
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

function ToolTab({
  href,
  active,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-sky-400 text-black shadow-[0_0_0_1px_rgba(56,189,248,0.4)]"
          : "text-white/70 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function TerminalIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#38bdf8"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 17l6-5-6-5" />
      <path d="M12 19h8" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

/** Tool brand logo (served from /public). */
function BrandMark({ src, alt }: { src: string; alt: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      width={18}
      height={18}
      className="h-[18px] w-[18px] object-contain"
    />
  );
}

