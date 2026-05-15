# Handoff: GraphQL Two-Pass Architecture

**Branch:** `feat/graphql-two-pass`
**Worktree:** `/Users/casey.lisak/Dev/metafi-worktrees/feat-graphql-two-pass`
**Date:** 2026-05-15
**Status:** Active

---

## Why this branch exists

`PAGE_BY_SLUG` is a monolithic GraphQL query with 19 block inline fragments. Contentful enforces an 8,192-byte hard limit per query. We're at 7,134 bytes after manual trimming — roughly 2–4 new block types from the next crisis. The `*_PAGE_FIELDS` lean-fragment workaround is fragile and doesn't scale.

**Solution:** Two-pass page fetch architecture.
1. **Shell query** (~350 bytes): fetch page structure — section IDs and `__typename` only
2. **Parallel section fetches**: `Promise.all()` using the existing `*_BY_ID` fleet

Result: `PAGE_BY_SLUG` is eliminated. Each new block type costs 0 bytes on the page route. Full block data (including NT experiences) is available everywhere.

---

## Architecture

### Current flow
```
PAGE_BY_SLUG (7,134 bytes monolith)
  → all 19 block types as inline fragments
  → lean *_PAGE_FIELDS (no NT, stripped nested items)
  → page-content-live.tsx transforms + useLiveUpdates
```

### New flow
```
PAGE_SECTIONS_SHELL (~350 bytes)
  → { sections: [{ __typename, sys.id }] }

Promise.all([
  HERO_BY_ID(id1),
  FAQ_BY_ID(id2),
  PRICING_BY_ID(id3),
  ...
])
  → full section data (incl. ntExperiencesCollection per block)
  → page-content-live.tsx transforms + useLiveUpdates (unchanged)
```

---

## Files to change

### 1. `src/services/contentful/queries.ts`
- Add `PAGE_SECTIONS_SHELL` query (shell only — `__typename`, `sys { id }` per section, plus page-level `ntExperiencesCollection { items { __typename sys { id } } }`)
- Add `TWO_ACROSS_BY_ID` (currently missing from the BY_ID fleet — only block without one)
- Keep `PAGE_BY_SLUG` and `*_PAGE_FIELDS` — do NOT delete yet (keep as fallback, delete in follow-up)

### 2. `src/services/contentful/page.ts`
- Add `getPageBySlugTwoPass(slug, locale, preview)`:
  1. Fetch shell via `PAGE_SECTIONS_SHELL`
  2. For each section, call the appropriate `*_BY_ID` fetcher in `Promise.all`
  3. Return assembled sections in original order
- Keep `getPageBySlug` as-is for now
- Use a `SECTION_FETCHERS` lookup table (typename → fetcher function) — not a switch statement

### 3. `src/app/page/[slug]/page.tsx`
- Call `getPageBySlugTwoPass` instead of `getPageBySlug`
- Handle the new return shape

### 4. `src/app/page/[slug]/page-content-live.tsx`
- Verify `transformSection` handles BY_ID field shapes (not lean PAGE_FIELDS aliases)
- Key aliased fields in lean fragments that don't exist in BY_ID data:
  - Pricing: `titleRt: title { json }` → BY_ID has `title { json }` (no alias)
  - IconGrid, FeatureShowcase, MediaCardGrid, FeatureSection, IconFeatureGrid, NewsWrapper: same pattern
- The transform already uses `item.title ?? item.titleRt` fallbacks — verify these are correct
- No structural changes needed; data flows through unchanged

### 5. `src/block-renderer/types.ts`
- `*Fragment` types can now be the full versions (not lean) since BY_ID always returns full data
- Keep lean types for now to avoid a sweeping refactor — just verify no TypeScript errors

---

## SECTION_FETCHERS map

```ts
// src/services/contentful/page.ts
const SECTION_FETCHERS: Record<string, (
  id: string, locale: string, preview: boolean
) => Promise<unknown>> = {
  Hero:              (id, l, p) => fetchGraphQL(HERO_BY_ID, { id, locale: l, preview: p }, p).then(d => d?.heroCollection?.items?.[0] ?? null),
  Faq:               (id, l, p) => fetchGraphQL(FAQ_BY_ID, { id, locale: l, preview: p }, p).then(d => d?.faqCollection?.items?.[0] ?? null),
  Tabbedcontent:     (id, l, p) => fetchGraphQL(TABBED_CONTENT_BY_ID, ...).then(...),
  CardsWrapper:      (id, l, p) => fetchGraphQL(CARDS_WRAPPER_BY_ID, ...).then(...),
  DataViz:           (id, l, p) => fetchGraphQL(DATA_VIZ_BY_ID, ...).then(...),
  Banner:            (id, l, p) => fetchGraphQL(BANNER_BY_ID, ...).then(...),
  TwoAcross:         (id, l, p) => fetchGraphQL(TWO_ACROSS_BY_ID, ...).then(...),   // new query
  BlogPostsSection:  (id, l, p) => fetchGraphQL(BLOG_POSTS_SECTION_BY_ID, ...).then(...),
  CtaSection:        (id, l, p) => fetchGraphQL(CTA_SECTION_BY_ID, ...).then(...),
  Pricing:           (id, l, p) => fetchGraphQL(PRICING_BY_ID, ...).then(...),
  IconGrid:          (id, l, p) => fetchGraphQL(ICON_GRID_BY_ID, ...).then(...),
  FeatureShowcase:   (id, l, p) => fetchGraphQL(FEATURE_SHOWCASE_BY_ID, ...).then(...),
  MediaCardGrid:     (id, l, p) => fetchGraphQL(MEDIA_CARD_GRID_BY_ID, ...).then(...),
  IconFeatureGrid:   (id, l, p) => fetchGraphQL(ICON_FEATURE_GRID_BY_ID, ...).then(...),
  FeatureSection:    (id, l, p) => fetchGraphQL(FEATURE_SECTION_BY_ID, ...).then(...),
  Form:              (id, l, p) => fetchGraphQL(FORM_BY_ID, ...).then(...),
  ProductDetailPage: (id, l, p) => fetchGraphQL(PDP_BY_ID, ...).then(...),
  DynamicListing:    (id, l, p) => fetchGraphQL(DYNAMIC_LISTING_BY_ID, ...).then(...),
  ProductListing:    (id, l, p) => fetchGraphQL(PRODUCT_LISTING_BY_ID, ...).then(...),
  NewsWrapper:       (id, l, p) => fetchGraphQL(NEWS_WRAPPER_BY_ID, ...).then(...),
};
```

---

## Key invariants

1. **Section order must be preserved** — `Promise.all` preserves order; zip results back to shell section array by index
2. **Null sections are dropped** — if a BY_ID fetch returns null (deleted entry, permission error), filter it out gracefully
3. **`PAGE_SECTIONS_SHELL` is tiny** — should be under 300 bytes minified; no field data, just structure
4. **`TWO_ACROSS_BY_ID`** — needs to use `TWO_ACROSS_FIELDS` (full, with FORM_FIELDS nested), not the new `TWO_ACROSS_PAGE_FIELDS` lean variant
5. **Do NOT delete `PAGE_BY_SLUG`** — keep as dead code until migration is confirmed working in production
6. **transformSection aliases** — the transform reads both `item.title` and `item.titleRt`; BY_ID data uses `title` (no alias). Verify no breakage.

---

## TWO_ACROSS_BY_ID (new query to add)

```graphql
export const TWO_ACROSS_BY_ID = `
  query TwoAcrossById($id: String!, $locale: String!, $preview: Boolean) {
    twoAcrossCollection(where: { sys: { id: $id } }, locale: $locale, preview: $preview, limit: 1) {
      items {
        ${TWO_ACROSS_FIELDS}
      }
    }
  }
`;
```

---

## Definition of done

- [ ] `PAGE_SECTIONS_SHELL` query added
- [ ] `TWO_ACROSS_BY_ID` query added  
- [ ] `getPageBySlugTwoPass` implemented with `SECTION_FETCHERS` map
- [ ] `page.tsx` uses `getPageBySlugTwoPass`
- [ ] `/page/home?preview=true` renders correctly (0 errors)
- [ ] `/page/style-guide?preview=true` renders correctly (0 errors)
- [ ] `/page/products?preview=true` or equivalent PLP page renders correctly
- [ ] `bunx tsc --noEmit` — clean
- [ ] No `QUERY_TOO_BIG` errors
- [ ] Live preview still functions (field edits appear in iframe)
