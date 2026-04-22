## LL-019 — Contentful field type change requires two-step omit-then-replace

- **Exact error / symptom:** Attempting to change a field's `linkType` (e.g. Asset → Entry) in a single Contentful MCP call fails with a validation error.
- **Root cause:** Contentful CMA does not allow changing a field type in place. A field must be omitted and published before it can be deleted and replaced.
- **Solution:** Two-step process:
  1. Set `omitted: true` on the old field, publish content type
  2. Send the full fields array with the old field removed and new field added, publish
- **Prevention:** Plan any field type change as a two-publish operation. Applies when changing `linkType` (Asset → Entry), `type` (Symbol → RichText), etc.
- **Related files:** Any Contentful MCP `update_content_type` call that changes a field's `linkType` or `type`
