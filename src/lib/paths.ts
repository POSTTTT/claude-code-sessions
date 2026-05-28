import os from "node:os";
import path from "node:path";

export const CLAUDE_HOME =
  process.env.CLAUDE_HOME ?? path.join(os.homedir(), ".claude");

export const PROJECTS_DIR = path.join(CLAUDE_HOME, "projects");

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
