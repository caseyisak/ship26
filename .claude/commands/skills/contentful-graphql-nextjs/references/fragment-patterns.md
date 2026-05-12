# Fragment Architecture Patterns

## The Two-Fragment Rule

Every block type needs two things:
1. **`*_PAGE_FIELDS` fragment** — small, used in page queries, NO NT fields
2. **`*_BY_ID` query** — can include NT fields, used for live preview routes

```typescript
// queries.ts

// 1. PAGE fragment — small and reusable
export const HERO_PAGE_FIELDS = `
  fragment HeroPageFields on Hero {
    sys { id __typename }
    internalName
    headline
    subheadline
    eyebrow
    ctaCollection(limit: 4) {
      items {
        ... on Button {
          sys { id }
          label
          url
          variant
        }
      }
    }
    media {
      url
      title
      width
      height
    }
  }
`;

// 2. BY_ID query — for live preview + NT
export const HERO_BY_ID = `
  query HeroById($id: String!, $preview: Boolean) {
    hero(id: $id, preview: $preview) {
      ...HeroPageFields
      ntExperiencesCollection(limit: 5) {
        items {
          ... on NtExperience {
            sys { id }
            ntConfig
            ntAudienceCollection(limit: 1) {
              items {
                ... on NtAudience {
                  sys { id }
                  ntAudienceId
                  ntRules
                }
              }
            }
            ntVariantsCollection(limit: 5) {
              items {
                ... on Hero {
                  ...HeroPageFields
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

## Page Query Pattern

```typescript
// The main page query assembles all block fragments
export const PAGE_BY_SLUG = `
  query PageBySlug($slug: String!, $preview: Boolean) {
    pageCollection(where: { slug: $slug }, preview: $preview, limit: 1) {
      items {
        sys { id __typename }
        slug
        title
        sectionsCollection(limit: 20) {
          items {
            ... on Hero { ...HeroPageFields }
            ... on Banner { ...BannerPageFields }
            ... on Faq { ...FaqPageFields }
            ... on TabbedContent { ...TabbedContentPageFields }
            # ... all other block types
          }
        }
      }
    }
  }
  ${HERO_PAGE_FIELDS}
  ${BANNER_PAGE_FIELDS}
  ${FAQ_PAGE_FIELDS}
  ${TABBED_CONTENT_PAGE_FIELDS}
`;
```

## Adding a New Block to the Page Query

When you add a new block type, update THREE things:
1. Export the `*_PAGE_FIELDS` fragment constant
2. Add `... on [Typename] { ...[Typename]PageFields }` to `sectionsCollection` inline fragments
3. Append `${[TYPENAME]_PAGE_FIELDS}` to the template literal

## NT Fields Fragment

```typescript
export const NT_AUDIENCE_FIELDS = `
  fragment NtAudienceFields on NtAudience {
    sys { id }
    ntAudienceId
    ntRules
  }
`;

export const NT_VARIANT_FIELDS = `
  fragment NtVariantFields on [BlockType] {
    sys { id __typename }
    # ... same fields as PAGE fragment
    # NEVER include ntExperiencesCollection here (circular!)
  }
`;
```

## Merge Tag Rich Text Links

For blocks with Rich Text fields that support NT merge tags:

```typescript
export const MERGE_TAG_RT_LINKS = `
  fragment MergeTagRtLinks on [TypeName]Links {
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
`;

// Use in a block fragment:
body {
  json
  links {
    ...MergeTagRtLinks
  }
}
```

## Anti-Patterns to Avoid

```typescript
// ❌ WRONG: ntExperiencesCollection in shared fragment
export const HERO_PAGE_FIELDS = `
  fragment HeroPageFields on Hero {
    sys { id }
    ntExperiencesCollection { ... }  // Will inflate every page query
  }
`;

// ❌ WRONG: Transform before useLiveUpdates
const rawData = await fetchGraphQL({ query: PAGE_BY_SLUG });
const sections = rawData.sections.map(transform); // Loses sys.id and __typename
return <ClientPage data={sections} />;  // Live preview broken

// ❌ WRONG: Hardcoded __typename check instead of fragment
... on { __typename, sys { id } }  // Not how GraphQL inline fragments work
```
