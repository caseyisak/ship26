# Spec: Newsletter Rendering Fixes + leadStory Consolidation
**Feature:** `003-newsletter-fixes`
**Type:** Bug fix + content model simplification
**Branch:** `fix/newsletter-promo-slot` (worktree off main)
**Status:** Ready to execute
**Sandbox version target:** v4.1

---

## Problem

The newsletter block is broken in three ways, all stemming from the RT field migration that landed in v2.5:

1. **promoSlot Banner and TwoAcross render blank** — the component reads plain text fields (`headline`, `eyebrow`, `heading`) that no longer exist in the GraphQL response. After the RT migration, the query fetches `headlineRt { json }`, `eyebrowRt { json }`, `headingRt { json }` but the renderer never got updated.

2. **Hero and Banner blocks embedded in the newsletter RTE body also render blank** — same root cause. The `buildRichTextOptions` embedded entry renderer still reads the old plain text field names.

3. **TypeScript compile error** — `headlineRt` and `subheadlineRt` are declared twice in the `EmbeddedEntry` type in `newsletter.ts`, once under "Hero + Banner RT fields" and again under "Banner RT fields".

Additionally, the current design has two separate concepts — `leadStory` (BlogPost only, above content) and `promoSlot` (BlogPost/TwoAcross/Banner, below content) — that are semantically redundant. Consolidating into a single `promoSlot` that accepts Banner or BlogPost simplifies the CT and the component.

---

## Why it matters for Punchbowl

Punchbowl demo is scheduled for the week of 2026-04-28. The newsletter block is part of the Punchbowl demo story. The Punchbowl Contentful env will be pointed at current main code — these bugs will surface live during the demo if not fixed first.

---

## User story

**As** a demo runner setting up the newsletter preview for a prospect,
**I want** the promoSlot and embedded Hero/Banner blocks to render correctly,
**So that** the newsletter live preview is usable and demo-ready without blank sections.

---

## What "done" looks like

1. `promoSlot` renders correctly for all three types: BlogPost, TwoAcross, Banner
2. Hero and Banner entries embedded in the newsletter RTE body render with their headline/subheadline text
3. TypeScript compiles cleanly — no duplicate property errors in `EmbeddedEntry`
4. `leadStory` field is removed from the rendered layout; `promoSlot` handles both BlogPost (lead story position, above content) and Banner/TwoAcross (promo position, below content)
5. Newsletter Contentful CT: `leadStory` field deprecated/removed (or left as hidden field if entries still reference it)
6. `bun run build` passes, `bunx tsc --noEmit` clean
7. Preview route `/preview/newsletter/[entryId]` renders correctly in Contentful live preview

---

## Design constraint — generic sandbox styling

The newsletter embedded block renderers (Hero, Banner, TwoAcross, BlogPost) must use the **same design tokens and visual patterns as the rest of the sandbox** — not custom newsletter-specific styles.

Current state: `newsletter-page.tsx` has bespoke styles like `border-tagline`, `bg-primary`, `text-primary-foreground/80`, hardcoded `w-48`, `rounded-none`, custom shadow treatments. These don't match how Hero, CTA, and Banner look on actual pages.

Required: When a Hero, Banner, or TwoAcross is embedded in a newsletter, it should look like a compact version of how those blocks appear in the sandbox — using the same CSS vars (`--primary`, `--foreground`, `--muted`, etc.) and Tailwind patterns already established in `cms-components/hero/`, `cms-components/banner/`, `cms-components/cta-section/`. No custom palette.

This is also the right foundation for Punchbowl — when brand tokens are injected via siteSettings, the newsletter should inherit them automatically because it uses the same vars.

---

## Scope

### In scope
- `src/services/contentful/newsletter.ts` — fix duplicate TypeScript properties
- `src/cms-components/newsletter/newsletter-page.tsx` — fix RT field rendering; consolidate leadStory into promoSlot; normalize embedded block styles to match sandbox design tokens
- Contentful CT: remove `leadStory` field from Newsletter CT (via MCP or manual)

### Out of scope
- New newsletter layout variants
- Punchbowl brand theming (separate worktree)

---

## Implementation tasks

### Task 1 — Fix TypeScript duplicate (newsletter.ts)
**File:** `src/services/contentful/newsletter.ts`
**Change:** Remove the duplicate `headlineRt` and `subheadlineRt` declarations under `// Banner RT fields` (lines 33–35). Keep only the ones under `// Hero + Banner RT fields`.

### Task 2 — Fix promoSlot Banner renderer (newsletter-page.tsx)
**File:** `src/cms-components/newsletter/newsletter-page.tsx` lines 497–524
**Change:** Replace `promoSlot.headline` and `promoSlot.subheadline` with `documentToReactComponents(promoSlot.headlineRt.json)` / `documentToReactComponents(promoSlot.subheadlineRt.json)`. Same pattern already used elsewhere in this file.

### Task 3 — Fix promoSlot TwoAcross renderer (newsletter-page.tsx)
**File:** `src/cms-components/newsletter/newsletter-page.tsx` lines 459–496
**Change:** Replace `promoSlot.eyebrow` with RT rendering of `promoSlot.eyebrowRt.json` and `promoSlot.heading` with `promoSlot.headingRt.json`.

### Task 4 — Fix embedded Hero renderer in RTE (newsletter-page.tsx)
**File:** `src/cms-components/newsletter/newsletter-page.tsx` lines 78–125
**Change:** Replace `entry.headline` / `entry.subheadline` with RT rendering of `entry.headlineRt?.json` / `entry.subheadlineRt?.json`.

### Task 5 — Fix embedded Banner renderer in RTE (newsletter-page.tsx)
**File:** `src/cms-components/newsletter/newsletter-page.tsx` lines 127–155
**Change:** Same as Task 4 — replace plain text fields with RT rendering.

### Task 6 — Consolidate leadStory → promoSlot
**Files:** `newsletter-page.tsx`, `newsletter.ts`
**Change:**
- Remove the `leadStory` rendering block (lines 362–401) from `newsletter-page.tsx`
- When `promoSlot.__typename === 'BlogPost'`, render in the current `leadStory` position (above content, with `border-tagline` accent and "Lead Story" label)
- Remove `leadStory` from `Newsletter` type, `RawNewsletter` type, `mapNewsletter`, and `NEWSLETTER_FIELDS` GraphQL fragment
- Contentful CT: archive/remove `leadStory` field from Newsletter CT via MCP

### Task 7 — Normalize embedded block styles to sandbox tokens
**File:** `src/cms-components/newsletter/newsletter-page.tsx`
**Change:** Audit every hardcoded color, border, shadow, and spacing in the embedded entry renderers (Hero, Banner, TwoAcross, BlogPost in both RTE body and promoSlot). Replace custom values with the sandbox CSS vars already used by `cms-components/hero/`, `cms-components/banner/`, `cms-components/cta-section/`:
- Backgrounds: `bg-card`, `bg-muted`, `bg-primary` with appropriate foreground vars
- Borders: `border-border` (not hardcoded colors)
- Text: `text-foreground`, `text-muted-foreground`, `text-primary-foreground` — never hardcoded hex
- No unique `border-tagline` treatments that don't exist elsewhere in the sandbox
- Result: when siteSettings injects brand tokens, newsletter inherits them automatically

### Task 8 — Verify and commit
- `bunx tsc --noEmit` — must pass clean
- `bun run build` — must pass
- Open `/preview/newsletter/[entryId]` in browser with Playwright, screenshot all promoSlot types rendering (BlogPost, Banner, TwoAcross)
- Visually confirm embedded blocks use sandbox token colors (no hardcoded custom palette)

---

## Related files

| File | Role |
|------|------|
| `src/services/contentful/newsletter.ts` | GraphQL query + types |
| `src/cms-components/newsletter/newsletter-page.tsx` | Main render component |
| `src/app/preview/newsletter/[entryId]/page.tsx` | Preview route |
| `documentation/lessons-learned/contentful-field-type-change.md` | RT field migration pattern |

---

## GitHub issues

- caseyisak/metafi#88 — RT field mismatch (Hero/Banner/TwoAcross embeds blank)
- caseyisak/metafi#89 — TypeScript duplicate headlineRt property
- caseyisak/metafi#90 — leadStory consolidation + style normalization
