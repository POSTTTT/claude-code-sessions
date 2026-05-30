import { listGeminiProjects } from "@/lib/gemini";
import { ProjectsView } from "@/components/ProjectsView";

export const dynamic = "force-dynamic";

export default async function GeminiProjectsPage() {
  const projects = await listGeminiProjects();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Gemini projects</h1>
      <p className="mt-1 text-sm text-white/60">
        {projects.length} project{projects.length === 1 ? "" : "s"} ·{" "}
        {projects.reduce((a, p) => a + p.sessionCount, 0)} sessions
      </p>

      <ProjectsView
        projects={projects}
        basePath="/gemini/p"
        deletePrefix="gemini-project:"
        emptyLabel="No Gemini sessions found in ~/.gemini/tmp"
      />
    </div>
  );
}
