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
