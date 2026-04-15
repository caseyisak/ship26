# LL-021 — GraphQL union fields: `sys { id }` requires `... on Entry` inline fragment

## Symptom

GraphQL error when querying `sys { id }` on a collection field that accepts multiple content types (a union). Example error:

```
Cannot query field "sys" on type "FeatureSectionItemsItem"
```

## Root Cause

When a Contentful collection field accepts multiple content types (e.g. `items` can be `FeatureItem | NewsArticle`), the generated GraphQL union type does not expose `sys` at the root level. You must use an inline fragment to tell GraphQL which concrete type you're addressing.

## Broken Query

```graphql
featureSection {
  items {
    sys { id }   # ← fails — union root has no sys field
  }
}
```

## Fix

Use `... on Entry` inline fragment to access `sys.id` on any union member:

```graphql
featureSection {
  items {
    ... on Entry {
      sys { id }   # ← works — Entry interface always has sys
    }
  }
}
```

## Why It Matters

`useLiveUpdates()` from the Contentful live preview SDK requires `sys.id` on every entry to merge incoming live changes. If the fragment is wrong or missing, live preview silently breaks — no error, fields just stop updating in the editor.

## Seen In

- `demo/bears` — FeaturesItemsItem union fix
- `demo/punchbowl-2026-04` — newsletter `promoSlot`/`leadStory` union fix
