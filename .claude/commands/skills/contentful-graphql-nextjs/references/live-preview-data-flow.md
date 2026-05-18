# Live Preview Data Flow

## Architecture Overview

```
Server (page.tsx)
  fetchGraphQL({ query: PAGE_BY_SLUG, preview })
  → Raw GraphQL data (untransformed)
  → Pass to client component as prop

Client (page-content-live.tsx)
  useLiveUpdates(rawData)
  → Contentful Live Preview SDK merges real-time updates by sys.id
  → Returns liveData (with __typename and sys.id intact)
  
  transformSection(item) // called AFTER useLiveUpdates
  → BlockRenderer dispatch by __typename
  → Block component receives liveData
```

## The Raw Data Rule

**Never transform data before `useLiveUpdates()`.**

The Live Preview SDK identifies entries by `sys.id` and merges real-time field updates. If you transform the data structure before the SDK sees it:
- `sys.id` might be renamed or nested differently
- `__typename` might be removed
- The SDK can't find the entry to update → live preview silently breaks

```typescript
// ❌ WRONG — transforms before useLiveUpdates
export async function getPageData(slug: string, preview: boolean) {
  const raw = await fetchGraphQL({ query: PAGE_BY_SLUG, variables: { slug }, preview });
  return transformPage(raw);  // ← Breaks live preview
}

// ✅ CORRECT — raw data to client, transform after
export async function getPageRaw(slug: string, preview: boolean) {
  return fetchGraphQL({ query: PAGE_BY_SLUG, variables: { slug }, preview });
  // Return untransformed — client handles it
}

// In the client component:
function PageContent({ rawData }) {
  const { data: liveData } = useLiveUpdates(rawData);
  const sections = liveData.sectionsCollection.items.map(transformSection);
  return <>{sections.map(s => <BlockRenderer key={s.sys.id} block={s} />)}</>;
}
```

## `useLiveUpdates` Hook

Location: `src/lib/live-preview.tsx`

```typescript
import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

export function useLiveUpdates<T>(rawData: T): { data: T } {
  const data = useContentfulLiveUpdates(rawData);
  return { data };
}
```

The hook:
- Subscribes to postMessage events from the Contentful parent frame
- When a field is edited in the parent, SDK merges the update into the data by matching `sys.id`
- Returns the merged data (same shape as input, with updated field values)
- No-ops outside of Contentful's preview frame

## ENTRY_SAVED Pattern

For section reference changes (adding/removing a block from a page), live preview doesn't update automatically — the page entry's `sectionsCollection` changes but the SDK doesn't reload the page. Fix:

```typescript
// In page-content-live.tsx
useEffect(() => {
  const handler = (event: MessageEvent) => {
    if (event.data?.action === 'ENTRY_SAVED') {
      const savedId = event.data?.entity?.sys?.id;
      if (savedId === pageEntryId) {
        router.refresh();  // Reload server component with new sections
      }
    }
  };
  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}, [pageEntryId, router]);
```

## Live Preview Routes

For block-level preview (not page-level):

```
/api/enable-draft?secret=kaz&entryId=[id]&type=[blockType]
  → Sets draftMode cookie
  → Redirects to /preview/[blockType]/[entryId]

/preview/hero/[entryId]
  → Fetches HERO_BY_ID with preview: true
  → Renders block with useLiveUpdates
```

## Debugging Live Preview

See `/skills:contentful-live-preview-verify` for the full debug workflow.

Quick checks:
1. Is `LivePreviewProvider` in the component tree?
2. Is the page served via HTTPS? (required for Contentful app SDK)
3. Is `draftMode()` returning `{ isEnabled: true }` in the page?
4. Is the block using `useLiveUpdates()` on the RAW data?
5. Is `inspectorProps` applied to editable fields?
