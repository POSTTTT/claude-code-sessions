"use client";

import { useEffect, useState } from "react";
import type { ProjectSummary } from "@/lib/sessions";
import { ProjectsTable } from "./ProjectsTable";
import { ProjectsTree } from "./ProjectsTree";

type View = "table" | "tree";

const STORAGE_KEY = "projects-view";

export function ProjectsView({ projects }: { projects: ProjectSummary[] }) {
  const [view, setView] = useState<View>("table");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "tree" || saved === "table") setView(saved);
  }, []);

  const change = (v: View) => {
    setView(v);
    window.localStorage.setItem(STORAGE_KEY, v);
  };

  return (
    <div>
      <div className="mt-4 inline-flex rounded-md border border-white/10 bg-white/[0.03] p-0.5 text-xs">
        {(["table", "tree"] as View[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => change(v)}
            className={`rounded px-3 py-1 capitalize ${
              view === v
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      {view === "table" ? (
        <ProjectsTable projects={projects} />
      ) : (
        <ProjectsTree projects={projects} />
      )}
    </div>
  );
}
