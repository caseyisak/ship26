# LL-049: Contentful query complexity explosion from nested collections

## Symptom
`GET_PERSONALIZATION_EXPERIENCES` query returns 400: `TOO_COMPLEX_QUERY` with cost ~1,000,000 (limit: 11,000). The query worked before adding `itemsCollection` to the FAQ variant fragment inside `NT_VARIANT_FIELDS`.

## Root cause
Contentful's query complexity is multiplicative across nested collections:
- `ntExperienceCollection(limit: 100)` = 100x
- `ntVariantsCollection(limit: 10)` = 10x per experience
- `itemsCollection(limit: 10)` = 10x per variant FAQ

Total: 100 * 10 * 10 * ~100 fields = 1,000,000 cost.

Even reducing limits doesn't help: 20 * 3 * 6 = 360 items is still over 11K after field costs. The three-level nesting is fundamentally too expensive.

Adding `MERGE_TAG_RT_LINKS` (which includes `links { entries { inline { ... } } }`) also adds collection nesting and can blow the budget even without `itemsCollection`.

## Fix
Don't add deeply nested collections to the global experiences query. Instead, fetch variant data separately:

1. Keep `NT_VARIANT_FIELDS` for FAQ minimal: `titleRt`, `descriptionRt` only (scalar/simple fields)
2. Create an API route `/api/faq/[entryId]` that fetches the full FAQ entry with `itemsCollection`
3. In the FAQ component, detect when the Experience component provides a variant (no `itemsCollection`) and fetch the full entry client-side
4. Cache the fetch in a module-level Map so repeat persona swaps are instant

```typescript
// Module-level cache — survives re-renders
const variantCache = new Map<string, Promise<FaqFragment | null>>();

function fetchFaqById(entryId: string): Promise<FaqFragment | null> {
  const cached = variantCache.get(entryId);
  if (cached) return cached;
  const promise = fetch(`/api/faq/${entryId}`).then(r => r.ok ? r.json() : null).catch(() => null);
  variantCache.set(entryId, promise);
  return promise;
}
```

## Related files
- `src/services/contentful/queries.ts` — `NT_VARIANT_FIELDS`, `GET_PERSONALIZATION_EXPERIENCES`
- `src/app/api/faq/[entryId]/route.ts` — variant fetch endpoint
- `src/cms-components/faq/faq.tsx` — variant detection + fetch
