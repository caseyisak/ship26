# NT Query Patterns for GraphQL

## Rule: NT Fields Go in BY_ID Queries Only

Never add `ntExperiencesCollection` to shared page fragments. Only in `*_BY_ID` queries.

**Why:** Every block in the page query includes the shared fragment. NT fields add ~400-600 bytes per block. With 10+ blocks, you'll hit the 8192-byte limit.

## Standard NT Query Structure

```typescript
// ✅ Correct structure
export const HERO_BY_ID = `
  query HeroById($id: String!, $preview: Boolean) {
    hero(id: $id, preview: $preview) {
      ...HeroPageFields                    # Reuse the page fragment
      ntExperiencesCollection(limit: 5) { # NT layer — only here
        items {
          ... on NtExperience {
            sys { id }
            ntConfig                       # Experience config JSON
            ntAudienceCollection(limit: 1) {
              items {
                ... on NtAudience {
                  sys { id }
                  ntAudienceId
                  ntRules                  # CRITICAL — LL-014 fix
                }
              }
            }
            ntVariantsCollection(limit: 5) {
              items {
                ... on Hero {
                  ...HeroPageFields        # Variant has same shape as baseline
                }
              }
            }
          }
        }
      }
    }
  }
  ${HERO_PAGE_FIELDS}
`;
```

## NT Audience Fields Fragment

Always include `ntRules` — it's the audience rule JSON that NT SDK evaluates:

```typescript
export const NT_AUDIENCE_FIELDS = `
  fragment NtAudienceFields on NtAudience {
    sys { id }
    ntAudienceId
    ntRules
  }
`;
```

If `ntRules` is missing, NT has no rules to evaluate → audience never matches → always shows baseline.

## NT Variant Fragments

Variant entries are the same CT as the baseline. Use the same PAGE fragment for variants:

```typescript
ntVariantsCollection(limit: 5) {
  items {
    ... on Hero {
      ...HeroPageFields     # Same fragment, different entry content
    }
    # If multiple block types can be variants:
    ... on Banner {
      ...BannerPageFields
    }
  }
}
```

**NEVER include `ntExperiencesCollection` in variant fragments** — it would be circular (experience → variant → experience → ...).

## Merge Tag RT Links

For blocks with Rich Text that support NT merge tags inline:

```typescript
export const MERGE_TAG_RT_LINKS = `
  fragment MergeTagRtLinks on [BlockType]RichTextLinks {
    entries {
      inline {
        sys { id }
        ... on NtMergetag {
          sys { id }
          ntMergetagId
          fallback
        }
      }
      block {
        sys { id }
        # embedded block entries if needed
      }
    }
    assets {
      block {
        sys { id }
        url
        title
        width
        height
      }
    }
  }
`;

// Usage in fragment:
body {
  json
  links {
    ...MergeTagRtLinks
  }
}
```

## Page Query: NO NT Fields

```typescript
export const PAGE_BY_SLUG = `
  query PageBySlug($slug: String!, $preview: Boolean) {
    pageCollection(where: { slug: $slug }, preview: $preview, limit: 1) {
      items {
        sys { id __typename }
        slug
        title
        sectionsCollection(limit: 20) {
          items {
            ... on Hero { ...HeroPageFields }     # ← No NT here
            ... on Banner { ...BannerPageFields }  # ← No NT here
            # ... all other blocks
          }
        }
      }
    }
  }
  ${HERO_PAGE_FIELDS}   # ← These fragments also don't include NT
  ${BANNER_PAGE_FIELDS}
`;
```

The page query fetches the block content for rendering. NT resolution happens client-side in the `Experience` component, which uses the `ntExperiencesCollection` data fetched via the BY_ID query (for live preview routes) or the `Experience` component's own data fetching.
