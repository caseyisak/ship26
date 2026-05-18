# CLAUDE.md — Metafi × Contentful Demo Sandbox

This file is the single source of truth for how Claude Code (CC) should operate in this repo.
Read it at the start of every session before touching any code.

---

## What this repo is

**Metafi** is a Next.js 15 marketing site that serves as the **live sandbox and demo platform for Contentful**. Every block, content type, and integration here exists to show prospective customers what Contentful can do.

Two modes of use:

| Mode | Branch pattern | Purpose |
|------|---------------|---------|
| **Sandbox** | `main` | The always-on demo site. All blocks live here. Generic branding. |
| **Custom demo** | `demo/<customer>` | Customer-specific branch with a new Contentful env, branded content, and curated demo loops |

The sandbox is the source of truth. Custom demos branch off it, run their demo, then **promote any reusable components or content types back into main** before the branch is retired.

---

## Tech stack

- **Framework:** Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui
- **Package manager:** Bun — never npm/yarn/pnpm (see table below)
- **CMS:** Contentful via GraphQL API
- **Live preview:** Contentful Live Preview SDK — real-time field updates in iframe
- **Personalization:** Ninetailed
- **Custom apps:** Section Style Editor, Integration Simulator (both in `src/app/contentful-app/`)
- **Contentful space:** `uumzxfocy3ef`, environment: `master`

### Bun command reference

| Use case | Command |
|----------|---------|
| Install deps | `bun install` |
| Add package | `bun add <pkg>` |
| Add dev dep | `bun add -d <pkg>` |
| Dev server | `bun run dev` |
| Build | `bun run build` |
| Tests | `bun test` |
| Type check | `bunx tsc --noEmit` |
| Lint | `bun run lint` |

---

## Component sources (check in this order)

Before building any new UI component, check these sources. Do NOT build from scratch if a good starting point exists.

1. **`metafi-nextjs-template-1.0.0/`** — the static starter template. **Read-only.** Never modify it. Use it as a reference for layout, component structure, and static markup that can be wired to Contentful.
2. **shadcnblocks** (`https://www.shadcnblocks.com`) — browse by section type (hero, faq, pricing, etc.). API key in `.env.local` as `SHADCNBLOCKS_API_KEY`. Install: `bunx shadcn add @shadcnblocks/[block-name]`.
3. **Existing `cms-components/`** — check if a block already exists before creating a new one.
4. **Custom demo branches** — components built for a specific customer that have been promoted to sandbox.

**Workflow before building:** Use the `add-contentful-block` skill — it runs discovery, Q&A, content model approval, and milestones before any code is written.

---

## MCP servers

MCPs extend what Claude can do. This project uses two types:

### Docker MCP Toolkit (via Docker Desktop)

These run in Docker containers. They are preferred over native MCPs to keep token usage low and avoid auth complexity. Activate via Docker Desktop → MCP Toolkit.

| Server | Tools | When to use |
|--------|-------|-------------|
| Brave Search | 6 | Web research, competitor lookups |
| Context7 | 2 | Library/framework docs lookup |
| Firecrawl | 14 | Brand scraping for demo setup |
| n8n | 42 | Workflow automation |
| Notion | 22 | Reading/writing Notion docs |
| Playwright | 21 | Browser automation, visual testing |
| Sequential Thinking | 1 | Complex multi-step reasoning |
| YouTube Transcripts | 4 | Pulling video content for context |

### Cloud / native MCPs (always available)

| Server | When to use |
|--------|------------|
| Contentful MCP | Create/update content types, entries, publish — preferred over manual UI |
| Vercel MCP | Deployments, build logs, runtime logs |
| Mermaid Chart | Diagrams |
| IDE MCP | Diagnostics, code execution |

**MCP config lives in:** `~/.claude.json` (not `~/.claude/mcp.json`). Use `claude mcp list` to verify status.

---

## Skills — when to use which

Skills are structured workflows that replace ad-hoc instructions. Always use the right skill rather than winging it.

| Task | Skill |
|------|-------|
| Building a new Contentful block (end-to-end) | `/add-contentful-block` |
| Live preview broken / debugging | `/skills:contentful-live-preview-verify` |
| New demo from scratch | `/skills:demo-setup` |
| Test NT personalization | `/skills:test-nt-personalization` |
| Spin up a multi-agent team | `/spin-team` |
| Session start (prime context) | `/prime` |
| Session end (wrap + write memory) | `/wrap` |
| Create/improve a skill | `/skills:skill-creator` |
| Write a feature spec | `/speckit.specify` |
| Generate implementation tasks | `/speckit.tasks` |
| Execute tasks from spec | `/speckit.implement` |

---

## Memory — what to save and when

Memory files live in `.claude/projects/.../memory/`. The index is `MEMORY.md`.

**Save to memory when you learn:**
- Something non-obvious about how this project works that will matter in a future session
- A user preference or correction that should change CC's behavior going forward
- A project decision with a "why" that isn't obvious from the code

**Do NOT save to memory:**
- Code patterns (read the code)
- Git history (use `git log`)
- Anything already in CLAUDE.md or TASKS.md
- Ephemeral task state (use tasks/plans instead)

**Only the CC on `main` writes to `MEMORY.md`.** Worktree CCs note things locally and the main CC merges them in when the PR lands.

---

## Where to find things

| What | Where |
|------|-------|
| Active tasks & roadmap | `TASKS.md` |
| Completed/archived work | `archive/tasks-archive.md` |
| Lessons learned (LL-001+) | `documentation/lessons-learned/index.md` |
| Component docs & architecture | `documentation/` |
| Demo loop library | `demo-loops/` |
| Demo-OS spec | `demo-loops/DEMO-OS.md` |
| New demo runbook | `demo-loops/NEW-DEMO-RUNBOOK.md` |
| Session memory | `.claude/projects/.../memory/MEMORY.md` |
| Worktree helper | `scripts/worktree-add.sh` |
| Static template (read-only) | `metafi-nextjs-template-1.0.0/` |

**Before starting any task:** check `TASKS.md` → `archive/tasks-archive.md` → `documentation/lessons-learned/index.md`.

---

## Documentation — what to write and when

### Lessons Learned (`documentation/lessons-learned/`)

Write a new LL entry whenever you hit a **non-obvious error** that wasted time and will likely recur.

**When:** After fixing a bug that wasn't obvious from the error message.
**How:** Create a new `.md` file in `documentation/lessons-learned/` and add one row to `index.md`.
**Format:** symptom → root cause → fix → related files.
**Naming:** `ll-NNN-short-slug.md` (increment from current max).

Current max: LL-029.

### Handoff docs (`documentation/handoff-*.md`)

Write a handoff doc whenever a session ends mid-feature, or a new worktree is about to be started.

**Lifecycle:** Stay active until the branch merges. Archive to `documentation/archive/` with date stamp on merge.
**Must include:** what was built, what's open, files to read first, next steps with source + why.

### Session handoff at worktree creation

When creating a new worktree, always create a handoff/PRD doc **before switching to that worktree session**. This doc is the first thing the worktree CC reads. It must contain:
- Why this branch exists (the demo or feature it serves)
- What was agreed / decided before branching
- Files to read first
- Ordered implementation steps
- Related Contentful env / content types

---

## Worktree workflow (IMPORTANT)

**Every new feature, demo, or phase gets its own git worktree. Never switch branches mid-session.**

### Starting new work

1. Agree on branch name: `feat/<name>`, `fix/<name>`, `demo/<customer>-<date>`
2. Create the worktree:
   ```bash
   bash scripts/worktree-add.sh <branch-name>
   ```
3. Write the PRD/handoff doc in the current session (before switching).
4. **STOP.** Tell the user to open a new CC instance:
   ```bash
   claude /Users/casey.lisak/Dev/metafi-worktrees/<branch-slug>
   ```
5. All work happens in that CC instance. This session stays on main.

### Collapsing a worktree back to main

When a worktree is done:
1. All tests pass, types clean, lint clean
2. Open a PR and merge to `main`
3. Archive the handoff doc to `documentation/archive/`
4. Pull any new lessons learned into `documentation/lessons-learned/`
5. If the branch added reusable components/CTs from a custom demo, update `TASKS.md` blocks inventory
6. Remove the worktree:
   ```bash
   git worktree remove /Users/casey.lisak/Dev/metafi-worktrees/<branch-slug>
   git branch -d <branch-name>
   ```

---

## Demo lifecycle

### Starting a custom demo

1. Read `demo-loops/NEW-DEMO-RUNBOOK.md` — follow it exactly
2. Create branch `demo/<customer>-<date>`, new Contentful env named after customer
3. Run brand scraping (Firecrawl MCP) → paste tokens into siteSettings CT entry
4. Pull relevant demo loops from `demo-loops/` into the env
5. Write `DEMO_SCRIPT.md` in the demo branch

### After a custom demo

1. Write lessons learned (especially anything Contentful-specific or component-specific)
2. **Promote reusable work back to sandbox:**
   - New content types → add to `master` Contentful env + component in `cms-components/`
   - New demo loops → add to `demo-loops/<customer>/` and register in `DEMO-OS.md`
   - New UI patterns → extract to generic component, wire to Contentful, PR to `main`
3. Archive the demo handoff doc
4. Close GitHub issues filed against the demo branch

### Demo loop library (`demo-loops/`)

Each loop lives in `demo-loops/<customer>/loops/<loop-name>/LOOP.md`. Schema: `demo-loops/_schema.md`.

A LOOP.md must contain: talk track, click path, setup steps, modularity story, AI conversion guide.

**Promotion lifecycle:** demo-only → candidate → sandbox (tracked in `DEMO-OS.md`).

---

## Agent teams (tmux + /spin-team)

For complex tasks that benefit from parallel agents (e.g. building a full demo, running multi-step research + implementation):

1. Use `/spin-team` to configure and launch an agent team
2. Agents run in tmux panes — each pane is a separate CC session on its own worktree branch
3. **Check branch + working directory before spinning up** — agents must be in the right worktree
4. Coordinate via `TASKS.md` — each agent owns its own section
5. Only the main CC writes to `MEMORY.md`; agent CCs write local notes

---

## Git commit format

Every commit — **both parts required:**

```
<type>(<scope>): <what> — <why/operational detail>
```

**Good:**
```
feat(faq): add aioAeoGeo link field — governance metadata enables AEO story in demo
fix(data-viz): clamp bubble radius — was overflowing container at small viewport widths
fix(newsletter): fix RT field names in query — Banner/Hero/TwoAcross migrated to headlineRt
```

**Bad (missing why):**
```
feat(faq): add aioAeoGeo link field
fix(data-viz): clamp bubble radius
```

The `— why` is what allows future CC sessions to reconstruct intent from `git log` alone.

---

## Multi-CC coordination

- **One CC per branch.** Never two CC instances on the same branch.
- **TASKS.md:** Each CC edits only its own section.
- **MEMORY.md:** Only main CC writes here.
- **Before starting work:** `git log --oneline -5` to see recent activity.
- **After a branch merges to main:** `git pull` in all open CC sessions.

---

## CLI tool paths

PATH may not include `/opt/homebrew/bin` in CC sessions. Use full paths:

- `gh` → `/opt/homebrew/bin/gh`
- `brew` → `/opt/homebrew/bin/brew`
- GitHub repo: `https://github.com/caseyisak/metafi`, auth: `caseyisak`

---

## Contentful live preview debugging

**Two-context architecture:**
- **PARENT** (`app.contentful.com`) — Contentful web app, SDK sends updates into iframe
- **IFRAME** (`localhost:3000`) — your Next.js app, receives live updates

When preview is broken: clarify parent vs iframe first. Most issues are in the iframe.

**Key inspection points:**
- Console: `useLiveUpdates` / `LivePreviewProvider` connected?
- Network: `/api/fetch-deferred-entries` → 200?
- Console warn: `[fetchGraphQL] GraphQL errors` — field name mismatch, CT migration, query byte limit
- Hydration warnings in React DevTools

**Before concluding:** check `documentation/lessons-learned/index.md` for known patterns.
**For systematic debugging:** run `/skills:contentful-live-preview-verify`.

**Common silent-failure pattern:** `fetchGraphQL` catches all errors and returns null. A GraphQL field name mismatch (e.g. querying `headline` after CT migrated to `headlineRt`) will 404 the preview with no visible error. Always check the dev server terminal for `[fetchGraphQL] GraphQL errors` warnings.

---

## Metafi's role in the Demo-OS system

**Demo-OS** (`/Users/casey.lisak/Dev/demo-os`) is a separate project — the planning and orchestration layer. **Metafi is the execution layer.** This distinction is non-negotiable:

| Demo-OS does | Metafi does |
|---|---|
| Read discovery briefs | Build components |
| Select demo loops | Create/update Contentful entries |
| Write change plans | Run the dev server |
| Write handoff docs → Metafi | Execute handoff instructions |
| Track loop promotion | Write technical lessons learned |

### When a Metafi CC session starts for a demo

1. **Read the handoff doc first:** `documentation/handoff-[customer].md` — Demo-OS wrote it, it specifies exactly what to build
2. **Build what the handoff specifies.** Don't make loop selection decisions — that already happened in Demo-OS.
3. **Follow the existing demo runbook:** `demo-loops/NEW-DEMO-RUNBOOK.md`
4. **Technical lessons learned** (code bugs, GraphQL errors, live preview issues) → `documentation/lessons-learned/`. Demo-specific lessons (what loops landed with the prospect, brand observations) → flag for Demo-OS, they don't belong here.

### What Metafi does NOT do in the Demo-OS workflow

- Make loop selection decisions (Demo-OS owns this)
- Update `demo-loops/DEMO-OS.md` promotion status (Demo-OS owns this)
- Write `documentation/output/*.json` files (those are Demo-OS output artifacts)
- Reason about which loops best match a prospect's pain signals

### The loop library lives here

`demo-loops/DEMO-OS.md` is the sandbox inventory and loop library index. Demo-OS reads it — Metafi does not need to read or modify it except when promoting a loop to sandbox status (which happens via a PR to main, not by editing the file directly).

### Entry IDs matter

The most valuable thing Metafi CC can do for the Demo-OS pipeline is **keep entry IDs accurate in LOOP.md Entry Reference tables**. When a loop is built or updated, record the `sys.id` of every Contentful entry the loop touches. Demo-OS's `demo-plan` skill depends on these IDs to produce an actionable change plan.
