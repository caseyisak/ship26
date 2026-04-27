# Handoff — Newsletter Rendering Fixes + leadStory Consolidation
**Branch:** `fix/newsletter-promo-slot`
**Worktree:** `/Users/casey.lisak/Dev/metafi-worktrees/fix-newsletter-promo-slot`
**Created:** 2026-04-27
**Deadline:** Before Punchbowl demo (week of 2026-04-28)
**GitHub issues:** caseyisak/metafi#88, #89, #90

---

## Why this branch exists

Newsletter rendering is broken in production. Any newsletter entry that uses a Hero, Banner, or TwoAcross (in either the RTE body or the promoSlot) renders completely blank headlines and text. Root cause: the RT field migration in v2.5 renamed fields (`headline` → `headlineRt`, `eyebrow` → `eyebrowRt`, etc.) but `newsletter-page.tsx` was never updated to read the RT versions.

Additionally, the newsletter has its own bespoke styling that doesn't match the sandbox design tokens (Hero, CTA, Banner use CSS vars; newsletter uses hardcoded values). This matters for Punchbowl: brand tokens injected via siteSettings will apply to all other blocks but skip the newsletter unless it uses the same vars.

---

## Read these first (in order)

1. `.claude/specs/003-newsletter-fixes/spec.md` — full spec with 8 ordered tasks, design constraints, and verification criteria
2. `src/cms-components/newsletter/newsletter-page.tsx` — where all 5 rendering bugs are
3. `src/services/contentful/newsletter.ts` — types + GraphQL query (duplicate property is here)
4. `src/cms-components/banner/banner.tsx` — reference for how Banner renders with sandbox tokens
5. `src/cms-components/hero/hero.tsx` — reference for Hero rendering patterns

---

## The bugs (confirmed, line numbers current as of 2026-04-27)

| Bug | File | Lines | Problem | Fix |
|-----|------|-------|---------|-----|
| TypeScript duplicate | newsletter.ts | 33–35 | `headlineRt`/`subheadlineRt` declared twice in `EmbeddedEntry` | Remove second declaration |
| Hero embed blank | newsletter-page.tsx | 95–102 | Reads `entry.headline`/`entry.subheadline` (null) | Render `entry.headlineRt?.json` via `documentToReactComponents` |
| Banner embed blank | newsletter-page.tsx | 133–140 | Same as Hero | Same fix |
| TwoAcross embed blank | newsletter-page.tsx | 179–186 | Reads `entry.eyebrow`/`entry.heading` (null) | Render `entry.eyebrowRt?.json`/`entry.headingRt?.json` |
| promoSlot Banner blank | newsletter-page.tsx | 475–509 | Reads `promoSlot.headline`/`promoSlot.eyebrow` (null) | Render RT versions |

---

## The design consolidation

- Remove the `leadStory` rendering block (lines 362–401) — it only handles BlogPost
- When `promoSlot.__typename === 'BlogPost'`, render it in the lead story position (above content, `border-tagline` accent, "Lead Story" label)
- Remove `leadStory` from GraphQL fragment, types, and mapper in `newsletter.ts`
- Remove `leadStory` field from Newsletter CT in Contentful via MCP (`mcp__contentful__update_content_type`)

---

## Style normalization requirement

After fixing the RT rendering, audit every hardcoded color/border/shadow in the embedded renderers and replace with sandbox CSS vars:

| Currently | Should be |
|-----------|-----------|
| `bg-primary` (correct) | keep |
| `border-tagline` (custom) | `border-primary` or `border-border` |
| `rounded-none` (custom) | match pattern from cms-components/banner |
| Hardcoded `text-white` | `text-primary-foreground` |
| Custom shadow strings | `shadow-sm` or none |

Reference: `cms-components/banner/banner.tsx` and `cms-components/cta-section/` for the correct token usage patterns.

---

## Ordered implementation steps

Follow the spec tasks in order:
1. Fix TypeScript duplicate (newsletter.ts)
2. Fix Hero embed in RTE (newsletter-page.tsx lines 95–102)
3. Fix Banner embed in RTE (newsletter-page.tsx lines 133–140)
4. Fix TwoAcross embed in RTE (newsletter-page.tsx lines 179–186)
5. Fix promoSlot Banner + TwoAcross renderers
6. Consolidate leadStory → promoSlot (code + CT removal via MCP)
7. Normalize all embedded block styles to sandbox tokens
8. `bunx tsc --noEmit` + `bun run build` + Playwright screenshot of `/preview/newsletter/[entryId]`

---

## Verification

Open the newsletter entry in Contentful live preview:
- Entry: `5Mz2lajCrmnmnDE7O99vvI` (the newsletter with promoSlot + embedded entries)
- Preview URL pattern: `/preview/newsletter/[entryId]`
- Check: promoSlot renders with visible text, embedded Hero/Banner/TwoAcross in content body show headlines, no blank sections

---

## When done

1. Open PR against `main` — reference #88, #89, #90
2. Add one line to TASKS.md moving the newsletter project to ✅ Completed
3. This branch is `sandbox/v4.1` — the main CC will tag after merge
