# Lessons Learned Pattern Reference

| Pattern to check                                                    | Lesson | Console/network signature                                        |
| ------------------------------------------------------------------- | ------ | ---------------------------------------------------------------- |
| Field name mismatch (e.g. query returns null, 404 on preview route) | LL-001 | 404 on `/preview/...`, null in logs                              |
| Wrong component or config lookup                                    | LL-002 | "unknown type", typename mismatch in logs                        |
| Collection shape                                                    | LL-003 | "Cannot read property 'items' of undefined"                      |
| Draft not enabled                                                   | LL-004 | Preview shows published only, 404 for draft, enable-draft errors |
| Rich Text rendered as object                                        | LL-005 | "[object Object]" in output or logs                              |
| Content type ID / \_\_typename                                      | LL-006 | Block filtered out, mapSection returns null                      |
| GraphQL collection suffix                                           | LL-007 | "Cannot query field X on type Y"                                 |
| Live preview field names                                            | LL-008 | Stale images, old values, media vs image                         |

### Live Preview Refresh Signals

For debugging real-time refresh issues (sections not updating on save), check:

| Signal | What it means |
|--------|---------------|
| `[PageContentLive] subscribed to edit` | Edit subscription registered |
| `[PageContentLive] subscribed to save` | Save subscription registered |
| `[PageContentLive] postMessage received {method: ENTRY_SAVED}` | Contentful sent save event |
| `[PageContentLive] ENTRY_SAVED { match: true }` | Event is for current page |
| `[PageContentLive] ENTRY_SAVED for this page → router.refresh()` | Refresh was triggered |
| Missing `router.refresh()` log | Save handler didn't fire (check inspector mode tagging) |

**Root cause pattern**: When inspector mode is enabled, the SDK's `subscribe('save')` callback only fires for "tagged" entries (those with `getProps()` applied). The Page entry itself may not be tagged. The fix is `window.addEventListener('message')` to listen for `ENTRY_SAVED` messages directly.

## Data Flow Inspection

After capturing console/network, check these when building `diagnosis`:

- **Embedded entries**: `[useFetchEmbeddedEntries]` logs; `/api/fetch-deferred-entries` status and payload.
- **Entry ID consistency**: IDs in rich text JSON vs `content.links.entries`; missing IDs prevent rendering.
- **SDK connection**: Live preview connection messages or errors in console.
- **Preview mode**: `__prerender_bypass` cookie (check with `browser_evaluate(script: "document.cookie")`).
- **Hydration**: React hydration warnings indicate server/client data mismatch.
