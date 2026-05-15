# transformSection whitelist silently drops new fields

## Symptom

A new field added to a Contentful CT and GraphQL query renders correctly on one page type but not another. The GraphQL preview API returns the correct value. `sectionBgClass` / component logic looks right. But the rendered class is always the default (e.g. `bg-background` instead of `bg-foreground`).

## Root cause

`page-content-live.tsx` contains `transformSection()` — a function that **explicitly reconstructs** every block type field-by-field before passing data to `BlockRenderer`. It is a whitelist, not a passthrough.

Any field not listed inside the relevant `if (item.__typename === 'X')` block is silently discarded. The component receives `undefined` / `null` for the field even though the GraphQL response included it.

```typescript
// transformSection — CardsWrapper branch (before fix)
if (item.__typename === 'CardsWrapper') {
  return {
    __typename: 'CardsWrapper',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    labelRt: item.labelRt ?? null,
    titleRt: item.titleRt ?? null,
    descriptionRt: item.descriptionRt ?? null,
    // ← backgroundColor missing! silently dropped
    itemsCollection: ...
  };
}
```

## Why some pages work and others don't

Pages that bypass `transformSection` (e.g. PLP `DynamicListing` / `ProductListing` callout cards) pass raw GraphQL data directly to `BlockRenderer`. On those pages the field works fine. The bug only surfaces on the `Page` route, where `transformSection` intercepts and rebuilds the data.

## Fix

Add every new field to the matching block branch in `transformSection`:

```typescript
if (item.__typename === 'CardsWrapper') {
  return {
    ...
    backgroundColor: item.backgroundColor ?? null,  // ← add new field
    itemsCollection: item.itemsCollection ? {
      items: item.itemsCollection.items.map((card: any) =>
        card && card.__typename === 'Card' ? {
          ...
          mediaSize: card.mediaSize ?? null,      // ← card-level fields too
          colorVariant: card.colorVariant ?? null,
          style: card.style ?? null,
        } : null
      ).filter(Boolean),
    } : null,
    ...
  };
}
```

## Rule going forward

**Any time you add a field to a block's GraphQL fragment, also add it to `transformSection` in `page-content-live.tsx`.** The two lists must stay in sync. Consider this a required second step after updating queries/types.

## Related files

- `src/app/page/[slug]/page-content-live.tsx` — `transformSection()` function
- `src/services/contentful/queries.ts` — GraphQL fragments that feed into transformSection
- `src/block-renderer/types.ts` — TypeScript fragment types
