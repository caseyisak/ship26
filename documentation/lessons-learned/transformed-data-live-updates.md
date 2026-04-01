# Transforming GraphQL Data Breaks useLiveUpdates

**Symptom:** SDK console error: `"Invalid live updates subscription detected. Please keep in mind that the data provided to the live updates needs to have 'sys.id'... or '__typename' for GraphQL."` Sections don't reorder in live preview; 10–40 second delays; fields don't update despite Contentful sending correct data.

**Root cause:** The Contentful Live Preview SDK requires **raw GraphQL data** with `__typename` and `sys.id` intact to track changes via postMessage. Server-side transformation (renaming fields, applying `mapSection`, stripping `__typename`) destroys the structure the SDK needs.

This is a common trap — AI tools tend to "clean up" server-side data for nicer component props, which breaks live preview silently.

**Fix:**

Server component — return raw GraphQL data:
```typescript
// src/services/contentful/page.ts

// ❌ DON'T transform server-side
const sections = page.sectionsCollection?.items.map(mapSection) ?? [];
return { sections };

// ✅ DO return raw GraphQL response
return page; // __typename, sys.id, original field names all intact
```

Client component — apply `useLiveUpdates` to raw data, THEN transform:
```typescript
// src/app/page/[slug]/page-content-live.tsx
export function PageContentLive({ page }: Props) {
  // 1. Raw data into useLiveUpdates
  const livePage = useLiveUpdates(page);

  // 2. Transform AFTER
  const sections = livePage?.sectionsCollection?.items
    .map(transformSection)
    .filter(Boolean) as PageSection[];

  return sections.map(s => <BlockRenderer data={s} key={s.sys.id} />);
}
```

**Prevention:** Never transform GraphQL data before passing to `useLiveUpdates`. Always transform after, in client components. When debugging live preview, check the browser console for SDK subscription errors first — they appear immediately on page load.

**Related files:** `src/services/contentful/page.ts`, `src/app/page/[slug]/page-content-live.tsx`, `src/lib/live-preview.tsx`
