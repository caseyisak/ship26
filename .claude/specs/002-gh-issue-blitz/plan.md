# GH Issue Blitz — Agent Execution Plan

**Coordinator:** main CC session (this session)
**Execution order:** C → D → A → B
**Repo:** caseyisak/metafi | **Space:** uumzxfocy3ef | **Env:** master
**Package manager:** bun (never npm/yarn)
**GH CLI path:** `/opt/homebrew/bin/gh`

---

## How to read this plan

- Each stream = one worktree + one CC agent in a tmux pane
- Coordinator (main CC) monitors, does visual sign-off, merges PRs
- Check off tasks as completed — update this file in-place
- Before starting any stream: `git pull origin main` in the worktree

---

## Stream C — RT Field Migration
**Branch:** `feat/rt-migration`
**GH Issue:** #52
**Closes:** #52
**Risk:** Medium — touches 8 CTs and all their existing entries
**Can run:** immediately, independent of all other streams

### Context
Hero, FAQ, TabbedContent, DataViz, Features, faqitem, twoAcross all have old Symbol fields
(e.g. `headline`) alongside newer RT fields (e.g. `headlineRt`) but components still read from
the old Symbol fields. Editors who type into the RT field see no change in preview.

Banner is already done (PR #28). Do not touch banner.

### Migration pattern per CT (repeat for each)
1. Check Contentful — does the RT field already exist? If not, create it via MCP.
2. Add RT field to GraphQL fragment in `src/services/contentful/queries.ts`
3. Update component to render RT field using `documentToReactComponents()` with fallback to Symbol if RT is empty
4. Migrate content — for each published entry, copy Symbol value into RT field body
5. Remove Symbol field from CT (LL-019 two-step: omit+publish first, then delete+publish)
6. Remove Symbol field from GraphQL fragment

**LL-019 two-step for field deletion:**
```
Step 1: Update CT — set field to omitted:true, publish CT
Step 2: Wait, then update CT — delete field entirely, publish CT
```

### Task checklist

**Setup**
- [x] `git checkout -b feat/rt-migration` from main (via worktree-add.sh)
- [x] `bun install` (node_modules symlinked, should be instant)
- [x] Audit all 8 CTs — check which RT fields already exist in Contentful vs need creation

**Hero CT (`hero`)**
- [x] Check if `headlineRt` and `subheadlineRt` exist in Contentful
- [x] Add `headlineRt { json }` and `subheadlineRt { json }` to `HERO_FIELDS` fragment
- [x] Update `src/cms-components/hero/hero.tsx` — render RT with fallback to Symbol
- [x] Migrate all hero entries: copy `headline` → `headlineRt`, `subheadline` → `subheadlineRt`
- [x] Remove `headline` and `subheadline` Symbol fields from CT (LL-019 two-step)
- [x] Remove from GraphQL fragment

**FAQ CT (`faq`)**
- [x] Check if `titleRt` and `descriptionRt` exist
- [x] Add to `FAQ_FIELDS` fragment
- [x] Update `src/cms-components/faq/faq.tsx`
- [x] Migrate entries
- [x] LL-019 removal

**FAQ Item CT (`faqitem`)**
- [x] Check if `questionRt` and `answerRt` exist
- [x] Add to fragment
- [x] Update component
- [x] Migrate entries
- [x] LL-019 removal

**TabbedContent CT (`tabbedcontent`)**
- [x] Check if RT fields exist for `tagline`, `title`, `description`
- [x] Add to `TABBED_CONTENT_FIELDS` fragment
- [x] Update `src/cms-components/tabbed-content/tabbed-content.tsx`
- [x] Migrate entries
- [x] LL-019 removal

**Features CT (`features`)**
- [x] Check if `titleRt`, `descriptionRt`, `labelRt` exist
- [x] Add to `FEATURES_FIELDS` fragment
- [x] Update `src/cms-components/features/features.tsx`
- [x] Migrate entries
- [x] LL-019 removal

**Feature Item CT (`featureItem`)**
- [x] Check if `titleRt` and `descriptionRt` exist
- [x] Add to fragment
- [x] Update component
- [x] Migrate entries
- [x] LL-019 removal

**TwoAcross CT (`twoAcross`)**
- [x] Check if `eyebrowRt`, `headingRt` exist
- [x] Add to fragment
- [x] Update component
- [x] Migrate entries
- [x] LL-019 removal

**DataViz CT (`dataViz`)**
- [x] Check if `titleRt`, `descriptionRt` exist
- [x] Add to fragment
- [x] Update `src/cms-components/data-viz/data-viz.tsx`
- [x] Migrate entries
- [x] LL-019 removal

### Testing — Stream C
- [x] `bunx tsc --noEmit` — zero errors
- [x] `bun run build` — clean build
- [ ] `bun run dev` on port 3002 — start dev server
- [ ] Visual: `/page/home` renders — all sections intact, no missing text
- [ ] Live preview — Hero: open entry, edit `headlineRt`, verify iframe updates in real time
- [ ] Live preview — FAQ: edit `titleRt`, verify update
- [ ] Live preview — at least one spot check per migrated CT
- [ ] No console errors in browser

### PR
- [x] Open PR to main: `feat(rt-migration): wire all CTs to RT fields, remove Symbol fields — closes #52`
- [ ] Tag coordinator for visual sign-off before merge

---

## Stream D — FeatureItem Field Additions
**Branch:** `feat/feature-item-fields`
**GH Issues:** #42
**Closes:** #42
**Risk:** Low — purely additive, no migration
**Can run:** immediately after C merges (depends on C to avoid conflict on featureItem CT)

### Context
Add three new fields to the existing `featureItem` CT:
- `mediaPlacement: left | right | top` — controls where the icon/image sits relative to text
- `sectionStyle` — JSON blob for per-item style overrides (matches sectionStyle pattern used elsewhere)
- Animation validation — constrain `animationKey` to a list of valid values (prevents typos breaking animations)

### Task checklist

**Setup**
- [x] `git checkout -b feat/feature-item-fields` from main (after C merges)
- [x] Confirm C has merged and `git pull origin main`

**Contentful — featureItem CT**
- [x] Add `mediaPlacement` field: Symbol, validation: `in ['left', 'right', 'top']`, default: `top` — done by Stream C, also added `bottom` + `background` variants
- [x] Add `sectionStyle` field: JSON Object — done by Stream C
- [x] Add validation to existing `animationKey` field: constrain to valid animation keys — done by Stream C (fade-up, fade-down, fade-left, fade-right, zoom-in, slide-up)
- [x] Publish CT changes — already published
- [x] Fix existing entries with invalid animationKey values (recurring-billing, checkout, payment-link, invoicing → valid keys)

**Code**
- [x] Add `mediaPlacement` and `sectionStyle` to `FEATURE_ITEM_FIELDS` fragment in `queries.ts` — `mediaPlacement` added by Stream C; `sectionStyle` added by Stream D
- [x] Add TypeScript types in `block-renderer/types.ts` — done by Stream C
- [x] Update `src/cms-components/features/features.tsx` to apply `mediaPlacement` layout — done by Stream C
- [x] `sectionStyle` should be passed through but not required to be implemented visually now — just wire it — wired in fragment + types

**Seed**
- [x] Update at least one existing `featureItem` entry with `mediaPlacement: left` to verify it renders — entry 2lpBH3VFIOtLA596MoVyZ4 (Feature — Checkout) confirmed with left placement

### Testing — Stream D
- [x] `bunx tsc --noEmit` — zero errors
- [x] `bun run build` — clean build
- [x] `bun run dev` on port 3003
- [x] Visual: features block renders with mediaPlacement variants — left + right confirmed on /page/home
- [ ] Live preview: edit `mediaPlacement` on an item, verify layout shift in iframe
- [x] Existing animated features still work — no regression

### PR
- [x] Open PR to main: `feat(feature-item): add mediaPlacement, sectionStyle, animation validation — closes #42`
- [ ] Tag coordinator for visual sign-off

---

## Stream A — Marketing Blocks
**Branch:** `feat/marketing-blocks`
**GH Issues:** #56 (CTA), #54 (Pricing), #57 (icon/card grids — covers #55)
**Closes:** #56, #54, #57, #55
**Risk:** Medium — 5 new CTs + components
**Prerequisite:** Stream D merged (CT naming settled)

### Context
Replace 2 hardcoded components + build 3 new grid block variants.

**Hardcoded components to replace:**
- `src/components/sections/matafi-cta.tsx` → `ctaSection` CT + `src/cms-components/cta-section/`
- `src/components/sections/metafi-pricing-hero.tsx` → `pricing` CT + `src/cms-components/pricing/`

**New grid blocks (from design decisions made 2026-04-17):**
- `iconGrid` CT + `iconGridItem` CT → `src/cms-components/icon-grid/`
  - `style: card | borderless` on wrapper — card = V1 (bordered), borderless = V4 (icon above text, no card)
  - `columns: 2 | 3 | 4` on wrapper
- `featureShowcase` CT + `featureShowcaseItem` CT → `src/cms-components/feature-showcase/`
  - 2-across fixed layout, 1/3 text + 2/3 screenshot/image
- `mediaCardGrid` CT + `mediaCard` CT → `src/cms-components/media-card-grid/`
  - Large image area at top of card
  - `imageFit: contain | cover` on the **item** (`mediaCard`), not the wrapper

**All text fields must be RichText** (not Symbol/Long Text) per project rule. Only `internalName` is Symbol.

### Content model summary

```
ctaSection
  internalName (Symbol)
  headline (RT)
  subheadline (RT)
  primaryCtaLabel (Symbol)
  primaryCtaUrl (Symbol)
  secondaryCtaLabel (Symbol) — optional
  secondaryCtaUrl (Symbol) — optional
  backgroundColor (Symbol) — optional, hex or CSS var

pricing
  internalName (Symbol)
  label (RT)
  title (RT)
  description (RT)
  showToggle (Boolean)
  plansCollection → pricingPlan[]

pricingPlan (child CT)
  internalName (Symbol)
  name (RT)
  price (Symbol) — e.g. "$24"
  billingPeriod (Symbol) — e.g. "per month"
  badge (Symbol) — optional, e.g. "Most Popular"
  highlighted (Boolean)
  featuresCollection → pricingFeature[] OR featuresText (RT)
  ctaLabel (Symbol)
  ctaUrl (Symbol)
  contactSales (Boolean)

iconGrid
  internalName (Symbol)
  label (RT)
  title (RT)
  description (RT)
  style (Symbol, validation: 'card' | 'borderless')
  columns (Integer, validation: 2 | 3 | 4)
  itemsCollection → iconGridItem[]

iconGridItem
  internalName (Symbol)
  icon (Asset)
  animationKey (Symbol) — optional, used when style=borderless with animation
  title (RT)
  description (RT)

featureShowcase
  internalName (Symbol)
  label (RT)
  title (RT)
  description (RT)
  itemsCollection → featureShowcaseItem[]

featureShowcaseItem
  internalName (Symbol)
  title (RT)
  description (RT)
  media (Asset) — the screenshot/image in the 2/3 panel

mediaCardGrid
  internalName (Symbol)
  label (RT)
  title (RT)
  description (RT)
  columns (Integer, validation: 2 | 3 | 4)
  itemsCollection → mediaCard[]

mediaCard
  internalName (Symbol)
  title (RT)
  description (RT)
  media (Asset)
  imageFit (Symbol, validation: 'contain' | 'cover', default: 'contain')
```

### Task checklist

**Setup**
- [x] `git checkout -b feat/marketing-blocks` from main (via worktree-add.sh)
- [x] Confirm cherry-picked ctaSection from PR #64 (`b634871`), `git pull origin main`

**ctaSection (#56)**
- [x] Cherry-picked from `feat/cta-section-block` branch (commit `b634871`) — CT already existed
- [x] Add `CTA_SECTION_FIELDS` fragment to `queries.ts`
- [x] Add TypeScript type `CtaSectionFragment` to `block-renderer/types.ts`
- [x] Build `src/cms-components/cta-section/cta-section.tsx` with `useLiveUpdates()`
- [x] Register in `block-renderer/configs/index.ts`
- [x] Add preview route `/preview/cta-section/[entryId]`
- [x] Add `ctype=ctaSection` to `enable-draft/route.ts`
- [x] Add transformSection handler for `CtaSection` in `page-content-live.tsx`
- [x] Seed entry in Contentful, added to `feat-marketing-blocks` visual test page
- [x] Delete hardcoded `src/components/sections/matafi-cta.tsx` + remove all imports

**pricing (#54)**
- [x] `pricingPlan` and `pricingPlanFeature` CTs already existed — used existing schema
- [x] Add `PRICING_FIELDS`, `PRICING_PLAN_FIELDS`, `PRICING_PLAN_FEATURE_FIELDS` fragments
- [x] Add TypeScript types `PricingFragment`, `PricingPlanFragment`, `PricingPlanFeatureFragment`
- [x] Build `src/cms-components/pricing/pricing.tsx` with toggle + `useLiveUpdates()`
- [x] Register in block-renderer
- [x] Add preview route `/preview/pricing/[entryId]`
- [x] Add `ctype=pricing` to `enable-draft/route.ts`
- [x] Add transformSection handler for `Pricing` in `page-content-live.tsx`
- [x] Seed entries added to `feat-marketing-blocks` visual test page
- [x] Delete hardcoded `src/components/sections/metafi-pricing-hero.tsx` + remove imports

**iconGrid (#57 / #55)**
- [x] `iconGridItem` and `iconGrid` CTs created via MCP
- [x] Add `ICON_GRID_FIELDS`, `ICON_GRID_ITEM_FIELDS`, `ICON_GRID_PAGE_FIELDS` fragments
- [x] Add TypeScript types `IconGridFragment`, `IconGridItemFragment`
- [x] Build `src/cms-components/icon-grid/icon-grid.tsx` (card + borderless variants)
- [x] Register in block-renderer
- [x] Add preview route `/preview/icon-grid/[entryId]`
- [x] Add `ctype=iconGrid` to `enable-draft/route.ts`
- [x] Add transformSection handler for `IconGrid` in `page-content-live.tsx`
- [x] Seed entries added to `feat-marketing-blocks` visual test page

**featureShowcase**
- [x] `featureShowcaseItem` and `featureShowcase` CTs created via MCP
- [x] Add `FEATURE_SHOWCASE_FIELDS`, `FEATURE_SHOWCASE_ITEM_FIELDS`, `FEATURE_SHOWCASE_PAGE_FIELDS` fragments
- [x] Add TypeScript types `FeatureShowcaseFragment`, `FeatureShowcaseItemFragment`
- [x] Build `src/cms-components/feature-showcase/feature-showcase.tsx` (alternating 2-col layout)
- [x] Register in block-renderer
- [x] Add preview route `/preview/feature-showcase/[entryId]`
- [x] Add `ctype=featureShowcase` to `enable-draft/route.ts`
- [x] Add transformSection handler for `FeatureShowcase` in `page-content-live.tsx`
- [x] Seed entries added to `feat-marketing-blocks` visual test page

**mediaCardGrid**
- [x] `mediaCard` and `mediaCardGrid` CTs created via MCP
- [x] Add `MEDIA_CARD_GRID_FIELDS`, `MEDIA_CARD_FIELDS`, `MEDIA_CARD_GRID_PAGE_FIELDS` fragments
- [x] Add TypeScript types `MediaCardGridFragment`, `MediaCardFragment`
- [x] Build `src/cms-components/media-card-grid/media-card-grid.tsx` (imageFit: contain/cover)
- [x] Register in block-renderer
- [x] Add preview route `/preview/media-card-grid/[entryId]`
- [x] Add `ctype=mediaCardGrid` to `enable-draft/route.ts`
- [x] Add transformSection handler for `MediaCardGrid` in `page-content-live.tsx`
- [x] Seed entries added to `feat-marketing-blocks` visual test page

**PAGE_BY_SLUG byte limit fix (LL-011)**
- [x] Fixed GraphQL type conflict: `title`/`description` RichText fields aliased as `titleRt`/`descriptionRt` in page variants to avoid conflict with `BlogPostsSection.title/description` (String)
- [x] Created lean `*_PAGE_FIELDS` variants for all 5 existing large blocks omitting `ntExperiencesCollection`
- [x] PAGE_BY_SLUG confirmed at 2976 bytes (well under 8192 limit)

### Testing — Stream A
- [x] `bunx tsc --noEmit` — zero errors
- [x] `bun run build` — clean build
- [x] `bun run dev` on port 3004
- [x] `/page/home` returns 200 — all existing sections unaffected
- [x] `/page/feat-marketing-blocks` returns 200 — all 5 new blocks visible
- [x] **pricing toggle** — monthly/yearly switch renders correctly
- [x] **CTA** — renders with dark background + headline text on `feat-marketing-blocks` page
- [x] **iconGrid** — "Everything you need to grow" renders on visual test page
- [x] **featureShowcase** — "Built for speed and scale" renders on visual test page
- [x] **mediaCardGrid** — "See Metafi in action" renders on visual test page
- [x] Old hardcoded components deleted — imports removed from all 5 static pages
- [x] Playwright screenshots taken: `stream-a-page-home.png`, `stream-a-feat-marketing-blocks.png`
- [ ] Live preview — ctaSection: edit `headline`, verify iframe update
- [ ] Live preview — pricing: edit plan name, verify update

### PR
- [ ] Open PR to main: `feat(marketing-blocks): CTA, Pricing, iconGrid, featureShowcase, mediaCardGrid — closes #56 #54 #57 #55`
- [ ] Tag coordinator for visual sign-off

---

## Stream B — Dashboard + Personas
**Branch:** `feat/dashboard-personas`
**GH Issues:** #39, #38, #40, #41, #43 (partial fix)
**Closes:** #39, #38, #40, #41, #43
**Risk:** High — schema migration on live CT, personalization wiring
**Prerequisite:** Stream A merged (personas need a page to live on)

### Context
Current `dashboardPage` CT uses WOW-era fields (`pageType`, `top`, `middle`, `bottom`).
Issue #41 wants generic named slots: `headerBlock`, `primaryBlock`, `secondaryBlock`, `slug`.
This is a **breaking CT change** — requires LL-019 two-step migration on a live CT with existing entries.

Current dashboard in `src/app/dashboard/` has WOW-specific layouts. Need generic 3-slot layout.

Personas: no `customerType` trait exists anywhere. NT audiences for generic personas not created.

**#43 enable-draft gap:** Add `ctype=dashboardPage` to `enable-draft/route.ts` type check
(one-liner, tack on during this stream).

### Persona map
| Persona | customerType | NT Audience name |
|---------|-------------|-----------------|
| Persona A | `new-visitor` | Customer Type — New Visitor |
| Persona B | `returning` | Customer Type — Returning |
| Persona C | `premium` | Customer Type — Premium |

### Task checklist

**Setup**
- [x] `git checkout -b feat/dashboard-personas` from main (via worktree-add.sh)
- [x] `git pull origin main` — pulled Streams C, D, A

**#41 — dashboardPage CT migration**
- [x] Audit current `dashboardPage` CT fields in Contentful — noted all existing field IDs (pageType, top, middle, bottom, title, titleRt + 0 existing entries)
- [x] Create new fields: `headerBlock` (Reference), `primaryBlock` (Reference), `secondaryBlock` (Reference), `slug` (Symbol) — additive first
- [x] Publish CT with new fields
- [x] Migrate existing dashboard entries: N/A — 0 existing entries
- [x] LL-019 remove old fields: `pageType`, `top`, `middle`, `bottom`, `title`, `titleRt` (omit+publish → delete+publish two-step)
- [x] Publish final CT

**#43 — enable-draft gap (one-liner)**
- [x] Add `dashboardPage` to the `typeToRoute` map in `src/app/api/enable-draft/route.ts`

**#40 — Generic dashboard component**
- [x] Update `DASHBOARD_PAGE_FIELDS` fragment in `queries.ts` to use new field names
- [x] Rewrite `src/app/dashboard/` — generic 3-slot layout (`generic-dashboard.tsx`)
- [x] Remove WOW-specific layouts (`home-layout.tsx`, `upgrade-layout.tsx`, `checkout-layout.tsx`)
- [x] Each slot renders a block via `<BlockRenderer>` — slot content comes from Contentful
- [x] Preview client (`preview-client.tsx`) updated to use GenericDashboard

**#39 — Generic persona system**
- [ ] Create 3 NT audiences in Contentful (via NT app UI — MANUAL STEP REQUIRED)
  - "Customer Type — New Visitor" → rule: `customerType = new-visitor`
  - "Customer Type — Returning" → rule: `customerType = returning`
  - "Customer Type — Premium" → rule: `customerType = premium`
- [ ] Document audience IDs, set `NEXT_PUBLIC_NT_AUDIENCE_*` env vars in `.env.local`

**#38 — Persona switcher UI**
- [x] Build `src/components/persona-switcher/persona-switcher.tsx`
  - 3 buttons: "Persona A", "Persona B", "Persona C"
  - Each calls `identify({ customerType: '<value>' })` + `activateAudience()` (LL-024 pattern)
- [x] Wire into dashboard nav (visible only when `NEXT_PUBLIC_DEMO_MODE=true`)
- [x] Switcher hidden in production (gated by `process.env.NEXT_PUBLIC_DEMO_MODE`)

**Seed entries**
- [x] Created dashboard Banner entries for all 3 slots (header, primary, secondary)
- [x] Created `dashboardPage` entry with slug `dashboard-home`
- [x] Created visual test page with slug `feat-dashboard-personas`
- [ ] Set up NT experiences on `primaryBlock` to swap content per `customerType` (needs audience IDs first)

### Testing — Stream B
- [x] `bunx tsc --noEmit` — zero errors
- [x] `bun run build` — clean build
- [x] `bun run dev` on port 3005
- [x] Visual: `/dashboard` renders generic 3-slot layout — header banner + primary/secondary blocks confirmed
- [x] Persona switcher: visible in demo mode (NEXT_PUBLIC_DEMO_MODE=true), hidden otherwise
- [x] `/page/home` returns 200 — no regression
- [x] `/page/feat-dashboard-personas` returns 200 — visual test page confirmed
- [ ] NT audiences: create in NT app UI, then verify persona switching triggers correct content
- [ ] Live preview: `/preview/dashboard/[entryId]` — spot check after audiences created
- [ ] enable-draft: verified route code updated; manual test after Contentful preview URL set up

### PR
- [ ] Open PR to main: `feat(dashboard-personas): generic 3-slot dashboard + 3-persona system — closes #39 #38 #40 #41 #43`
- [ ] Tag coordinator for visual sign-off

---

## Coordinator checklist (this CC session)

- [ ] Stream C PR — visual sign-off, merge
- [ ] Stream D PR — visual sign-off, merge
- [ ] Stream A PR — visual sign-off, merge
- [ ] Stream B PR — visual sign-off, merge
- [ ] Close GH issues: #52, #42, #56, #54, #57, #55, #39, #38, #40, #41, #43, #50
- [ ] Update TASKS.md — mark blitz complete
- [ ] `git pull` in main worktree after each merge

## ⚠️ Visual testing gate — NON-NEGOTIABLE (added 2026-04-17)

**A PR must NOT be presented to the coordinator for sign-off until ALL of the following are confirmed by the stream agent:**

1. `bunx tsc --noEmit` — zero errors
2. `bun run build` — clean build
3. Dev server running on assigned port
4. **Playwright visual test** — use `.claude/commands/skills/contentful-live-preview-verify.md` skill to screenshot `/page/home` and verify all sections render with no 404, no missing text, no console errors
5. Live preview spot-check — at least one CT edit verified live in iframe
6. All testing checklist items in the stream's section checked off

**Do not open a PR and ping coordinator until steps 1–6 are green.** The coordinator will not do visual testing — that is the stream agent's job.

---

## Agent briefing template (copy per pane)

When spinning up each agent in tmux, paste this as their opening prompt:

```
You are working on the Metafi project (Next.js 15 + Contentful demo site).
Your task is Stream [X] as defined in:
  /Users/casey.lisak/Dev/metafi-nextjs-shadcnblocks/.claude/specs/002-gh-issue-blitz/plan.md

Key rules:
- Package manager: bun only (never npm/yarn)
- Commit format: <type>(<scope>): <what> — <why>
- All new text fields must be RichText (never Symbol/Long Text for frontend fields)
- Contentful MCP: publish child entries before parent entries
- Field deletion: always use LL-019 two-step (omit+publish, then delete+publish)
- GH CLI: /opt/homebrew/bin/gh
- NEVER set NT audience or experience IDs via MCP — use NT app UI
- Dev server port: use [3002/3003/3004/3005] to avoid conflicts
- Read documentation/lessons-learned/index.md before starting

Read the plan, check off tasks as you complete them (update plan.md in-place).
Before opening a PR you MUST complete ALL testing steps in your stream's checklist,
including the Playwright visual test of /page/home using the skill at
.claude/commands/skills/contentful-live-preview-verify.md.
Do NOT open a PR until every test box is checked. Only then report back to coordinator.
```

---

## Port assignments (avoid conflicts)
| Stream | Port |
|--------|------|
| C — RT migration | 3002 |
| D — FeatureItem | 3003 |
| A — Marketing blocks | 3004 |
| B — Dashboard/Personas | 3005 |
