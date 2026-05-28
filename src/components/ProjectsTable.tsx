"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProjectSummary } from "@/lib/sessions";
import {
  formatBytes,
  formatDuration,
  formatRelative,
} from "@/lib/format";
import { DeleteButton } from "@/components/DeleteButton";

type SortKey = "path" | "sessions" | "size" | "last" | "age";
type SortDir = "asc" | "desc";

const DEFAULT_DIR: Record<SortKey, SortDir> = {
  path: "asc",
  sessions: "desc",
  size: "desc",
  last: "desc",
  age: "desc",
};

export function ProjectsTable({ projects }: { projects: ProjectSummary[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("age");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    const arr = [...projects];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "path":
          cmp = a.decodedPath.localeCompare(b.decodedPath);
          break;
        case "sessions":
          cmp = a.sessionCount - b.sessionCount;
          break;
        case "size":
          cmp = a.totalBytes - b.totalBytes;
          break;
        case "last":
          cmp = a.lastModified - b.lastModified;
          break;
        case "age":
          cmp = a.firstActivity - b.firstActivity;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [projects, sortKey, sortDir]);

  const onSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(DEFAULT_DIR[key]);
    }
  };

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-white/50">
          <tr>
            <Th label="Path" col="path" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <Th label="Sessions" col="sessions" sortKey={sortKey} sortDir={sortDir} onSort={onSort} align="right" />
            <Th label="Size" col="size" sortKey={sortKey} sortDir={sortDir} onSort={onSort} align="right" />
            <Th label="Age" col="age" sortKey={sortKey} sortDir={sortDir} onSort={onSort} align="right" />
            <Th label="Last activity" col="last" sortKey={sortKey} sortDir={sortDir} onSort={onSort} align="right" />
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr key={p.id} className="border-t border-white/5 hover:bg-white/5">
              <td className="px-4 py-3">
                <Link
                  href={`/p/${encodeURIComponent(p.id)}`}
                  className="font-mono text-xs text-sky-300 hover:underline"
                >
                  {p.decodedPath}
                </Link>
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {p.sessionCount}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-white/70">
                {formatBytes(p.totalBytes)}
              </td>
              <td
                className="px-4 py-3 text-right tabular-nums text-white/70"
                title={new Date(p.firstActivity).toLocaleString()}
                suppressHydrationWarning
              >
                {formatDuration(Date.now() - p.firstActivity)}
              </td>
              <td
                className="px-4 py-3 text-right text-white/70"
                suppressHydrationWarning
              >
                {formatRelative(p.lastModified)}
              </td>
              <td className="px-4 py-3 text-right">
                <DeleteButton
                  target={`project:${p.id}`}
                  label="Delete"
                  confirm={`Permanently delete project "${p.decodedPath}" and all its sessions? This cannot be undone.`}
                />
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-white/50">
                No projects found in ~/.claude/projects
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  label,
  col,
  sortKey,
  sortDir,
  onSort,
  align = "left",
}: {
  label: string;
  col: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = sortKey === col;
  return (
    <th
      className={`px-4 py-3 ${align === "right" ? "text-right" : "text-left"}`}
    >
      <button
        type="button"
        onClick={() => onSort(col)}
        className={`inline-flex items-center gap-1 hover:text-white ${
          active ? "text-white" : ""
        }`}
      >
        {label}
        <span className="text-[10px] opacity-60">
          {active ? (sortDir === "asc" ? "▲" : "▼") : ""}
        </span>
      </button>
    </th>
  );
}
