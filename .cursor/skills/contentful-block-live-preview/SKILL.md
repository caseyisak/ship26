---
name: contentful-block-live-preview
description: Add ID-based live preview support for a Contentful block. Use at Milestone 4 to add preview route, BY_ID query, get-by-ID service, and enable-draft branch.
---

# Contentful Block: Live Preview

This skill adds ID-based live preview support so a block can be previewed directly from Contentful (without needing a page). Follow this at Milestone 4 of the add-contentful-block workflow.

## Required Reading

Before following this skill, ensure you've read:
- `documentation/component-live-preview.md` – Full ID-based preview documentation
- `src/app/preview/hero/[entryId]/page.tsx` – Reference preview route
- `src/services/contentful/hero.ts` – Reference get-by-ID service
- `src/app/api/enable-draft/route.ts` – Enable-draft route with type branches

## Prerequisites

Milestones 1-3 must be complete:
- Fragment type, queries, and mapper exist
- Component and block config exist
- Content type and entry exist in Contentful

## Touch Point 6: BY_ID Query (`src/services/contentful/queries.ts`)

Add the BY_ID query after the `*_FIELDS` constant:

```typescript
/** Fetch a single [BlockName] entry by entry ID (for ID-based live preview). */
export const [BLOCKNAME]_BY_ID = `
  query [BlockName]ById($id: String!, $locale: String!, $preview: Boolean) {
    [blockName]Collection(where: { sys: { id: $id } }, locale: $locale, preview: $preview, limit: 1) {
      items {
        ${[BLOCKNAME]_FIELDS}
      }
    }
  }
`;
```

**Note:** The collection name is `[blockName]Collection` (camelCase with Collection suffix).

## Touch Point 7: Get-by-ID Service (`src/services/contentful/<name>.ts`)

Create a new service file:

```typescript
import { draftMode } from 'next/headers';

import type { [BlockName]Fragment } from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import { [BLOCKNAME]_BY_ID } from './queries';

// Copy the Raw type and mapper from page.ts or import if exported
type Raw[BlockName] = {
  __typename: string;
  sys: { id: string };
  // ... fields
};

type [BlockName]ByIdResponse = {
  [blockName]Collection: {
    items: Array<Raw[BlockName] | null>;
  };
};

function map[BlockName](item: Raw[BlockName] | null): [BlockName]Fragment | null {
  if (!item || item.__typename !== '[BlockName]') return null;
  return {
    __typename: '[BlockName]',
    sys: { id: item.sys.id },
    // ... map all fields
  };
}

/** Fetch a single [BlockName] entry by ID for ID-based live preview. */
export async function get[BlockName]ByEntryId({
  entryId,
  locale = 'en-US',
}: {
  entryId: string;
  locale?: string;
}): Promise<[BlockName]Fragment | null> {
  try {
    const { isEnabled } = await draftMode();
    const data = await fetchGraphQL<[BlockName]ByIdResponse>({
      query: [BLOCKNAME]_BY_ID,
      variables: { id: entryId, locale, preview: isEnabled },
      preview: isEnabled,
    });
    const item = data.[blockName]Collection?.items?.[0] ?? null;
    return map[BlockName](item);
  } catch {
    return null;
  }
}
```

## Touch Point 8: Preview Route (`src/app/preview/<name>/[entryId]/page.tsx`)

Create the preview route:

```typescript
import { notFound } from 'next/navigation';

import { BlockRenderer } from '@/block-renderer';
import { get[BlockName]ByEntryId } from '@/services/contentful/[name]';

type Props = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ locale?: string }>;
};

/**
 * ID-based live preview for [BlockName] entries (no page/slug).
 * Use in Contentful: set preview URL to your enable-draft URL with entryId and type=[name].
 */
export default async function Preview[BlockName]Page({ params, searchParams }: Props) {
  const { entryId } = await params;
  const { locale } = await searchParams;

  const [blockName] = await get[BlockName]ByEntryId({
    entryId,
    locale: locale ?? 'en-US',
  });

  if (![blockName]) {
    notFound();
  }

  return <BlockRenderer data={[blockName]} />;
}
```

## Touch Point 9: Enable-Draft Branch (`src/app/api/enable-draft/route.ts`)

Add a branch for the new type. Find the existing Hero branch and add after it:

```typescript
// ID-based preview for [BlockName]
if (entryId && type === '[name]') {
  // Validate entryId is not a placeholder
  if (
    entryId.includes('entry.') ||
    entryId.includes('NOT_FOUND') ||
    entryId.length < 10
  ) {
    return NextResponse.json(
      {
        error:
          'Contentful did not substitute the entry ID. Fix in Contentful: Settings → Content preview → [BlockName] → set Preview URL and use the Entry ID merge tag.',
        received: entryId,
      },
      { status: 400 },
    );
  }
  const redirectUrl = `${base}/preview/[name]/${encodeURIComponent(entryId)}`;
  const res = NextResponse.redirect(redirectUrl);
  try {
    const draft = await draftMode();
    draft.enable();
  } catch {
    res.cookies.set('__prerender_bypass', '1', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60,
    });
  }
  return res;
}
```

**Important:** The `type` value must be lowercase (e.g., `type === 'faq'` not `type === 'Faq'`).

## Contentful Configuration

After implementing, configure Contentful:

1. Go to **Settings → Content preview**
2. Find or create preview config for the content type
3. Set **Preview URL** to:
   ```
   https://YOUR_APP_URL/api/enable-draft?secret=YOUR_SECRET&entryId={{entry.sys.id}}&type=[name]
   ```
4. Use the UI's "Insert variable" → "Entry ID" to ensure the merge tag resolves

**Common issue:** If you see `{entry.sys.id_NOT_FOUND}` in the URL, the merge tag wasn't set correctly in Contentful.

## Test Step

Add test for the get-by-ID service or preview route if applicable:

```typescript
// Optional: test the mapper or service
it('maps [BlockName] correctly from raw data', () => {
  const raw = {
    __typename: '[BlockName]',
    sys: { id: 'test-1' },
    // ... fields
  };
  const result = map[BlockName](raw);
  expect(result?.__typename).toBe('[BlockName]');
  expect(result?.sys.id).toBe('test-1');
});
```

Run `bun test`. All tests must pass before proceeding.

## Verification

After implementation, verify:

1. **enable-draft route works:**
   ```
   curl "http://localhost:3000/api/enable-draft?secret=YOUR_SECRET&entryId=ENTRY_ID&type=[name]"
   ```
   Should redirect to `/preview/[name]/ENTRY_ID`

2. **Preview route renders:**
   Navigate to `http://localhost:3000/preview/[name]/ENTRY_ID` (with draft mode enabled)
   Should render the component

3. **Contentful preview works:**
   Open entry in Contentful → Click "Open preview"
   Should load the component in the preview iframe

4. **Live updates work:**
   Edit a field in Contentful
   Should see the change in the preview iframe within seconds

## Common Issues

**404 on preview route**
- Check the route file is at `src/app/preview/[name]/[entryId]/page.tsx`
- Check `get[BlockName]ByEntryId` is returning data
- Check the entry exists and is published (or draft mode is enabled)

**`type` param not matched**
- The enable-draft route must accept both `type` and `ctype` params
- Check: `const type = searchParams.get('type') ?? searchParams.get('ctype');`

**Merge tag not resolving**
- `{entry.sys.id_NOT_FOUND}` means Contentful didn't substitute the variable
- Use Contentful's "Insert variable" button in the Preview URL config

**Draft content not showing**
- Check `draftMode().isEnabled` is passed to the GraphQL query as `preview: true`
- Check the preview access token is configured in `.env`

**Images not updating in live preview (LL-008)**
- `useLiveUpdates` returns raw Contentful field names (`media`), not mapped names (`image`)
- Check both: `liveData.image?.url ?? liveData.media?.url`
- Don't fall back to stale `data` - if `liveData.field` is `null`, the field was removed
- For background images: check both `backgroundImage` and `backgroundMedia`
- See LL-008 in lessons-learned.md

## Completion Checklist

- [ ] `*_BY_ID` query added to queries.ts
- [ ] `get*ByEntryId` service function created
- [ ] Preview route created at `src/app/preview/<name>/[entryId]/page.tsx`
- [ ] Enable-draft branch added for `type === '<name>'`
- [ ] Contentful Preview URL configured with merge tag
- [ ] `bun test` passes
- [ ] Manual verification: preview loads from Contentful

Do not mark Milestone 4 complete until this checklist is verified.
