# FINDINGS: productListing Block — Research Baseline

**Date:** 2026-04-22  
**Branch:** `feat/plp-collections`  
**Research scope:** All milestones (M1–M5) + backlog bugs from PLAN.md

---

## 1. Milestone Status

| Milestone | Status | Notes |
|-----------|--------|-------|
| M1 — GraphQL types + fragment | ✅ Done | `ProductListingFragment` in `types.ts`; `PRODUCT_LISTING_PAGE_FIELDS` + `PRODUCT_LISTING_BY_ID` in `queries.ts`; union member in `page.ts` |
| M2 — React component | ✅ Done | `src/cms-components/product-listing/product-listing.tsx` + `index.ts` |
| M3 — Contentful CT + seed entry | ❓ Unknown | Cannot verify without Contentful MCP; agent team's MCP agent would have run this |
| M4 — Preview route | ✅ Done | `src/services/contentful/product-listing.ts`, `src/app/preview/product-listing/[entryId]/page.tsx`, `productListing` registered in `enable-draft/route.ts` |
| M5 — Block renderer registration | ✅ Done | `productListingConfig` registered in `src/block-renderer/configs/index.ts` at line 188–193, added to `blockConfigs` array at line 216 |

---

## 2. Data Flow — How `productCatalog` reaches the component

### Preview route (`/preview/product-listing/[entryId]`)
```
getProductListingById() + getSettings()
  → settings.productCatalog (ProductRecord[])
  → <BlockRenderer data={listing} productCatalog={productCatalog} />
  → Experience component spreads {...props} including productCatalog
  → ProductListing({ data, productCatalog })
```
`productCatalog` IS server-passed here. Component skips self-fetch.

### Page route (`/page/[slug]` e.g. `/page/product-showcase`)
```
getPageBySlug() → PageContentLive → transformSection('ProductListing')
  → <BlockRenderer data={section} />   ← NO productCatalog prop
  → ProductListing({ data, productCatalog: undefined })
  → useEffect fires → contentfulCatalogAdapter.getProducts() → setFetchedCatalog
```
`productCatalog` is NOT server-passed from the page route. Component self-fetches client-side via `contentfulCatalogAdapter`. This is intentional (same pattern as DynamicListing). The `getSettings()` call is never made in `page.tsx` — no `productCatalog` available server-side to thread through `PageContentLive`.

---

## 3. Bugs to Fix (from PLAN.md backlog)

### Bug 1 — Race condition in catalog self-fetch
**File:** `src/cms-components/product-listing/product-listing.tsx:201-204`

```ts
React.useEffect(() => {
  if (productCatalogProp !== undefined) return;
  contentfulCatalogAdapter.getProducts().then((all) => setFetchedCatalog(all));
}, [productCatalogProp]);  // ← BUG: dep should be []
```

**Problem:** `productCatalogProp` is `undefined` on the page route. On live preview, `useLiveUpdates(data)` triggers re-renders — every re-render with `productCatalogProp === undefined` re-triggers the effect (dep array re-evaluates to same `undefined`, but React still re-runs if the identity changes in some edge cases). More critically, there is no cleanup: if the component unmounts during the async `.then()`, `setFetchedCatalog` is called on an unmounted component → potential React state update warning.

**Fix:**
- Change dep array to `[]` (fetch only on mount)
- Add `let cancelled = false` flag + `return () => { cancelled = true }` cleanup
- Only call `setFetchedCatalog` if `!cancelled`

### Bug 2 — No loading skeleton during self-fetch
**File:** `src/cms-components/product-listing/product-listing.tsx:206`

```ts
const productCatalog = productCatalogProp ?? fetchedCatalog ?? [];
```

When `productCatalogProp` is `undefined` and `fetchedCatalog` is `null` (not yet fetched), `productCatalog` evaluates to `[]`. This renders an empty grid with "No products match the selected filters" immediately, then jumps to the real grid once the fetch completes.

**Fix:** Add a `fetching` boolean state. When `fetching === true`, render a skeleton grid (CSS grid, skeleton card placeholders) instead of the empty-grid fallback.

### Bug 3 — Missing code comment on self-fetch pattern
**File:** `src/cms-components/product-listing/product-listing.tsx:199-204`

No comment explaining why `productCatalog` isn't always server-passed. Future devs might try to remove the self-fetch and break the page route.

**Fix:** Add a comment like:
```ts
// productCatalog is only server-passed from the preview route.
// On page routes, PageContentLive renders BlockRenderer without it
// (getSettings() is not called in page.tsx). Self-fetch via the
// catalog adapter is the intended fallback — do not remove. See LL-027.
```

### Bug 4 — `PageContentLive` transform case for `ProductListing` (VERIFY ONLY)
**File:** `src/app/page/[slug]/page-content-live.tsx:336-346`

The transform at line 336 passes `calloutCardsCollection` through raw without mapping individual card shapes. This works because `PRODUCT_LISTING_PAGE_FIELDS` in `queries.ts` (line 918–932) uses `CARD_FIELDS` which already selects all `CardFragment` fields (`titleRt`, `descriptionRt`, `media`, `animationKey`, `mediaPlacement`, `sectionStyle`) with correct `__typename: 'Card'`.

**Assessment:** The transform is correct as-is. No code change needed — just confirm in smoke test that callout cards render.

### Bug 5 — Visual smoke test (Playwright)
Navigate to `/page/product-showcase` — confirm:
- Product grid renders (not empty)
- Left sidebar filters work (category, price, in-stock, tags)
- Callout cards inject at correct positions
- No console errors

---

## 4. Key File Map

| File | Purpose | Line(s) of interest |
|------|---------|---------------------|
| `src/cms-components/product-listing/product-listing.tsx` | Main component | 201-204 (race condition), 206 (empty-grid fallback) |
| `src/block-renderer/configs/index.ts` | Block registration | 188-193 (productListingConfig), 216 (blockConfigs array) |
| `src/block-renderer/types.ts` | Fragment type | 578-588 (ProductListingFragment) |
| `src/services/contentful/queries.ts` | GraphQL | 917-932 (PRODUCT_LISTING_PAGE_FIELDS), 1597-1609 (PRODUCT_LISTING_BY_ID) |
| `src/services/contentful/product-listing.ts` | Service | getProductListingById() — M4 |
| `src/app/preview/product-listing/[entryId]/page.tsx` | Preview page | Full M4 route |
| `src/app/api/enable-draft/route.ts` | Enable-draft | Line 45 (`productListing`), line 87 (route map) |
| `src/app/page/[slug]/page-content-live.tsx` | Transform | 336-346 (ProductListing case) |
| `src/app/page/[slug]/page.tsx` | Page route | Does NOT call getSettings() — no productCatalog server-side |
| `src/lib/integration-adapters/types.ts` | ProductRecord type | Full interface |

---

## 5. What's Missing / Unknown

- **M3 (Contentful CT + seed entry):** Cannot verify without Contentful MCP. If the CT doesn't exist in `master`, the page route will return no data for `ProductListing` typename. Need to check via MCP or Contentful UI.
- **LL-026 / LL-027 docs:** Not yet created. PLAN.md references them as lessons-learned files that explain agent orchestration pitfalls and productCatalog data flow — these should be written as part of post-implementation cleanup.
- **`/page/product-showcase` slug:** PLAN.md references this slug for smoke testing. Unknown whether a Page entry with this slug and a ProductListing section exists in Contentful.

---

## 6. Order of Fixes

1. Fix race condition + cleanup flag (Bug 1) — correctness, prevents memory leak
2. Add loading skeleton (Bug 2) — UX, prevents jarring empty→full jump  
3. Add code comment (Bug 3) — documentation, 2 lines
4. Verify `calloutCardsCollection` in smoke test (Bug 4) — no code change needed
5. Playwright smoke test on `/page/product-showcase` (Bug 5) — validation gate

Bugs 1–3 are in the same file and can be addressed in one pass.
