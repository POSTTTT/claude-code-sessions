import { listCodexProjects } from "@/lib/codex";
import { ProjectsView } from "@/components/ProjectsView";

export const dynamic = "force-dynamic";

export default async function CodexProjectsPage() {
  const projects = await listCodexProjects();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Codex projects</h1>
      <p className="mt-1 text-sm text-white/60">
        {projects.length} project{projects.length === 1 ? "" : "s"} ·{" "}
        {projects.reduce((a, p) => a + p.sessionCount, 0)} sessions · grouped by
        working directory
      </p>

      <ProjectsView
        projects={projects}
        basePath="/codex/p"
        deletePrefix="codex-project:"
        emptyLabel="No Codex sessions found in ~/.codex/sessions"
      />
    </div>
  );
}
