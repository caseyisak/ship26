# Collection Shape in GraphQL Queries

**Symptom:** `page.sections` or `sectionsCollection.items` is undefined; "Cannot read property 'items' of undefined".

**Root cause:** Contentful GraphQL wraps all array/reference fields in collection types with an `items` array. Code expecting a flat `sections` or `items` property directly on the parent will always get `undefined`.

**Fix:**

```graphql
# ❌ Wrong — no collection wrapper
query {
  page(slug: "home") {
    sections { ... }
  }
}

# ✅ Correct — use collection wrapper
query {
  pageCollection(where: { slug: "home" }, limit: 1) {
    items {
      sectionsCollection(limit: 20) {
        items {
          __typename
          ... on Hero { ...HeroFragment }
        }
      }
    }
  }
}
```

In code:
```typescript
const page = data.pageCollection?.items?.[0];
const sections = page?.sectionsCollection?.items ?? [];
```

**Prevention:** Follow existing query patterns in `queries.ts`. All linked/collection fields need `*Collection { items { ... } }`. Never assume a flat array.

**Related files:** `src/services/contentful/queries.ts`, `src/services/contentful/page.ts`
