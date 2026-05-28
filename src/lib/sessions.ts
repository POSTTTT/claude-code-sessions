import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import readline from "node:readline";
import path from "node:path";
import { PROJECTS_DIR, decodeProjectId } from "./paths";
import { loadAliases, getAlias } from "./aliases";

export type ProjectSummary = {
  id: string;
  decodedPath: string;
  sessionCount: number;
  totalBytes: number;
  lastModified: number;
  firstActivity: number;
};

export type SessionSummary = {
  projectId: string;
  sessionId: string;
  file: string;
  bytes: number;
  mtime: number;
  firstUserPrompt: string | null;
  aiTitle: string | null;
  messageCount: number;
  model: string | null;
  gitBranch: string | null;
  cwd: string | null;
  inputTokens: number;
  outputTokens: number;
  alias: string | null;
};

export type TranscriptEntry = {
  uuid?: string;
  type: string;
  role?: string;
  text?: string;
  raw: unknown;
  timestamp?: string;
  model?: string;
};

async function safeReaddir(dir: string): Promise<string[]> {
  try {
    return await fs.readdir(dir);
  } catch {
    return [];
  }
}

async function safeStat(p: string) {
  try {
    return await fs.stat(p);
  } catch {
    return null;
  }
}

async function readCwdFromFile(filePath: string): Promise<string | null> {
  const rl = readline.createInterface({
    input: createReadStream(filePath, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });
  try {
    for await (const line of rl) {
      if (!line.includes('"cwd"')) continue;
      try {
        const obj = JSON.parse(line);
        if (typeof obj.cwd === "string" && obj.cwd.length > 0) return obj.cwd;
      } catch {}
    }
  } finally {
    rl.close();
  }
  return null;
}

export async function resolveProjectPath(projectId: string): Promise<string> {
  const dir = path.join(PROJECTS_DIR, projectId);
  const files = await safeReaddir(dir);
  const jsonl = files.filter((f) => f.endsWith(".jsonl"));
  // Try newest first — most likely to reflect the current real path.
  const withMtime: { f: string; mtime: number }[] = [];
  for (const f of jsonl) {
    const s = await safeStat(path.join(dir, f));
    if (s) withMtime.push({ f, mtime: s.mtimeMs });
  }
  withMtime.sort((a, b) => b.mtime - a.mtime);
  for (const { f } of withMtime) {
    const cwd = await readCwdFromFile(path.join(dir, f));
    if (cwd) return cwd;
  }
  return decodeProjectId(projectId);
}

export async function listProjects(): Promise<ProjectSummary[]> {
  const entries = await safeReaddir(PROJECTS_DIR);
  const results: ProjectSummary[] = [];
  for (const id of entries) {
    if (id.startsWith("_")) continue; // skip _trash, _meta etc.
    const dir = path.join(PROJECTS_DIR, id);
    const stat = await safeStat(dir);
    if (!stat?.isDirectory()) continue;
    const files = await safeReaddir(dir);
    let totalBytes = 0;
    let sessionCount = 0;
    let lastModified = stat.mtimeMs;
    let firstActivity = stat.birthtimeMs || stat.ctimeMs || stat.mtimeMs;
    for (const f of files) {
      if (!f.endsWith(".jsonl")) continue;
      const s = await safeStat(path.join(dir, f));
      if (!s) continue;
      totalBytes += s.size;
      sessionCount += 1;
      if (s.mtimeMs > lastModified) lastModified = s.mtimeMs;
      const birth = s.birthtimeMs || s.ctimeMs || s.mtimeMs;
      if (birth < firstActivity) firstActivity = birth;
    }
    results.push({
      id,
      decodedPath: await resolveProjectPath(id),
      sessionCount,
      totalBytes,
      lastModified,
      firstActivity,
    });
  }
  results.sort((a, b) => b.lastModified - a.lastModified);
  return results;
}

export async function listSessions(projectId: string): Promise<SessionSummary[]> {
  const dir = path.join(PROJECTS_DIR, projectId);
  const [files, aliases] = await Promise.all([
    safeReaddir(dir),
    loadAliases(),
  ]);
  const out: SessionSummary[] = [];
  for (const f of files) {
    if (!f.endsWith(".jsonl")) continue;
    const filePath = path.join(dir, f);
    const stat = await safeStat(filePath);
    if (!stat) continue;
    const sessionId = f.replace(/\.jsonl$/, "");
    const summary = await summarizeSession(filePath);
    out.push({
      projectId,
      sessionId,
      file: filePath,
      bytes: stat.size,
      mtime: stat.mtimeMs,
      ...summary,
      alias: getAlias(aliases, projectId, sessionId),
    });
  }
  out.sort((a, b) => b.mtime - a.mtime);
  return out;
}

async function summarizeSession(filePath: string) {
  let firstUserPrompt: string | null = null;
  let aiTitle: string | null = null;
  let messageCount = 0;
  let model: string | null = null;
  let gitBranch: string | null = null;
  let cwd: string | null = null;
  let inputTokens = 0;
  let outputTokens = 0;

  const rl = readline.createInterface({
    input: createReadStream(filePath, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    let obj: any;
    try {
      obj = JSON.parse(line);
    } catch {
      continue;
    }
    if (obj.type === "ai-title" && typeof obj.aiTitle === "string") {
      aiTitle = obj.aiTitle;
      continue;
    }
    if (obj.type === "user" || obj.type === "assistant") messageCount += 1;
    if (!cwd && obj.cwd) cwd = obj.cwd;
    if (!gitBranch && obj.gitBranch) gitBranch = obj.gitBranch;
    if (!model && obj.message?.model) model = obj.message.model;
    if (obj.message?.usage) {
      inputTokens += obj.message.usage.input_tokens ?? 0;
      outputTokens += obj.message.usage.output_tokens ?? 0;
    }
    if (!firstUserPrompt && obj.type === "user" && !obj.isMeta) {
      const content = obj.message?.content;
      const text = extractText(content);
      if (text && !text.startsWith("<")) firstUserPrompt = text;
    }
  }
  return {
    firstUserPrompt,
    aiTitle,
    messageCount,
    model,
    gitBranch,
    cwd,
    inputTokens,
    outputTokens,
  };
}

function extractText(content: unknown): string | null {
  if (typeof content === "string") return content.trim().slice(0, 500);
  if (Array.isArray(content)) {
    for (const c of content) {
      if (c && typeof c === "object" && "type" in c && (c as any).type === "text") {
        return String((c as any).text ?? "").trim().slice(0, 500);
      }
    }
  }
  return null;
}

export async function readTranscript(
  projectId: string,
  sessionId: string,
): Promise<TranscriptEntry[]> {
  const filePath = path.join(PROJECTS_DIR, projectId, `${sessionId}.jsonl`);
  const rl = readline.createInterface({
    input: createReadStream(filePath, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });
  const entries: TranscriptEntry[] = [];
  for await (const line of rl) {
    if (!line.trim()) continue;
    let obj: any;
    try {
      obj = JSON.parse(line);
    } catch {
      continue;
    }
    entries.push({
      uuid: obj.uuid,
      type: obj.type,
      role: obj.message?.role,
      text: extractText(obj.message?.content) ?? undefined,
      raw: obj,
      timestamp: obj.timestamp,
      model: obj.message?.model,
    });
  }
  return entries;
}

export async function deleteSession(projectId: string, sessionId: string) {
  const target = path.join(PROJECTS_DIR, projectId, `${sessionId}.jsonl`);
  await fs.rm(target, { force: true, maxRetries: 3, retryDelay: 200 });
}

export async function deleteProject(projectId: string) {
  const dir = path.join(PROJECTS_DIR, projectId);
  await fs.rm(dir, {
    force: true,
    recursive: true,
    maxRetries: 3,
    retryDelay: 200,
  });
}

export type GlobalStats = {
  projects: number;
  sessions: number;
  totalBytes: number;
  totalInputTokens: number;
  totalOutputTokens: number;
};

export async function computeGlobalStats(): Promise<GlobalStats> {
  const projects = await listProjects();
  let sessions = 0;
  let totalBytes = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  for (const p of projects) {
    const ss = await listSessions(p.id);
    sessions += ss.length;
    for (const s of ss) {
      totalBytes += s.bytes;
      totalInputTokens += s.inputTokens;
      totalOutputTokens += s.outputTokens;
    }
  }

  return {
    projects: projects.length,
    sessions,
    totalBytes,
    totalInputTokens,
    totalOutputTokens,
  };
}

export async function searchSessions(
  query: string,
  limit = 50,
): Promise<
  { projectId: string; sessionId: string; snippet: string; mtime: number }[]
> {
  const q = query.toLowerCase();
  if (!q) return [];
  const projects = await listProjects();
  const results: {
    projectId: string;
    sessionId: string;
    snippet: string;
    mtime: number;
  }[] = [];
  for (const p of projects) {
    const dir = path.join(PROJECTS_DIR, p.id);
    const files = await safeReaddir(dir);
    for (const f of files) {
      if (!f.endsWith(".jsonl")) continue;
      const filePath = path.join(dir, f);
      const stat = await safeStat(filePath);
      if (!stat) continue;
      const snippet = await scanFile(filePath, q);
      if (snippet) {
        results.push({
          projectId: p.id,
          sessionId: f.replace(/\.jsonl$/, ""),
          snippet,
          mtime: stat.mtimeMs,
        });
        if (results.length >= limit) return results;
      }
    }
  }
  return results;
}

async function scanFile(filePath: string, q: string): Promise<string | null> {
  const rl = readline.createInterface({
    input: createReadStream(filePath, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    const lower = line.toLowerCase();
    const idx = lower.indexOf(q);
    if (idx !== -1) {
      const start = Math.max(0, idx - 60);
      const end = Math.min(line.length, idx + q.length + 60);
      rl.close();
      return line.slice(start, end);
    }
  }
  return null;
}
