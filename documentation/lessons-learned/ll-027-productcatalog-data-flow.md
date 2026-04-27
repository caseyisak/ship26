# LL-027 — ProductCatalog Data Flow: Server vs. Client Fetch

## Symptom

`ProductListing` component renders an empty grid on `/page/[slug]` pages but works correctly in the preview route (`/preview/product-listing/[entryId]`). The `productCatalog` prop is always `undefined` on page routes, so no products appear.

## Root Cause

The `productCatalog` data lives in the `Settings` entry (`getSettings()` → `settings.productCatalog`). The preview route fetches it explicitly:

```ts
// ✅ preview route — works
const settings = await getSettings();
const productCatalog = settings?.productCatalog ?? [];
<BlockRenderer data={listing} productCatalog={productCatalog} />
```

But the main page route does NOT fetch settings, and can't easily do so for this component because:

1. `PageContentLive` is a **client component** (`'use client'`) — it cannot call `getSettings()` (server-only)
2. The main page route (`/page/[slug]/page.tsx`) passes only `page` to `PageContentLive`, no `productCatalog`
3. Even if `productCatalog` were passed as a prop to `BlockRenderer`, the NT `<Experience>` wrapper may not forward arbitrary props to the inner component

This means any component that needs Settings data beyond what's in the page GraphQL query faces the same challenge.

## Fix

**The self-fetch pattern is correct.** Components that need Settings data not available in the page GraphQL query should self-fetch it client-side via the integration adapter. This matches how `DynamicListing` works:

```ts
// ✅ ProductListing — self-fetch pattern (correct for page route)
const [fetchedCatalog, setFetchedCatalog] = React.useState<ProductRecord[]>([]);

React.useEffect(() => {
  if (productCatalogProp !== undefined) return; // skip if provided by preview route
  let cancelled = false;
  contentfulCatalogAdapter.getProducts().then((all) => {
    if (!cancelled) setFetchedCatalog(all);
  });
  return () => { cancelled = true; }; // cleanup flag prevents state update after unmount
}, []); // intentional empty deps — mount only

const productCatalog = productCatalogProp ?? fetchedCatalog;
```

**Add a loading state** — while the self-fetch is in progress, show a skeleton instead of an empty grid.

**Add a code comment** explaining why the self-fetch exists (so future devs don't "fix" it by removing it).

## Important Constraint

Never make `PageContentLive` a server component to solve this — it handles client-side interactivity (live preview, NT personalization). The self-fetch pattern is the right boundary.

## Why It Matters

Any new block that requires data from `getSettings()` (productCatalog, theme config, etc.) must use this self-fetch pattern when rendered on page routes. Preview routes can pass it server-side. Both paths should be handled.

## Prevention

When building a new component that needs non-page-query data:
1. Check if the data is available in `getSettings()` or another server-side source
2. If yes: preview route passes it server-side; component self-fetches as fallback
3. If no: consider adding it to the page GraphQL query or to `getSettings()`

## Seen In

- `feat/plp-collections` — ProductListing component (2026-04-22)

## Related Files

- `src/cms-components/product-listing/product-listing.tsx` — productCatalog self-fetch
- `src/cms-components/dynamic-listing/dynamic-listing.tsx` — reference: correct self-fetch pattern
- `src/app/preview/product-listing/[entryId]/page.tsx` — preview route (server-side path)
- `src/services/contentful/settings.ts` — `getSettings()` source
