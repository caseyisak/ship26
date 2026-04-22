## LL-011 — PAGE_BY_SLUG over 8192-byte limit after adding NT fields

- **Exact error / symptom:** After adding `ntExperiencesCollection` to a shared `*_FIELDS` GraphQL constant (e.g. `BANNER_FIELDS`), the `PAGE_BY_SLUG` query starts returning a 400 error or partial data.
- **Root cause:** `PAGE_BY_SLUG` includes every block type's fields via shared constants. Adding `ntExperiencesCollection` (which includes nested fields) to any shared constant can push the total past Contentful's 8192-byte wire limit.
- **Solution:** Add `ntExperiencesCollection` only to `*_BY_ID` queries for each block — never to shared `*_FIELDS` constants. NT personalization works on dedicated preview routes but not on page route — acceptable.
  ```typescript
  // ❌ Don't add to shared constant used in PAGE_BY_SLUG
  const BANNER_FIELDS = `... ntExperiencesCollection { ... }`;

  // ✅ Add only to BY_ID query (no size constraint)
  export const BANNER_BY_ID = `... ${BANNER_FIELDS} ntExperiencesCollection { ... }`;
  ```
- **Prevention:** Before adding any field to a shared `*_FIELDS` constant, check current byte size: `Buffer.byteLength(PAGE_BY_SLUG, 'utf8')`. If above ~7500 bytes, use `*_BY_ID` only. Also see LL-018 (minify query strings to reduce wire size).
- **Related files:** `src/services/contentful/queries.ts` — `PAGE_BY_SLUG`, `BANNER_FIELDS`, `BANNER_BY_ID`
