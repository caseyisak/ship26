# Project Prime — Metafi × Contentful Demo Site

You are working on **Metafi**, a Next.js 15 marketing site template that serves as a **live demo and sales tool for Contentful**. It shows prospective Contentful customers a polished, production-ready site fully driven by Contentful CMS.

## What this project is

- **Framework**: Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui
- **Package manager**: Bun (always use `bun run`, never npm/yarn/pnpm)
- **CMS**: Contentful via GraphQL API
- **Live preview**: Contentful Live Preview SDK with real-time field updates in an iframe
- **Contentful space**: `uumzxfocy3ef`, environment: `master`

## Architecture

### How a page works

```
Contentful Page entry (slug, sections[])
  → GraphQL PAGE_BY_SLUG query
  → /page/[slug]/page.tsx (server: fetches raw GraphQL data)
  → page-content-live.tsx (client: useLiveUpdates() + transformSection())
  → <BlockRenderer> × N sections
  → cms-component (Hero, FAQ, Features, TabbedContent, DataViz)
```

Raw GraphQL data is passed to the client *untransformed* so `useLiveUpdates()` can merge live changes by `sys.id`.

### Block system

- `block-renderer/configs/index.ts` — registry mapping `__typename` → lazy React component
- `block-renderer/types.ts` — TypeScript fragment types for all blocks
- `cms-components/[block]/[block].tsx` — each block's React component with `useLiveUpdates()` + inspector mode props

### Current blocks

| typename | component | status |
|----------|-----------|--------|
| Hero | cms-components/hero/hero.tsx | done, section style editor, custom grid layout |
| Features | cms-components/features/features.tsx | done, animation registry |
| Faq | cms-components/faq/faq.tsx | done |
| TabbedContent | cms-components/tabbed-content/tabbed-content.tsx | done |
| DataViz | cms-components/data-viz/data-viz.tsx | done, 5 chart types, interactive legend |

### Live preview architecture

- **Draft mode**: `/api/enable-draft?secret=kaz&slug=...` or `&entryId=...&type=hero|dataViz|tabbedContent`
- **ID-based preview routes**: `/preview/hero/[entryId]`, `/preview/data-viz/[entryId]`, `/preview/tabbed-content/[entryId]`
- **ENTRY_SAVED fix**: `page-content-live.tsx` listens to postMessage for `ENTRY_SAVED` and calls `router.refresh()` when the saved entry matches the page's `sys.id`
- **HTTPS required** for section style app in Contentful: `bun run dev:https`

### Key files

| File | Purpose |
|------|---------|
| `src/services/contentful/client.ts` | GraphQL client (delivery vs preview token) |
| `src/services/contentful/queries.ts` | All GraphQL fragments + queries |
| `src/services/contentful/page.ts` | `getPageBySlug`, `getPageSlugs`, all mappers |
| `src/block-renderer/block-renderer.tsx` | Renders a block by typename |
| `src/block-renderer/configs/index.ts` | Block config registry |
| `src/lib/live-preview.tsx` | `useLiveUpdates()` wrapper |
| `src/app/page/[slug]/page-content-live.tsx` | Client page with live updates + ENTRY_SAVED listener |
| `src/app/api/enable-draft/route.ts` | Draft mode activation |
| `src/app/contentful-app/` | Section Style editor Contentful app |
| `documentation/lessons-learned.md` | LL-001–LL-008 known error patterns |
| `TASKS.md` | Current milestone status and next steps |

## Known issues / gotchas

- **GraphQL type names**: Match Contentful content type IDs exactly (e.g. `Faqitem` not `FaqItem`)
- **Field name**: Hero uses `media` (not `image`) in Contentful; mapped to `image` in the fragment for component use
- **Dev server**: Use `bun run dev` (no Turbopack — Turbopack has a manifest bug in Next.js 15.1.1)
- **Pre-existing test failures**: Hero/Features "React is not defined" — motion library issue, unrelated to current work
- **DataViz treemap text**: Requires `stroke="none"` + `style={{ paintOrder: 'fill' }}` to prevent white outlines
- **Contentful MCP publishing order**: Publish child entries before parent entries

## Current state (as of last session)

- All 5 blocks fully implemented and live-preview-ready
- DataViz block: all 4 milestones done (groupedBar, treemap, bubble, radar, funnel); CSV upload done for sample entry
- Features block: content types created in Contentful, entry `6sAqLv0XQlh4b3ipvEg5qH` ready to add to a Page
- Next work: add Features block to a Page's sections in Contentful; wire personalization (`ntExperiencesCollection`)

## Active Demo Project
- **Chicago Bears demo** — branch `demo/bears`, Contentful env `bears`
- Full brief: `documentation/bears-demo.md` — what's built, what's open, how to run
- Open work: API token access, sample entries, preview URLs, logo, Contentful Release

## How to start working

1. Read `TASKS.md` for current milestone status
2. Read `documentation/lessons-learned.md` before debugging live preview
3. Check memory files in `.claude/projects/.../memory/` for session notes
4. Run `bun run dev` to start the dev server
