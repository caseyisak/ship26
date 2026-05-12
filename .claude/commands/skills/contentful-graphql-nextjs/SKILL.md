---
name: contentful-graphql-nextjs
description: GraphQL patterns specific to this project's fetchGraphQL client, fragment architecture, query limits, and live preview rules. Use when writing new GraphQL queries, fragments, or debugging GraphQL errors. This project is GraphQL-first — never use the REST contentful SDK for content reads.
metadata:
  author: skills-upgrade
  version: 1.0.0
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# Contentful GraphQL — Next.js Patterns

This project uses a custom `fetchGraphQL` client on top of Contentful's GraphQL API (Content Delivery API). All content reads go through this function — no REST SDK.

## Key Files

| File | Purpose |
|------|---------|
| `src/services/contentful/client.ts` | `fetchGraphQL` — the single query function |
| `src/services/contentful/queries.ts` | All GraphQL fragments and query constants |
| `src/services/contentful/page.ts` | Page-level queries and data mappers |
| `src/block-renderer/types.ts` | TypeScript fragment types for all blocks |

## `fetchGraphQL` — How It Works

```typescript
export async function fetchGraphQL<T>({
  query,     // GraphQL query string (will be minified)
  variables, // Query variables (default: {})
  preview,   // true = CPA (draft), false = CDA (published)
}): Promise<T>
```

**What it does internally:**
1. Selects preview vs delivery token based on `preview` flag
2. **Minifies the query:** `query.replace(/\s+/g, ' ').trim()` — critical for 8192-byte limit
3. Sets Next.js caching: `{ next: { revalidate: preview ? 0 : 60 } }`
4. Classifies errors: `UNRESOLVABLE_LINK` = soft error (ok to return partial data); all others = hard throw
5. Logs `[fetchGraphQL] GraphQL errors:` in development for soft errors

**Usage:**
```typescript
const data = await fetchGraphQL<PageQueryResult>({
  query: PAGE_BY_SLUG,
  variables: { slug, preview },
  preview,
});
```

## The 8192-Byte Limit

Contentful's GraphQL API enforces an **8192-byte limit on query complexity** (not character count — transmitted bytes, which includes whitespace). The query minification in `fetchGraphQL` is mandatory.

**Signs you've hit the limit:**
- 400 error: "Query complexity limit exceeded"
- GraphQL error with code `MAX_COMPLEXITY_EXCEEDED`

**Solutions:**
1. Minification already handled by `fetchGraphQL` — you get ~30-40% size reduction
2. Move expensive fragments to separate `*_BY_ID` queries (never load `ntExperiencesCollection` in shared fragments)
3. Split large page queries into multiple smaller queries

## Fragment Architecture

### Rule 1: Shared fragments vs BY_ID queries

```typescript
// SHARED fragment — used in page queries, must be small
export const HERO_PAGE_FIELDS = `
  fragment HeroPageFields on Hero {
    sys { id __typename }
    internalName
    headline
    subheadline
    media { url title }
    ctaCollection(limit: 3) {
      items { ... on Button { label url } }
    }
  }
`;

// BY_ID query — can include NT, heavier fields
export const HERO_BY_ID = `
  query HeroById($id: String!, $preview: Boolean) {
    hero(id: $id, preview: $preview) {
      ...HeroPageFields
      ntExperiencesCollection(limit: 5) {
        items {
          ... on NtExperience {
            sys { id }
            ntConfig
            ntVariantsCollection(limit: 5) {
              items { ...HeroPageFields }
            }
          }
        }
      }
    }
  }
  ${HERO_PAGE_FIELDS}
`;
```

### Rule 2: NEVER put `ntExperiencesCollection` in shared page fragments

This would cause every page query to include NT data for every block → guaranteed 8192-byte overflow.

### Rule 3: Raw data to client — transform after `useLiveUpdates()`

```typescript
// WRONG — transforming before live updates loses sys.id
const page = await getPageBySlug(slug);
const transformed = transformPage(page); // ❌ Transform too early
return <LivePage data={transformed} />

// CORRECT — raw GraphQL data into useLiveUpdates(), transform after
const rawPage = await fetchPageRaw(slug);
// In client component:
const { data: liveData } = useLiveUpdates(rawPage);
const sections = liveData.sectionsCollection.items.map(transformSection); // ✅
```

`__typename` and `sys.id` must survive to the client component for live preview to work.

## NT Query Patterns

### Standard NT fields fragment

```graphql
fragment NtAudienceFields on NtAudience {
  sys { id }
  ntAudienceId
  ntRules  # REQUIRED — LL-014 fix: audiences without ntRules don't evaluate
}

fragment NtVariantFields on [BlockType] {
  # Include all block's own fields here
  # Do NOT include ntExperiencesCollection (would cause circular query)
}
```

### Merge tag RT fields (for rich text with NT merge tags)

```graphql
fragment MergeTagRtLinks on [RtFieldType]Links {
  entries {
    inline {
      sys { id }
      ... on NtMergetag {
        sys { id }
        ntMergetagId
        fallback
      }
    }
  }
}
```

## Common GraphQL Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `UNRESOLVABLE_LINK` | Entry linked but unpublished or deleted | Soft error — safe to ignore, fetchGraphQL handles it |
| `MAX_COMPLEXITY_EXCEEDED` | Query too large / complex | Split query, remove ntExperiencesCollection from shared fragments |
| `[fetchGraphQL] GraphQL errors` in terminal | Hard error but non-crashing | Check field names match CT — common after migrations |
| `null` data with no visible error | `fetchGraphQL` catches and returns null | Always check dev server terminal for GraphQL errors |
| 400 on preview endpoint | Preview token wrong or draft mode not enabled | Check `CONTENTFUL_PREVIEW_ACCESS_TOKEN` and draft mode route |

## Writing a New Query — Checklist

1. Define the fragment with all fields needed at page level (keep it small)
2. Define the `*_BY_ID` query with NT fields if this block supports personalization
3. Add TypeScript types to `block-renderer/types.ts`
4. Register in `block-renderer/configs/index.ts`
5. Add to page query in `queries.ts` if it's a section block
6. Test: `bunx tsc --noEmit` — catch type errors before runtime

## Reference Files

| File | Topic |
|------|-------|
| `references/fetchgraphql-client.md` | Full fetchGraphQL implementation reference |
| `references/fragment-patterns.md` | Fragment architecture rules and examples |
| `references/query-limit.md` | 8192-byte limit — how to measure and fix |
| `references/nt-query-patterns.md` | NT-specific query patterns |
| `references/live-preview-data-flow.md` | Raw data → useLiveUpdates() → transform flow |
| `references/type-mapping.md` | Contentful field types → TypeScript types |
| `references/common-errors.md` | All known GraphQL error patterns with fixes |
