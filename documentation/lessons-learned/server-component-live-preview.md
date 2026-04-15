# LL-025 — Server components cannot subscribe to `useLiveUpdates` — preview routes need a client wrapper

## Symptom

Field changes made in the Contentful editor do not trigger re-renders in the preview iframe. The preview shows stale data even after the editor saves. This is especially noticeable for fields that control layout (e.g. `pageType`, `variant`, `sectionStyle`) — the editor updates the field but the preview keeps showing the old layout.

## Root Cause

`useLiveUpdates()` is a React hook. Hooks only work in **client components**. If the top-level renderer of a preview route (`/preview/[type]/[entryId]`) is a server component, the hook is never called and the Contentful Preview SDK has no subscriber to push updates to.

## Fix

Introduce a dedicated **client component wrapper** at the top of each preview route that calls `useLiveUpdates()` and re-renders the block based on the updated data.

### Naming convention

`[BlockName]PreviewClient` — e.g. `DashboardPreviewClient`, `BlogPostPreviewClient`

### Pattern

```tsx
// src/app/preview/dashboard/[entryId]/preview-client.tsx
'use client'

import { useContentfulLiveUpdates } from '@contentful/live-preview/react'
import { DashboardPage } from '@/cms-components/dashboard/dashboard-page'

interface Props {
  initialData: DashboardPageFragment
}

export function DashboardPreviewClient({ initialData }: Props) {
  const data = useContentfulLiveUpdates(initialData)  // subscribes to SDK updates
  return <DashboardPage data={data} />
}
```

```tsx
// src/app/preview/dashboard/[entryId]/page.tsx  (server component — fetches once)
import { DashboardPreviewClient } from './preview-client'

export default async function PreviewPage({ params }: { params: { entryId: string } }) {
  const data = await fetchDashboardById(params.entryId, { preview: true })
  return <DashboardPreviewClient initialData={data} />
}
```

## Why It Matters

Layout-controlling fields are especially painful: without the client wrapper the preview appears broken (wrong layout shown) but the entry editor shows the correct value, making it hard to distinguish a data bug from a rendering bug.

## Reference Implementation

`src/app/preview/dashboard/[entryId]/preview-client.tsx` — established in `demo/wow-personalization-2026-04`

## Seen In

- `demo/wow-personalization-2026-04` — DashboardPreviewClient fix for `pageType` field not updating layout in live preview
