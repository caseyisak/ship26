# Project Instructions

## CLI tool paths

- **Homebrew / gh / other tools:** PATH may not include `/opt/homebrew/bin` in Claude Code sessions. Use full paths:
  - `gh` → `/opt/homebrew/bin/gh`
  - `brew` → `/opt/homebrew/bin/brew`
- **GitHub:** repo is `https://github.com/caseyisak/metafi`, authenticated as `caseyisak`

---

## Package Manager: Bun

This project uses **bun** for all package and script operations. Do not use npm, yarn, or pnpm.

| Use case | Use this | Do not use |
|----------|----------|------------|
| Install dependencies | `bun install` | `npm install` |
| Add a package | `bun add <pkg>` | `npm install <pkg>` |
| Add dev dependency | `bun add -d <pkg>` | `npm install -D <pkg>` |
| Run dev server | `bun run dev` | `npm run dev` |
| Build | `bun run build` | `npm run build` |
| Run tests | `bun test` or `bun run test` | `npm test` |
| Run scripts from package.json | `bun run <script>` | `npm run <script>` |
| Execute a script/file | `bun run <file>` or `bun <file>` | `npx` / `node` |

- In docs, snippets, and terminal commands: use `bun` and `bun run` only.
- For Next.js (e.g. `next dev`, `next build`): invoke via `bun run dev`, `bun run build`, etc.
- Commit and use `bun.lockb`; do not add or rely on `package-lock.json` or `yarn.lock`.

---

## Where to find things

| What | Where |
|------|-------|
| Active tasks & roadmap | `TASKS.md` |
| Completed/archived work | `archive/tasks-archive.md` ← check here before re-doing something |
| Known error patterns (LL-001–LL-008) | `documentation/lessons-learned.md` |
| Component docs & architecture | `documentation/` |
| Session memory (persists across convos) | `.claude/projects/.../memory/MEMORY.md` |
| Demo workflow rules | `memory/project_demo_workflow.md` |
| Worktree helper | `scripts/worktree-add.sh` |

**Before starting any new task:** check `TASKS.md` for current phase, `archive/tasks-archive.md` for prior art, and `documentation/lessons-learned.md` for known pitfalls.

---

## Worktree-first workflow (IMPORTANT)

**Every new phase, feature, or demo gets its own git worktree. Never switch branches mid-session.**

### Starting new work

1. Agree on a branch name (e.g. `feat/my-feature`, `demo/acme-2026-04`)
2. From the main repo root, run:
   ```bash
   bash scripts/worktree-add.sh <branch-name>
   ```
3. Open a new Claude Code instance pointed at the worktree:
   ```bash
   claude /Users/casey.lisak/Dev/metafi-worktrees/<branch-slug>
   ```
4. Do all work in that CC instance. This session stays on its current branch.

### Why

- No branch switching = no risk of clobbering another agent's context or uncommitted changes
- Each worktree is an isolated working copy — parallel CC instances can run safely
- `node_modules` is symlinked (no reinstall needed), `.env.local` is pre-copied from main

### Merging back

When the worktree work is done: open a PR (or merge directly) to `main`, then the worktree can be removed:
```bash
git worktree remove /Users/casey.lisak/Dev/metafi-worktrees/<branch-slug>
git branch -d <branch-name>
```

---

## Multi-CC coordination

This project sometimes runs **multiple Claude Code instances in parallel** (e.g. one on `main`, one on `feat/skill-creator`).

Rules to prevent overwriting each other's work:

- **One CC per branch.** Never have two CC instances on the same branch at the same time.
- **TASKS.md:** Each CC only edits its own section. The "Active branches" table in TASKS.md shows who owns what.
- **MEMORY.md:** Only the CC on `main` writes to MEMORY.md. Other branches note things locally; the main CC merges them in on PR.
- **Before starting work:** run `git log --oneline -5` to see what the other CC may have committed.
- **After a branch merges to main:** run `git pull` in all other open CC sessions before continuing.

---

## Contentful Live Preview Debugging

When debugging Contentful live preview issues, use this context.

### Two-Context Architecture

**PARENT (app.contentful.com)**
- The Contentful web app (entry editor).
- The Contentful SDK runs here and sends live updates into the iframe.

**IFRAME (localhost:XXXX)**
- Your Next.js app running locally (or deployed preview URL).
- Receives live updates from the SDK. **This is where you debug rendering issues.**

When the user says "preview is broken," clarify: are they talking about the **parent** (entry form) or the **iframe** (rendered content)? Most issues are in the iframe.

### Data Flow Inspection Points

- **`[useFetchEmbeddedEntries]`** – Console logs for fetched/merged embedded entries.
- **`/api/fetch-deferred-entries`** – Network: status 200 and response payload.
- **Entry ID consistency** – Rich text JSON `EMBEDDED_ENTRY` nodes must exist in `content.links.entries`.
- **SDK connection** – Console: `useLiveUpdates` / `useContentfulLiveUpdates` / `LivePreviewProvider`.
- **Hydration** – React hydration warnings in console.

If API calls succeed but UI shows incomplete data, the bug is likely in **merge/replace logic** in `src/hooks/use-fetch-embedded-entries.ts`.

### Lessons Learned

Before concluding, check **`documentation/lessons-learned.md`** (LL-001 through LL-008) for known error patterns.

For systematic browser inspection, invoke the **contentful-live-preview-verify** skill at `.claude/commands/skills/contentful-live-preview-verify.md`.
