# Metafi Master Plan — 2026-04-03

## Coordinator Protocol
- This CC session (main branch) = coordinator only. Never does implementation work directly.
- All implementation delegated to sub-agents in tmux worktrees.
- Agents report back → coordinator synthesizes → Casey does visual sign-off before any merge.
- No branch merges to main without: tests passing + best practices confirmed + Casey visual sign-off.

## Branching Strategy
- One branch per cherry-pick group or feature. Never one giant branch.
- Safer to isolate: if one cherry-pick breaks something, it doesn't take down the whole effort.
- All branches PR into main. Coordinator reviews each PR before flagging Casey.

---

## Phase 0 — CT Migrations (Contentful MCP, no code changes)
**Runs first. Blocks all cherry-picks that depend on schema.**

### 0A — Full RichText Audit (all existing content types)
Agent reads every CT in master env. For each Symbol or Long Text field that renders on the frontend:
- Migrate to RichText
- Exception: `internalName` and any UI-only identifier fields stay Symbol

Scope: Hero, Banner, Faq, FaqItem, Features, FeatureItem, TabbedContent, TabbedContentItem, DataViz, TwoAcross, BlogPost, BlogPostsSection, MediaWrapper, Settings, Nav, Footer, Author, Newsletter, DashboardPage

### 0B — WOW Delta CT Migrations
Bring master env CTs up to parity with WOW env:
1. **Banner**: rename `headline` → `headlineRt` (Symbol → RichText), `subheadline` → `subheadlineRt`; add `colorVariant` field
2. **Features**: add `mediaPosition` field (Symbol, predefined: top/bottom/left/right)
3. **FeatureItem**: add `titleRt` (RichText), `mediaPlacement` (Symbol, dropdown), `sectionStyle` (JSON)
4. **Settings**: create Nav + Footer content types; add `nav` reference, `footer` reference, `personas` JSON, `cornerStyle` to Settings CT
5. **TwoAcross**: create full content type (eyebrow, heading, body RichText, media, mediaAltText, mediaPosition, ctaLabel, ctaUrl, colorVariant, sectionStyle)
6. **DashboardPage**: create CT with `top`/`middle`/`bottom` slot references + `pageType` field (dashboard-home/upgrades/checkout)
7. **Newsletter**: create CT if not present in master env

After all CT migrations: agent verifies GraphQL schema matches query fragments before proceeding to Phase 1.

---

## Phase 1 — Cherry-picks: WOW → Main
**Sequential within each group. Each group = its own branch.**
Source: `demo/wow-personalization-2026-04`

### Group order and branch names:

| # | Branch | What | Depends on |
|---|--------|------|------------|
| 1 | `cherry/nt-infrastructure` | LocalAudienceEvaluator chain (5 commits), crypto polyfill, onProfileChange subscription | Nothing |
| 2 | `cherry/font-cascade` | globals.css font var cascade (1 line) | Nothing |
| 3 | `cherry/ts-fixes` | TypeScript cast fixes | Nothing |
| 4 | `cherry/blog-native-tags` | contentfulMetadata.tags everywhere, query + service + component + page | Verify master BlogPost entries have native tags |
| 5 | `cherry/banner-enhancements` | colorVariant, sectionStyle, RT headline/subheadline, variant dropdown, contrast enforcement | 0B Banner CT migration |
| 6 | `cherry/features-mediapositon` | Features mediaPosition + FeatureItem mediaPlacement + generic animations (6 entrance animations) | 0B Features + FeatureItem CT migration |
| 7 | `cherry/settings-nav` | Settings service refactor, Nav/Footer CTs, personas, cornerStyle, Navbar CMS-driven | 0B Settings CT migration |
| 8 | `cherry/two-across` | TwoAcross full block — component, types, queries, block renderer wiring | 0B TwoAcross CT creation |
| 9 | `cherry/feature-item-card` | FeatureItemCard component, titleRt, NT merge tags, live preview | 0B FeatureItem CT migration |
| 10 | `cherry/dashboard-service` | Dashboard service layer + queries only (no layouts) + enable-draft route | 0B DashboardPage CT creation |
| 11 | `cherry/newsletter` | Full newsletter system, Gmail-style preview, embedded references (TwoAcross/Hero/BlogPost in RTE), leadStory/promoSlot slots, live preview route | 0B Newsletter CT creation |
| 12 | `cherry/page-tracker` | PageTracker component (generic) only — NOT fiber-internet/youtube-tv pages | Nothing |

### Per cherry-pick agent protocol:
1. Create worktree from main
2. Cherry-pick specified commits
3. Run `bunx tsc --noEmit` — fix any type errors
4. Run `bun run build` — fix any build errors
5. Write/update tests for changed components
6. Best practices check: Contentful field naming, Next.js patterns, no invalid HTML
7. Report: "ready for visual review" or list of blockers

---

## Phase 2 — Net-New Work
**Runs in parallel across separate worktrees after Phase 1 groups 1-4 clear (no CT dependency).**

### 2A — Generic Dashboard (`feat/generic-dashboard`)
- Dashboard layouts are slot-driven: `top`/`middle`/`bottom` slots from Contentful
- Hardcoded shell copy is ok (e.g. "Welcome back, {name}") — 3 slots drive all content variation
- Metafi SaaS flavor: subscription/credit card product context
- Preview route: `/preview/dashboard/[entryId]`
- Seed 3 sample Metafi dashboard entries in master env

### 2B — Personas (`feat/personas`)
- 3 generic Metafi-named personas with Contentful tags `persona-a`, `persona-b`, `persona-c`
- Names: Alex (Growth Member), Sam (Pro Member), Jordan (Enterprise Lead)
- For each persona in Contentful: document click path, audience rule that fires, component(s) that swap
- Alex + Sam: similar click paths (tier upgrade journey)
- Jordan: divergent click path (enterprise/multi-seat)
- Persona switcher in nav reads from Settings.personas
- Future demos: update copy only, click paths documented

### 2C — Blog + Dynamic Content (`feat/blog-dynamic`)
Research sub-task first: agent reads how WordPress handles taxonomy archives (WP_Query, tax_query) and translates pattern to Contentful.

Then implement:
- `/blog` landing page — all posts, category/tag filter sidebar, faceted search
- `collectionPage` content type: 2 reference fields — `dynamicSection` + `filterSidebar`
- `dynamicSection` component: configurable pull (last N items by tag/category/taxonomy)
- Same pattern reusable for product listing page (future)
- Keep `blogPost` CT name (do not rename)
- Fast follow (separate future session): fake Shopify JSON → product listing

### 2D — TwoAcross Enhancements (`feat/two-across-icons`)
- Image size/fit dropdown on TwoAcross media field: cover / contain / icon (small, centered)
- So icons don't get forced to cover — supports logos, badges, small graphics
- Extends the cherry-pick from Group 8

### 2E — Env Guard (`feat/env-guard`)
- Pre-dev script: if `CONTENTFUL_ENVIRONMENT` ≠ `master` when running `bun dev` in main worktree, print loud warning
- Warn if `NEXT_PUBLIC_BRAND` is set to a prospect name
- Playwright smoke test after `bun dev`: hit `/page/home`, confirm no GraphQL 400

---

## Phase 3 — Demo Loop Library Extraction
**Runs in parallel with Phase 2. One agent, no worktree needed (read-only research + writes to demo-loops/).**

Agent goes through all 3 demo branches:
- `demo/bears` (or bears worktrees)
- `demo-punchbowl-2026-04`
- `demo/wow-personalization-2026-04`

For each demo, extract reusable loops and write structured entries to `demo-loops/[loop-name]/`:
- `README.md`: opp context (who is CARD/Punchbowl/WOW, why this loop was built)
- `demo-flow.md`: step-by-step narrative of what the demo shows
- `entries.md`: Contentful entry IDs + content types that powered it
- `click-path.md`: exact URL sequence + what personalizations fire at each step (if applicable)

Format must match existing `demo-loops/_schema.md`.

---

## Phase 4 — Quality Gates (ongoing, per branch)

### Regression Guardian
- After each branch merges: run Playwright suite on main
- Checks: all page slugs 200, no console errors, banner/hero render, NT SDK connects
- If any preview route breaks: block next merge, ping coordinator

### Best Practices Auditor
- Per cherry-pick: confirm Contentful field naming conventions, GraphQL fragment correctness, Next.js server/client split, no invalid HTML nesting
- Per net-new feature: confirm content type follows Contentful best practices

### Test Writer
- After each implementation: write tests for changed components
- Playwright: preview routes return 200, no 400 GraphQL errors
- Unit: component renders with mock data

---

## Open Items (separate future sessions)
- Section style app config screen (connect to any component, define affected fields)
- Fake Shopify JSON → product listing page
- `collectionPage` → product listing reuse

---

## Agent Team in tmux (metafi session)

```
Pane 1: Coordinator (this session — main branch)
Pane 2: Phase 0 CT Migration Agent
Pane 3: Phase 1 Cherry-pick Agent (sequential groups)
Pane 4: Phase 2 Implementation Agent (parallel features)
Pane 5: Phase 3 Demo Loop Extraction Agent
Pane 6: Phase 4 Regression/QA Agent
```
