# Lessons Learned — Index

Error patterns, root causes, and fixes from this project. Search by symptom below. Each lesson is its own file — click through for full detail, code examples, and related files.

To add a new lesson: create a new `.md` file in this folder and add one row to the table below.

---

## Quick Lookup

| Error / symptom | Lesson | Quick fix |
|-----------------|--------|-----------|
| Hero/preview 404; service returns null | [Field name mismatch](./field-name-mismatch.md) | Use Contentful field name in query (e.g. `media` not `image`) |
| Block not rendering; wrong component shown | [__typename case sensitivity](./typename-case-sensitivity.md) | Use exact `__typename` Contentful returns |
| `sections` or `items` undefined | [Collection shape](./collection-shape.md) | Use `*Collection { items { ... } }` in GraphQL |
| Preview shows published only / 404 | [Draft mode not enabled](./draft-mode.md) | Use enable-draft + preview token; HTTPS for app URL |
| Rich Text shows "[object Object]" | [Rich Text rendering](./rich-text-rendering.md) | Use `documentToReactComponents()` |
| Block filtered out; mapSection returns null | [Content type ID determines __typename](./content-type-id-typename.md) | Content type ID drives `__typename` — verify PascalCase from Contentful |
| GraphQL error: "Cannot query field X on type Y" | [GraphQL Collection suffix](./graphql-collection-suffix.md) | Array field `items` → query as `itemsCollection` |
| Live preview images not updating; stale values | [Live preview field names](./live-preview-field-names.md) | `useLiveUpdates` returns raw field names — check both `image` and `media` |
| SDK error "Invalid live updates subscription" | [Transformed data breaks useLiveUpdates](./transformed-data-live-updates.md) | Pass raw GraphQL to `useLiveUpdates`, transform after |
| `PAGE_BY_SLUG` 400 after adding NT fields | [PAGE_BY_SLUG NT query limit](./page-by-slug-nt-query-limit.md) | Add `ntExperiencesCollection` to `*_BY_ID` only, never shared `*_FIELDS` |
| Custom preview renderer shows stale data | [Custom renderer live updates](./custom-renderer-live-updates.md) | Call `useLiveUpdates(data)` at top of any custom preview renderer |
| `next/image` broken icon for Contentful assets | [Protocol-relative image URLs](./protocol-relative-image-urls.md) | Use `<img>` or prepend `https:` — Contentful returns `//images.ctfassets.net` |
| NT `identify()` fires but variant doesn't swap | [NT audience rules missing](./nt-audience-rules-missing.md) | Add `ntRules` to `NT_AUDIENCE_FIELDS`; pass `rules: a.ntRules` in `mapAudiences` |
| Draft entry 404 in Contentful live preview iframe | [Preview route draft token](./preview-route-draft-token.md) | Always use `preview: true` in `/preview/*` routes — iframe bypasses enable-draft |
| GraphQL 422 after connecting NT app | [NT experiences field collision](./nt-experiences-field-collision.md) | Delete custom `ntExperiences` field; use only NT-prescribed `nt_experiences` |
| `*_BY_ID` query null / 404 after adding `ntExperiencesCollection` | [NT experiences duplicate collection](./nt-experiences-duplicate-collection.md) | Don't add `ntExperiencesCollection` to `*_BY_ID` if already in shared `*_FIELDS` |
| GraphQL 400 even though character count appears safe | [GraphQL query byte inflation](./graphql-query-byte-inflation.md) | Minify: `query.replace(/\s+/g, ' ').trim()` in `fetchGraphQL` |
| Contentful field type change fails in single MCP call | [Contentful field type change](./contentful-field-type-change.md) | Two steps: omit+publish, then replace+publish |
