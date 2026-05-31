import Link from "next/link";
import {
  readGeminiTranscript,
  resolveGeminiProjectPath,
  getGeminiAlias,
} from "@/lib/gemini";
import type { AgentEntry } from "@/lib/transcript";
import { AgentTranscriptView } from "@/components/AgentTranscriptView";
import { SessionTitle } from "@/components/SessionTitle";

export const dynamic = "force-dynamic";

export default async function GeminiSessionPage({
  params,
}: {
  params: Promise<{ projectId: string; sessionId: string }>;
}) {
  const { projectId, sessionId } = await params;
  const decoded = decodeURIComponent(projectId);
  const [entries, alias, realPath] = await Promise.all([
    readGeminiTranscript(sessionId),
    getGeminiAlias(sessionId),
    resolveGeminiProjectPath(decoded),
  ]);
  const firstUserPrompt = findFirstUserPrompt(entries);

  return (
    <div>
      <Link
        href={`/gemini/p/${encodeURIComponent(decoded)}`}
        className="text-sm text-white/60 hover:text-white"
      >
        ← {realPath}
      </Link>
      <div className="mt-3">
        <SessionTitle
          projectId={decoded}
          sessionId={sessionId}
          alias={alias}
          aiTitle={null}
          firstUserPrompt={firstUserPrompt}
          basePath="/gemini/p"
          kind="gemini"
        />
      </div>
      <p className="mt-1 text-sm text-white/50">{entries.length} entries</p>
      <AgentTranscriptView entries={entries} agentLabel="Gemini" />
    </div>
  );
}

function findFirstUserPrompt(entries: AgentEntry[]): string | null {
  for (const e of entries) {
    if (e.kind === "user" && e.text) {
      const t = e.text.trim();
      if (t && !t.startsWith("<")) return t.slice(0, 200);
    }
  }
  return null;
}
