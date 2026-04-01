# Lessons Learned Pattern Reference

Quick-match table for live preview debugging. Full detail for each pattern is in `documentation/lessons-learned/`.

| Pattern to check | Console/network signature | Full lesson |
|------------------|--------------------------|-------------|
| Field name mismatch | 404 on `/preview/...`, service returns null | [field-name-mismatch.md](../../../../documentation/lessons-learned/field-name-mismatch.md) |
| `__typename` case wrong | "unknown type", block not rendering | [typename-case-sensitivity.md](../../../../documentation/lessons-learned/typename-case-sensitivity.md) |
| Collection shape wrong | "Cannot read property 'items' of undefined" | [collection-shape.md](../../../../documentation/lessons-learned/collection-shape.md) |
| Draft mode not enabled | Preview shows published only, enable-draft errors | [draft-mode.md](../../../../documentation/lessons-learned/draft-mode.md) |
| Rich Text as object | "[object Object]" in rendered output | [rich-text-rendering.md](../../../../documentation/lessons-learned/rich-text-rendering.md) |
| Content type ID / `__typename` casing | `mapSection` returns null, block filtered out | [content-type-id-typename.md](../../../../documentation/lessons-learned/content-type-id-typename.md) |
| GraphQL Collection suffix | "Cannot query field X on type Y" | [graphql-collection-suffix.md](../../../../documentation/lessons-learned/graphql-collection-suffix.md) |
| Raw vs mapped field names | Stale images, `media` vs `image` not syncing | [live-preview-field-names.md](../../../../documentation/lessons-learned/live-preview-field-names.md) |
| Transformed data passed to `useLiveUpdates` | SDK error: "Invalid live updates subscription" — 10–40s delays | [transformed-data-live-updates.md](../../../../documentation/lessons-learned/transformed-data-live-updates.md) |

### Live Preview Refresh Signals

| Signal | What it means |
|--------|---------------|
| `[PageContentLive] subscribed to edit` | Edit subscription registered |
| `[PageContentLive] subscribed to save` | Save subscription registered |
| `[PageContentLive] postMessage received {method: ENTRY_SAVED}` | Contentful sent save event |
| `[PageContentLive] ENTRY_SAVED { match: true }` | Event is for current page |
| `[PageContentLive] ENTRY_SAVED for this page → router.refresh()` | Refresh was triggered |
| Missing `router.refresh()` log | Save handler didn't fire — check inspector mode tagging |

**Root cause pattern:** When inspector mode is enabled, the SDK's `subscribe('save')` callback only fires for "tagged" entries. The Page entry itself may not be tagged. Fix: `window.addEventListener('message')` to listen for `ENTRY_SAVED` directly.

## Data Flow Inspection

After capturing console/network, check these when building `diagnosis`:

- **Embedded entries:** `[useFetchEmbeddedEntries]` logs; `/api/fetch-deferred-entries` status and payload.
- **Entry ID consistency:** IDs in rich text JSON vs `content.links.entries` — missing IDs prevent rendering.
- **SDK connection:** Live preview connection messages or errors in console.
- **Preview mode:** `__prerender_bypass` cookie (`browser_evaluate(script: "document.cookie")`).
- **Hydration:** React hydration warnings indicate server/client data mismatch.
