# claude-code-sessions

A local web app for browsing, searching, and managing the Claude Code session logs
that pile up under `~/.claude/projects/`. Lists every project Claude Code has
touched, lets you read transcripts, search across sessions, see stats, give
sessions human-readable names, and clean up old ones.

Everything runs locally. The app reads `.jsonl` files directly from disk — no
data leaves your machine, no Anthropic API calls are made.

## What it shows you

- **Projects list** — every folder under `~/.claude/projects/`, with the real
  directory path (resolved from each session's `cwd`, not the lossy dash-encoded
  folder name), session count, total size on disk, age, and last activity.
  Every column is sortable.
- **Sessions list** — per project, with the first user prompt as a preview,
  message count, model used, git branch, token totals, and a custom name if
  you've given it one.
- **Transcript viewer** — renders each session as readable messages with
  filters for `messages`, `tools`, or `all`. Tool calls and tool results are
  shown inline; collapsible "thinking" blocks; "show raw" toggle for the
  underlying JSON.
- **Search** — content search across every `.jsonl`. Returns snippets and links
  straight to the matching session.
- **Stats** — totals (projects, sessions, size, input/output tokens), a daily
  activity sparkline, and a top-models table.

## What it lets you do

- **Rename sessions** — give any session a custom display name. Stored in a
  sidecar `~/.claude/projects/_aliases.json` for app use, and **also mirrored
  into the `.jsonl` as a new `ai-title` line** so Claude Code's terminal
  `/resume` picker shows the same name. The session UUID itself is never
  changed.
- **Delete sessions or whole projects** — permanently removes the `.jsonl`
  file or the project folder from disk. Confirmation prompt before each
  delete; uses `fs.rm` with retries to ride out transient Windows file locks.

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript, Tailwind CSS
- Server-side filesystem access via Server Actions
- No database, no auth — meant to run on `localhost`

## Setup

```powershell
npm install
npm run dev
```

Then open <http://localhost:3000>.

The app reads from `~/.claude/projects/` by default. Override with the
`CLAUDE_HOME` environment variable if you keep `.claude/` elsewhere:

```powershell
$env:CLAUDE_HOME = "D:\some\other\.claude"
npm run dev
```

### A note on OneDrive

If this repo lives under `OneDrive\...`, `npm install` can hang silently
because OneDrive's file-on-demand sync intercepts every small write. If you see
no progress for several minutes:

- Right-click the OneDrive tray icon → **Pause syncing → 2 hours** and retry,
  or
- Clone the repo to a non-synced path like `C:\dev\`.

## Layout

```
src/
  app/
    page.tsx                          projects list
    p/[projectId]/page.tsx            sessions in a project
    p/[projectId]/s/[sessionId]/      session transcript
    search/page.tsx                   content search
    stats/page.tsx                    totals + charts
    actions.ts                        server actions (delete, rename)
    layout.tsx, globals.css
  components/
    ProjectsTable.tsx                 sortable project table (client)
    SessionTitle.tsx                  inline rename (client)
    DeleteButton.tsx                  trash w/ confirm (client)
    TranscriptView.tsx                transcript renderer (client)
  lib/
    paths.ts                          CLAUDE_HOME / PROJECTS_DIR / decode
    sessions.ts                       list/read/search/trash/stats
    aliases.ts                        rename sidecar storage
    format.ts                         bytes / relative / duration helpers
```

## Safety

- **Delete is permanent.** The app uses `fs.rm` to remove the `.jsonl` file
  (or the whole project folder for project delete). A confirmation dialog
  shows the full path/name before anything is removed.
- **Rename never touches the `.jsonl`.** Only the alias map is written.
- The app is read-only over the network — it expects `localhost` and has no
  auth. Don't expose it.

## License

See `LICENSE`.
