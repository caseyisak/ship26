## LL-017 — Duplicate `ntExperiencesCollection` with conflicting `limit` args breaks `*_BY_ID`

- **Exact error / symptom:** `/preview/banner/[entryId]` returns 404. GraphQL error: `Fields "ntExperiencesCollection" conflict because they have differing arguments.`
- **Root cause:** `BANNER_FIELDS` already included `ntExperiencesCollection(limit: 5)`. `BANNER_BY_ID` also explicitly added the same field with `limit: 10`. GraphQL rejects differing arguments on merged fields.
- **Solution:** Remove the explicit `ntExperiencesCollection` block from `BANNER_BY_ID` when it is already included in the shared `BANNER_FIELDS` fragment.
- **Prevention:** Before adding `ntExperiencesCollection` to a `*_BY_ID` query, check if the shared `*_FIELDS` fragment already includes it. Also see LL-011 — avoid adding NT fields to shared `*_FIELDS` constants at all.
- **Related files:** `src/services/contentful/queries.ts` — `BANNER_BY_ID`, `BANNER_FIELDS`
