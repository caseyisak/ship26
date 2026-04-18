# LL: NT Field ID Double Collection Suffix

## Symptom

GraphQL query fails with `Cannot query field 'ntExperiencesCollectionCollection'` or NT experiences silently return null even though the CT field exists.

## Root Cause

When adding the Ninetailed experiences field to a content type **manually via MCP**, if the field ID is set to `ntExperiencesCollection` instead of `nt_experiences`, Contentful's GraphQL layer appends `Collection` automatically (standard behaviour for array fields) — producing `ntExperiencesCollectionCollection` (double suffix). This field doesn't exist in the schema, so queries 400 or return null.

## Fix

**Never create the `nt_experiences` field manually via MCP.** The Ninetailed app creates it with the correct field ID (`nt_experiences`) when you connect the app to a content type. Manual creation is error-prone and produces the wrong field ID.

If you already created it with the wrong ID:
1. Set `disabled: true` and `omitted: true` on the bad field, publish the CT.
2. Add a new Array field with ID exactly `nt_experiences`, type `Link → Entry (nt_experience)`.
3. Publish the CT.
4. In code, query as `ntExperiencesCollection(limit: 10) { items { ... } }` — Contentful maps `nt_experiences` → `ntExperiencesCollection` in GraphQL.

## Code Pattern

```graphql
# WRONG — field ID was set to ntExperiencesCollection in Contentful
ntExperiencesCollectionCollection(limit: 10) {   # double suffix, 400 error
  items { ... }
}

# CORRECT — field ID is nt_experiences in Contentful
ntExperiencesCollection(limit: 10) {   # single suffix, works
  items { ... }
}
```

## Related

- `nt-experiences-field-collision.md` — 422 from field collision when connecting NT app
- `nt-experiences-duplicate-collection.md` — double-adding to both `*_FIELDS` and `*_BY_ID`
