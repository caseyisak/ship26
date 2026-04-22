# Prime Context — 2026-03-27

## Project
Next.js 15 + Contentful-driven demo site (metafi) with live preview, Tailwind v4, and a Ninetailed personalization layer. Main branch is the clean sandbox with all blocks; demos branch off main.

## File Map
- CMS blocks: `src/cms-components/{banner,blog-post,data-viz,faq,features,hero,social-card-preview,tabbed-content}/`
- Block renderer: `src/block-renderer/block-renderer.tsx`, `src/block-renderer/types.ts`
- App routes: `src/app/` — page, preview, blog, app (mobile frame), contentful-app, pricing, etc.
- Services: `src/services/contentful/` — per-block data fetchers
- Personalization: `src/personalization/ninetailed-nextjs.tsx` (Ninetailed SDK, activated)
- Global styles: `src/app/globals.css` (Tailwind v4 + `[data-theme='*']` demo theme blocks)
- Layout: `src/app/layout.tsx` — `data-theme={process.env.NEXT_PUBLIC_BRAND}` on body
- Types: `src/types/`
- Lib/utils: `src/lib/`
- Contentful App: `src/contentful-app/` + `src/app/contentful-app/`

## Key Patterns
- CMS components in `src/cms-components/` — each block has its own dir
- Block renderer maps Contentful `__typename` → React component via `src/block-renderer/types.ts`
- Live preview: `useLiveUpdates` from `@contentful/live-preview/react`; BY_ID queries in preview routes
- Theming: `[data-theme='<name>']` CSS var overrides in globals.css; env var `NEXT_PUBLIC_BRAND`
- Testing: vitest + vi.mock for Radix UI (peer dep conflict — see existing test files for mock pattern)
- Package manager: bun only

## Completed Blocks (all on main)
Hero | FAQ | TabbedContent | Features | DataViz (5 chart types) | Blog | Banner | SocialCardPreview

## Recent Activity
- `ae295ef` Ninetailed SDK activated with variant switching (layout.tsx + ninetailed-nextjs.tsx)
- `4768150` lessons-learned split from monolith → per-file in `documentation/lessons-learned/`
- docs updates: Contentful migration plan, README, dev guide

## Active Initiative — AIO/AEO/GEO Demo Loop
**Branch to create:** `feat/aio-aeo-geo-demo` (worktree, not yet created — must create before code)
**Spec + tasks:** `.claude/specs/001-aio-aeo-geo-demo/tasks.md` — 8 milestones, all pending

### Key paths for this work
- Before panel (static, no changes): `src/components/sections/metafi-faq.tsx`
- After panel (CMS, extend): `src/cms-components/faq/faq.tsx`
- GraphQL queries: `src/services/contentful/queries.ts`
- TypeScript types: `src/block-renderer/types.ts`
- New demo page: `src/app/demo/faq-aeo/page.tsx`
- New component: `src/components/demo/AioAeoPreviewPanel.tsx`
- Demo loop bundle: `demo-loops/aio-aeo-geo/` (to create)

### Contentful for this work
- Space: `uumzxfocy3ef`, Env: `master`
- New content type `aioAeoGeo` (5 fields) — M1
- Add `aioAeoGeo` array field to existing `faqitem` — M2
- Seed 4 governance entries + 6 FAQ entries — M3

### Worktree setup (run first)
```bash
bash scripts/worktree-add.sh feat/aio-aeo-geo-demo
# Open new CC at: /Users/casey.lisak/Dev/metafi-worktrees/feat-aio-aeo-geo-demo
```

## Roadmap (TASKS.md)
- Demo System: demo-loops/ structure → brand scraper → asset bundles → slides integration
- Skill references cleanup: extract heavy content from SKILL.md files into references/

## Must-reads before planning
- `TASKS.md` — active phases and branch ownership
- `documentation/lessons-learned/index.md` — known error patterns
- `documentation/session-handoff.md` — cross-session context
- `src/block-renderer/types.ts` — how new blocks get wired in
