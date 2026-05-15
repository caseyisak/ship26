# PLAN: productListing Section Block
**GH Issue:** caseyisak/metafi#86
**Branch:** `feat/plp-collections`
**Worktree:** `/Users/casey.lisak/Dev/metafi-worktrees/feat-plp-collections`

---

## Goal
Add a `productListing` section block to the dynamic `Page` content type. Editors compose PLP pages freely — hero + product grid, promo + grid, etc.

## Status
- ✅ M1 — GraphQL types, fragment, PageSection union (done in main CC session)
- ⬜ M2 — React component
- ⬜ M3 — Contentful content type + seed entry
- ⬜ M4 — Live preview route
- ⬜ M5 — Block renderer registration + smoke test

---

## Content Type: `Product Listing` (API ID: `productListing`)

| Field | ID | Type | Validation |
|---|---|---|---|
| Internal Name | `internalName` | Symbol | Required |
| Title | `titleRt` | RichText | — |
| Collection | `collection` | Symbol | `in` — categories from productCatalog |
| Columns | `columns` | Integer | `in` — [2, 3, 4] |
| Callout Cards | `calloutCards` | Array → Link → Entry (card) | limit 10 |

---

## Agent Assignments

### build — M2: React Component
1. Install: `bunx shadcn add @shadcnblocks/product-list10`
2. Create `src/cms-components/product-listing/product-listing.tsx`:
   - Props: `data: ProductListingFragment`, `productCatalog: ProductRecord[]`
   - Left sidebar: category switcher (default = `data.collection`), price buckets, in-stock toggle, tag checkboxes
   - Right: CSS grid `columns` wide, wraps on overflow
   - Callout cards inject every `columns` products
   - `useLiveUpdates(data)` + `useContentfulInspectorModeProps(data.sys.id)`
3. Create `src/cms-components/product-listing/index.ts`
4. Reference: `src/cms-components/cards-wrapper/cards-wrapper.tsx`

### mcp — M3: Contentful CT + Entry
1. Read Settings entry → extract unique categories from `productCatalog`
2. Create CT `Product Listing` with fields above
3. Publish CT
4. Create sample entry (collection: first category, columns: 3)
5. Add to a Page entry's sectionsCollection
- Space: `uumzxfocy3ef`, Env: `master`

### preview — M4: Live Preview Route
1. `src/services/contentful/product-listing.ts` — `getProductListingById()`
2. `src/app/preview/product-listing/[entryId]/page.tsx` — fetches listing + settings
3. Add `product-listing` to `src/app/api/enable-draft/route.ts`
4. Reference: `src/app/preview/dynamic-listing/[entryId]/page.tsx`

### qa — M5: Wire-up + Smoke Test
1. Register in `src/block-renderer/configs/index.ts`
2. Verify `productCatalog` flows from `getSettings()` → page → BlockRenderer → component
3. Smoke test: visit page with seed entry, confirm grid + filters + cards work
4. `bun test` must pass (39 pass expected)

---

## Data Flow
```
getSettings() → settings.productCatalog → page.tsx → BlockRenderer → ProductListing component
                settings.theme → CSS vars → :root (already injected)
```

## Key Files
- `src/block-renderer/types.ts` — ProductListingFragment (✅ done)
- `src/services/contentful/queries.ts` — PRODUCT_LISTING_PAGE_FIELDS, PRODUCT_LISTING_BY_ID (✅ done)
- `src/services/contentful/page.ts` — PageSection union (✅ done)
- `src/lib/integration-adapters/types.ts` — ProductRecord type
- `src/services/contentful/settings.ts` — productCatalog source

## Backlog — PLP Bug Fixes (next agent run)

These were identified after the first agent team run (2026-04-22). The team ran partially in plan mode and had no visual QA — these are the known issues to fix in the next properly-run agent loop.

- [ ] Fix race condition in catalog fetch (`src/cms-components/product-listing/product-listing.tsx` ~line 201) — change `[productCatalogProp]` dep to `[]` (mount-only) + add `cancelled` cleanup flag to prevent state update after unmount
- [ ] Add loading skeleton while catalog self-fetches — currently renders empty grid during fetch, should show skeleton
- [ ] Add code comment explaining self-fetch pattern — why `productCatalog` isn't server-passed on page routes (so future devs don't remove it); reference LL-027
- [ ] Verify `PageContentLive` transform case for `ProductListing` — confirm `calloutCardsCollection.items` shape is correctly handled in `transformSection()`
- [ ] Visual smoke test via Playwright: navigate to `/page/product-showcase` — confirm grid renders with products, filters work, no console errors

**Research baseline:** LL-026 (`documentation/lessons-learned/ll-026-agent-orchestration-pitfalls.md`) + LL-027 (`documentation/lessons-learned/ll-027-productcatalog-data-flow.md`) in the main repo explain the root causes. Research agent should read both before touching any code.

---

## Definition of Done
- [ ] CT created + published
- [ ] Grid renders with correct column count
- [ ] Left sidebar filters narrow results client-side
- [ ] Callout cards inject at correct positions
- [ ] Live preview: edit → grid updates
- [ ] /preview/product-listing/[entryId] works
- [ ] Theme colors apply
- [ ] `bun test` 39 pass (same as before)
