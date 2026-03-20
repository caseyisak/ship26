---
description: Verify Contentful live preview works correctly. Use for debugging or at Milestone 5 of add-contentful-block workflow.
---

# Contentful Live Preview Verification

This skill verifies Contentful live preview by capturing browser diagnostics (console, network, screenshot) and checking them against known lessons-learned patterns.

## Required Reading

- `documentation/lessons-learned.md` – LL-001 through LL-008 (patterns to match in report)

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| `url` | Yes | Contentful preview URL, app URL, or entry URL |
| `mode` | No | `app`, `iframe`, or `direct`. Auto-detected from URL if omitted |
| `entryId` | No | For deriving app URL from entry |
| `blockType` | No | For constructing preview URL (e.g., `hero`, `faq`) |

## Mode Auto-Detection

| URL pattern | Mode |
|-------------|------|
| `app.contentful.com/.../entries/XXX/...` (no `/preview/`) | `app` |
| `app.contentful.com/.../entries/XXX/preview/...` | `iframe` |
| `localhost:XXXX/...` | `direct` |

## Workflow

### Step 1: Get Dev Server Origin

Look for the terminal running `bun run dev`. Extract the app origin from output (look for `Local: http://localhost:3000` or similar). If not found, ask the user for the app origin.

### Step 2: Determine Mode and Target URL

- **direct**: Target URL = `url` as given
- **iframe**: Parse `url` for entry ID; derive app URL: `{terminal_origin}/preview/{blockType}/{entryId}`
- **app**: Target URL = Contentful entry URL

### Step 3: Browser Verification

Navigate to the target URL and capture:

1. **Screenshot** – Save to `.cursor/live-preview-1-initial.png` (or appropriate path)
2. **Console messages** – Look for:
   - `[PageContentLive] subscribed to edit/save` – SDK subscription registered
   - `[PageContentLive] postMessage received {method: ENTRY_SAVED}` – message from Contentful
   - `[PageContentLive] ENTRY_SAVED for this page → router.refresh()` – refresh trigger
   - `useLiveUpdates` / `useContentfulLiveUpdates` – SDK hooks active
3. **Console errors** – Note any errors
4. **Network failures** – Note non-2xx responses

### Step 4: Check Against Lessons Learned

| Pattern to check | Lesson | Console/network signature |
|------------------|--------|--------------------------|
| Field name mismatch | LL-001 | 404 on `/preview/...`, null in logs |
| Wrong component lookup | LL-002 | "unknown type", typename mismatch |
| Collection shape | LL-003 | "Cannot read property 'items' of undefined" |
| Draft not enabled | LL-004 | Preview shows published only |
| Rich Text rendered as object | LL-005 | "[object Object]" in output |
| Content type ID / __typename | LL-006 | Block filtered out, mapSection returns null |
| GraphQL collection suffix | LL-007 | "Cannot query field X on type Y" |
| Live preview field names | LL-008 | Stale images, old values, media vs image |

### Live Preview Refresh Signals

For debugging real-time refresh issues:

| Signal | What it means |
|--------|---------------|
| `[PageContentLive] subscribed to edit` | Edit subscription registered |
| `[PageContentLive] subscribed to save` | Save subscription registered |
| `[PageContentLive] postMessage received {method: ENTRY_SAVED}` | Contentful sent save event |
| `[PageContentLive] ENTRY_SAVED { match: true }` | Event is for current page |
| `[PageContentLive] ENTRY_SAVED for this page → router.refresh()` | Refresh was triggered |
| Missing `router.refresh()` log | Save handler didn't fire |

**Root cause pattern**: When inspector mode is enabled, the SDK's `subscribe('save')` callback only fires for "tagged" entries. The fix is to use `window.addEventListener('message')` to listen for `ENTRY_SAVED` messages directly.

### Step 5: Generate Structured Report

```yaml
mode: iframe | app | direct
url_inspected: '<URL actually opened>'
terminal_origin: 'http://localhost:XXXX'
console_errors: []
console_warnings: []
network_failures: []
screenshot_path: '/path/to/screenshot.png'
lessons_matched:
  - 'LL-XXX: description of match'
diagnosis: "Summary of findings or 'No issues detected'"
```

## Success Criteria (at Milestone 5)

- No console errors related to the new block
- No network failures for new block queries
- No lessons matched
- Block renders correctly in the screenshot
- (If live preview enabled) Live updates function correctly

## Called by AddContentfulBlock Agent

At Milestone 5, the add-contentful-block command invokes this skill with:
- `url`: The Contentful preview URL for the new block
- `mode`: `iframe`
- `blockType`: The new block's type (e.g. `faq`)
