# Code Templates

## Touch Point 6: BY_ID Query

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

## Touch Point 7: Get-by-ID Service

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

## Touch Point 8: Preview Route

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

## Touch Point 9: Enable-Draft Branch

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
