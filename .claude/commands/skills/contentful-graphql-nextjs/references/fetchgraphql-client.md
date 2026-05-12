# fetchGraphQL Client Reference

## Location

`src/services/contentful/client.ts`

## Full Implementation Pattern

```typescript
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const DELIVERY_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN!;
const PREVIEW_TOKEN = process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN!;
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT ?? 'master';

const ENDPOINT = `https://graphql.contentful.com/content/v1/spaces/${SPACE_ID}/environments/${ENVIRONMENT}`;

export async function fetchGraphQL<T>({
  query,
  variables = {},
  preview = false,
}: {
  query: string;
  variables?: Record<string, unknown>;
  preview?: boolean;
}): Promise<T> {
  const token = preview ? PREVIEW_TOKEN : DELIVERY_TOKEN;

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: query.replace(/\s+/g, ' ').trim(),  // CRITICAL: minify
      variables,
    }),
    next: {
      revalidate: preview ? 0 : 60,  // Draft: no cache; Published: 60s
    },
  });

  if (!res.ok) {
    throw new Error(`GraphQL request failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  // Error classification
  if (json.errors?.length) {
    const hardErrors = json.errors.filter(
      (e: { extensions?: { contentful?: { code?: string } } }) =>
        e.extensions?.contentful?.code !== 'UNRESOLVABLE_LINK'
    );

    if (hardErrors.length > 0) {
      throw new Error(`GraphQL errors: ${JSON.stringify(hardErrors)}`);
    }

    // Soft errors (UNRESOLVABLE_LINK) — log in dev, continue
    if (process.env.NODE_ENV === 'development') {
      console.warn('[fetchGraphQL] GraphQL errors:', ...json.errors);
    }
  }

  return json.data as T;
}
```

## Key Behaviors

| Behavior | Detail |
|----------|--------|
| Query minification | `query.replace(/\s+/g, ' ').trim()` — reduces transmitted bytes |
| Caching | `revalidate: 0` for preview, `revalidate: 60` for delivery |
| Error classification | UNRESOLVABLE_LINK = soft (continue); all else = hard throw |
| Dev logging | Soft errors logged to console in development only |
| Return type | Generic `T` — caller must provide the correct type |

## Usage Examples

```typescript
// Fetching a page
const data = await fetchGraphQL<{ pageCollection: { items: PageEntry[] } }>({
  query: PAGE_BY_SLUG,
  variables: { slug, preview },
  preview,
});

// Fetching a block by ID (for live preview route)
const data = await fetchGraphQL<{ hero: HeroFields }>({
  query: HERO_BY_ID,
  variables: { id: params.entryId, preview: true },
  preview: true,
});
```

## Environment Variables Required

| Variable | Purpose |
|----------|---------|
| `CONTENTFUL_SPACE_ID` | Space ID (`uumzxfocy3ef`) |
| `CONTENTFUL_ACCESS_TOKEN` | CDA token — published content |
| `CONTENTFUL_PREVIEW_ACCESS_TOKEN` | CPA token — draft content |
| `CONTENTFUL_ENVIRONMENT` | Target env (default: `master`) |

## Debugging GraphQL Errors

When preview is broken with no visible error:
1. Check dev server terminal for `[fetchGraphQL] GraphQL errors:` warnings
2. These are soft errors that `fetchGraphQL` logs but doesn't throw
3. Common cause: field renamed in Contentful but query still uses old name

The `null` return pattern:
- `fetchGraphQL` returns `json.data` — if a query returns null data with errors, the function returns `null`
- This causes silent failures — always check dev server terminal, not just browser console
