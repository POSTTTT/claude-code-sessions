import Link from "next/link";
import {
  readCodexTranscript,
  resolveCodexProjectPath,
  getCodexAlias,
  type CodexEntry,
} from "@/lib/codex";
import { CodexTranscriptView } from "@/components/CodexTranscriptView";
import { SessionTitle } from "@/components/SessionTitle";

export const dynamic = "force-dynamic";

export default async function CodexSessionPage({
  params,
}: {
  params: Promise<{ projectId: string; sessionId: string }>;
}) {
  const { projectId, sessionId } = await params;
  const decoded = decodeURIComponent(projectId);
  const [entries, alias] = await Promise.all([
    readCodexTranscript(sessionId),
    getCodexAlias(sessionId),
  ]);
  const realPath = resolveCodexProjectPath(decoded);
  const firstUserPrompt = findFirstUserPrompt(entries);
  const uuid = findUuid(entries);

  return (
    <div>
      <Link
        href={`/codex/p/${encodeURIComponent(decoded)}`}
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
          basePath="/codex/p"
          kind="codex"
        />
      </div>
      <div className="mt-2 font-mono text-[11px] text-white/40">
        {uuid ?? sessionId}
      </div>
      <p className="mt-1 text-sm text-white/50">{entries.length} entries</p>
      <CodexTranscriptView entries={entries} />
    </div>
  );
}

function findFirstUserPrompt(entries: CodexEntry[]): string | null {
  for (const e of entries) {
    if (e.kind === "user" && e.text) {
      const t = e.text.trim();
      if (t && !t.startsWith("<")) return t.slice(0, 200);
    }
  }
  return null;
}

function findUuid(entries: CodexEntry[]): string | null {
  for (const e of entries) {
    if (e.kind === "meta") {
      const raw = e.raw as { payload?: { id?: string } };
      if (raw.payload?.id) return raw.payload.id;
    }
  }
  return null;
}
