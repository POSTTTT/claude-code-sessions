import os from "node:os";
import path from "node:path";

export const CLAUDE_HOME =
  process.env.CLAUDE_HOME ?? path.join(os.homedir(), ".claude");

export const PROJECTS_DIR = path.join(CLAUDE_HOME, "projects");

export const CODEX_HOME =
  process.env.CODEX_HOME ?? path.join(os.homedir(), ".codex");

export const CODEX_SESSIONS_DIR = path.join(CODEX_HOME, "sessions");

/**
 * Codex stores sessions in a flat date tree, not per-project folders, so we
 * group them by their real `cwd`. We encode that path (and per-session file
 * paths) into URL-safe base64url ids so they survive routing losslessly.
 */
export function encodeId(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

export function decodeId(id: string): string {
  return Buffer.from(id, "base64url").toString("utf8");
}

/**
 * Claude encodes project paths as folder names by replacing path separators
 * and `:` with `-`. There's no lossless inverse, but we can produce a
 * readable approximation by re-introducing `\` after the leading drive letter
 * on Windows and `/` on POSIX.
 */
export function decodeProjectId(id: string): string {
  if (/^[A-Za-z]--/.test(id)) {
    const drive = id[0];
    const rest = id.slice(3).replace(/-/g, "\\");
    return `${drive}:\\${rest}`;
  }
  return "/" + id.replace(/^-/, "").replace(/-/g, "/");
}
