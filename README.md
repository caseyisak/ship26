# Metafi — Contentful Demo Site

A Next.js 15 marketing site template used as a **live demo and sales tool for Contentful**. All content — pages, blocks, media — is driven by Contentful CMS with real-time live preview.

- [Demo](https://Metafi-nextjs-template.vercel.app/)

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Contentful (GraphQL API, Live Preview SDK, Section Style Editor)
- Bun (package manager)

---

## Getting Started

Install [Bun](https://bun.sh) if needed:

```bash
curl -fsSL https://bun.sh/install | bash
```

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How We Work

### Branch + Worktree Model

`main` is the clean sandbox with all blocks. Every customer demo and feature gets its own **git worktree** so multiple Claude Code instances can run in parallel without conflicts.

```
main                        ← source of truth, all blocks
feat/[feature]              ← feature work (worktree at metafi-worktrees/feat-[feature])
demo/[customer]             ← customer demo (worktree at metafi-worktrees/demo-[customer])
```

Create a new worktree:

```bash
bash scripts/worktree-add.sh feat/my-feature
# Opens at: /Users/casey.lisak/Dev/metafi-worktrees/feat-my-feature
```

### Demo Branches

Each customer demo branches off `main` and gets its own Contentful environment:

- Brand tokens scraped → `[data-theme='customer']` CSS vars in `globals.css`
- `NEXT_PUBLIC_BRAND=customer` in `.env.local`
- Contentful environment: `CONTENTFUL_ENVIRONMENT=customer`
- Demo content seeded via MCP tools

### Claude Code + Skills

All Contentful block work uses Claude Code with project skills in `.claude/commands/skills/`:

| Skill | When to use |
|-------|------------|
| `contentful-block-discovery` | Start here — scan existing components before writing any code |
| `contentful-block-graphql-types` | Milestone 1 — add GraphQL fragment, types.ts, mapper |
| `contentful-block-component` | Milestone 2 — build React component + register in block config |
| `contentful-mcp-create-model` | Milestone 3 — create content type + entries via MCP |
| `contentful-block-live-preview` | Milestone 4 — wire up preview route + BY_ID query |
| `contentful-live-preview-verify` | Milestone 5 — verify live preview with browser diagnostics |
| `continuous-improvement` | End of milestone — archive tasks, update lessons learned |
| `add-contentful-block` | Orchestrates all milestones end-to-end |

The `skill-creator` toolkit (`.claude/commands/skills/skill-creator/`) is used to build and optimize skills.

Before adding a new block, always run the `contentful-block-discovery` skill first.

---

## Contentful Architecture

### How a page works

```
Contentful Page entry (slug, sections[])
  → GraphQL PAGE_BY_SLUG query
  → /page/[slug]/page.tsx (server: fetches raw GraphQL data)
  → page-content-live.tsx (client: useLiveUpdates() + transformSection())
  → <BlockRenderer> × N sections
  → cms-component (Hero, FAQ, Features, TabbedContent, DataViz, Blog)
```

### Current blocks

| Block | Content type | Status |
|-------|-------------|--------|
| Hero | `hero` | Done — section style editor, custom grid |
| FAQ | `faq` + `faqItem` | Done |
| TabbedContent | `tabbedContent` | Done |
| Features | `features` + `feature` | Done — animation registry |
| DataViz | `dataViz` | Done — 5 chart types, interactive legend |
| Blog Post | `blogPost` | Done — rich text, sticky TOC, live preview |

### All media served from Contentful

Images and assets are **never hardcoded** in the codebase. All media comes from Contentful's asset delivery API (`images.ctfassets.net`). Reference media by the field name in the GraphQL fragment (e.g. `media { url }`).

### Live preview

- Draft mode: `/api/enable-draft?secret=kaz&slug=...` or `&entryId=...&type=...`
- ID-based preview routes: `/preview/[blockType]/[entryId]`
- Section Style Editor: custom Contentful app at `/contentful-app` (requires HTTPS — use `bun run dev:https`)

### Environment variables

```bash
CONTENTFUL_SPACE_ID=uumzxfocy3ef
CONTENTFUL_ENVIRONMENT=master          # or customer-specific env
CONTENTFUL_ACCESS_TOKEN=...
CONTENTFUL_PREVIEW_ACCESS_TOKEN=...
CONTENTFUL_PREVIEW_SECRET=kaz
NEXT_PUBLIC_BRAND=                     # set to customer name for themed demos
```

---

## Documentation

- [Codebase Architecture](documentation/CODEBASE-ARCHITECTURE.md)
- [Development Guide](documentation/DEVELOPMENT-GUIDE.md)
- [Contentful Migration Plan](documentation/CONTENTFUL-MIGRATION.md) — what's static, what needs migrating
- [Lessons Learned](documentation/lessons-learned.md) — error patterns and fixes
- [Documentation Index](documentation/README.md) — for agents

---

## Deploy

Deploy via [Vercel](https://vercel.com). Add all env vars from above in the Vercel project settings.
