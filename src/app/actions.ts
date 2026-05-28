"use server";

import { revalidatePath } from "next/cache";
import { deleteSession, deleteProject } from "@/lib/sessions";
import { setAlias } from "@/lib/aliases";

export async function deleteTarget(target: string) {
  if (target.startsWith("session:")) {
    const rest = target.slice("session:".length);
    const idx = rest.lastIndexOf(":");
    if (idx === -1) throw new Error("bad target");
    const projectId = rest.slice(0, idx);
    const sessionId = rest.slice(idx + 1);
    await deleteSession(projectId, sessionId);
    revalidatePath(`/p/${encodeURIComponent(projectId)}`);
  } else if (target.startsWith("project:")) {
    const projectId = target.slice("project:".length);
    await deleteProject(projectId);
    revalidatePath("/");
  } else {
    throw new Error("unknown target");
  }
}

export async function renameSession(
  projectId: string,
  sessionId: string,
  name: string,
) {
  await setAlias(projectId, sessionId, name);
  revalidatePath(`/p/${encodeURIComponent(projectId)}`);
  revalidatePath(`/p/${encodeURIComponent(projectId)}/s/${sessionId}`);
}
