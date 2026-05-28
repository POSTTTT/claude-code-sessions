import { listProjects } from "@/lib/sessions";
import { ProjectsView } from "@/components/ProjectsView";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await listProjects();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Projects</h1>
      <p className="mt-1 text-sm text-white/60">
        {projects.length} project{projects.length === 1 ? "" : "s"} ·{" "}
        {projects.reduce((a, p) => a + p.sessionCount, 0)} sessions
      </p>

      <ProjectsView projects={projects} />
    </div>
  );
}
