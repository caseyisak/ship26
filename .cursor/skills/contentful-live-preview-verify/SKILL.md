---
name: contentful-live-preview-verify
description: Verify Contentful live preview works correctly. Use for debugging or at Milestone 5 of add-contentful-block workflow.
allowed-tools: Bash(agent-browser:*)
---

# Contentful Live Preview Verification

This skill verifies Contentful live preview by capturing browser diagnostics (console, network, screenshot) and checking them against known lessons-learned patterns. Callable by users for debugging or by the AddContentfulBlock agent at Milestone 5.

## Required Reading

- `documentation/lessons-learned.md` – LL-001 through LL-008 (patterns to match in report)
- `~/.cursor/skills/agent-browser/SKILL.md` – agent-browser commands

## Inputs

| Input       | Required | Description                                                     |
| ----------- | -------- | --------------------------------------------------------------- |
| `url`       | Yes      | Contentful preview URL, app URL, or entry URL                   |
| `mode`      | No       | `app`, `iframe`, or `direct`. Auto-detected from URL if omitted |
| `entryId`   | No       | For deriving app URL from entry (when URL is entry-only)        |
| `blockType` | No       | For constructing preview URL (e.g., `hero`, `faq`)              |

## Mode Auto-Detection

If `mode` is not supplied, infer from the URL:

| URL pattern                                                              | Mode     |
| ------------------------------------------------------------------------ | -------- |
| `app.contentful.com/.../entries/XXX/...` with **no** `/preview/` in path | `app`    |
| `app.contentful.com/.../entries/XXX/preview/...`                         | `iframe` |
| `localhost:XXXX/...` (any path)                                          | `direct` |

- **app**: Navigate to Contentful entry URL; capture console/network from parent (for debugging Section Style Editor, entry fields).
- **iframe**: Navigate to Contentful preview URL; use `agent-browser frame "iframe[src*='localhost']"` to switch into iframe; capture from iframe context.
- **direct**: Navigate directly to app URL (e.g. `http://localhost:3000/preview/hero/123`); capture console/network.

## Workflow

### Step 1: Get Terminal Origin

- List or read the project's Cursor terminal files (e.g. under `.cursor/projects/.../terminals/`).
- Find the terminal running the dev server (`next dev` or `bun run dev`).
- Extract the app origin from output: look for `Local: http://localhost:3000` or `- Local: http://localhost:3001`. The port is not fixed; use whatever the dev server reports.
- If no terminal or no matching line: **ask the user for the app origin** (e.g. `http://localhost:3000`).

### Step 2: Determine Mode and Target URL

- If `mode` was supplied, use it. Otherwise apply auto-detection from `url`.
- **direct**: Target URL = `url` as given (must be localhost).
- **iframe**: Parse `url` for entry ID (e.g. path segment after `/entries/` before `/preview/`). If `entryId` or `blockType` were supplied, use them. Derive app URL: `{terminal_origin}/preview/{blockType}/{entryId}` (e.g. `http://localhost:3000/preview/hero/6yUhVoaCfb1sBoHCKgBlrY`). For page previews use the appropriate path (e.g. `/page/{slug}`).
- **app**: Target URL = Contentful entry URL (the `url` as given, typically `app.contentful.com/.../entries/XXX`).

### Step 3: Browser Automation (agent-browser)

Run these commands in order. Use the **project workspace path** when saving screenshots so paths are deterministic.

#### 3.1 Open Browser (use headed mode for debugging)

For debugging live preview issues, **always use headed mode** so you can see what's happening:

```bash
agent-browser --headed open <target_url>
agent-browser wait --load networkidle
```

For automated verification (e.g., Milestone 5), headless is fine:
```bash
agent-browser open <target_url>
agent-browser wait --load networkidle
```

#### 3.2 Configure Viewport

Set a larger viewport to see more content (especially useful for Contentful's side-by-side editor/preview):

```bash
agent-browser set viewport 1800 1200
```

#### 3.3 Authenticate (if needed)

If the browser opens to Contentful login, the user must sign in manually in the Chromium window. Wait for them to confirm they're logged in before proceeding.

#### 3.4 Capture Initial State

Take a screenshot before making any changes:

```bash
agent-browser screenshot .cursor/live-preview-1-initial.png
```

#### 3.5 Frame Switching for iframe Mode

- **If mode is `iframe`**: Switch into the preview iframe to capture console/network from the app context. The Contentful editor embeds the localhost app in an iframe.

  ```bash
  agent-browser frame "iframe[src*='localhost']"
  ```

  If frame switch fails (selector finds no frame), fall back to **direct** mode using the derived app URL and add a note to the report.

#### 3.6 Capture Diagnostics from iframe

Once inside the iframe context, capture console messages, errors, and network requests. **Save to files** for analysis:

```bash
agent-browser console > .cursor/live-preview-iframe-console.txt
agent-browser errors > .cursor/live-preview-iframe-errors.txt
agent-browser network requests --filter api > .cursor/live-preview-iframe-network.txt
```

**Key console messages to look for:**
- `[PageContentLive] subscribed to edit` / `subscribed to save` – SDK subscription registration
- `[PageContentLive] postMessage received {method: ENTRY_SAVED, ...}` – message from Contentful
- `[PageContentLive] ENTRY_SAVED for this page → router.refresh()` – refresh trigger
- `useLiveUpdates` / `useContentfulLiveUpdates` – SDK hooks
- `[useFetchEmbeddedEntries]` – embedded entry fetching

#### 3.7 Return to Main Frame

After capturing iframe diagnostics, return to the main frame to continue interacting with Contentful UI:

```bash
agent-browser frame main
```

#### 3.8 Test Content Changes (Manual Steps)

For debugging live preview refresh issues, have the user perform these actions in the Contentful editor:

1. **Reorder sections**: Drag a section reference to a new position
2. **Add section**: Click "Add content" → "Add existing content" → Select an entry → "Insert entry"
3. **Remove section**: Click the "..." menu on a section → "Remove"
4. **Save** (not Publish): Click "Save" button

After each action, switch back to iframe and check console for `ENTRY_SAVED` messages:

```bash
agent-browser frame "iframe[src*='localhost']"
agent-browser console
agent-browser frame main
```

#### 3.9 Capture Post-Change Screenshots

Use numbered screenshots to track state changes:

```bash
agent-browser screenshot .cursor/live-preview-2-after-add-section.png
agent-browser screenshot .cursor/live-preview-3-after-save.png
```

#### 3.10 Error Handling

| Situation | Action |
|-----------|--------|
| Browser automation fails (timeout, navigation error) | Report error; suggest `agent-browser --headed open <url>` for manual inspection |
| iframe switch fails (selector finds no frame) | Fall back to direct mode with derived app URL; note in report |
| User needs to login | Wait for manual login; take snapshot after to confirm auth |
| Console output too large | Filter with `agent-browser console \| grep -i "error\|warn\|preview"` |

### Step 4: Check Against Lessons Learned

Compare captured **console messages**, **errors**, and **network requests** (including status codes and URLs) against `documentation/lessons-learned.md`:

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

Also check for data-flow signals from the original slash command:

- `[useFetchEmbeddedEntries]` logs (fetched/merged entries, hasMedia)
- `/api/fetch-deferred-entries` responses (status, payload)
- SDK connection: `useLiveUpdates`, `useContentfulLiveUpdates`, `LivePreviewProvider`
- Hydration warnings
- Preview mode: `__prerender_bypass` cookie, `preview: true` in logs

### Live Preview Refresh Signals

For debugging real-time refresh issues (sections not updating on save), check:

| Signal | What it means |
|--------|---------------|
| `[PageContentLive] subscribed to edit` | Edit subscription registered |
| `[PageContentLive] subscribed to save` | Save subscription registered |
| `[PageContentLive] postMessage received {method: ENTRY_SAVED}` | Contentful sent save event |
| `[PageContentLive] ENTRY_SAVED { match: true }` | Event is for current page |
| `[PageContentLive] ENTRY_SAVED for this page → router.refresh()` | Refresh was triggered |
| Missing `router.refresh()` log | Save handler didn't fire (check inspector mode) |

**Root cause pattern**: When inspector mode is enabled, the SDK's `subscribe('save')` callback only fires for "tagged" entries (those with `getProps()` applied). The Page entry itself may not be tagged, so saving the Page doesn't trigger the SDK callback. The fix is to use `window.addEventListener('message')` to listen for `ENTRY_SAVED` messages directly.

Build a `lessons_matched` list: for each LL-XXX that matches, add a short description of the match.

### Step 5: Generate Structured Report

Emit the report in this shape (YAML or equivalent):

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

- `network_failures`: List requests with non-2xx status or that failed (e.g. 404, 500, CORS).
- If iframe switch failed and you fell back to direct, set `mode: direct` and add a note in `diagnosis`.

## Error Handling Summary

| Situation                                         | Action                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------- |
| Terminal parsing fails (no dev server line found) | Ask user for app origin (e.g. `http://localhost:3000`)                          |
| Browser automation fails (open/navigate/timeout)  | Report error; suggest `agent-browser --headed open <url>` for manual inspection |
| iframe switch fails (selector finds no frame)     | Fall back to direct mode with derived app URL; note in report                   |

## Complete Debugging Workflow Example

This is the full workflow used to debug live preview refresh issues:

### 1. Setup

```bash
# Start with headed mode to see the browser
agent-browser --headed open "https://app.contentful.com/spaces/{spaceId}/entries/{entryId}"

# Configure viewport for side-by-side view
agent-browser set viewport 1800 1200
```

### 2. User Login & Navigation

Wait for user to:
1. Sign in to Contentful (if prompted)
2. Navigate to the Page entry they want to debug
3. Open the Live Preview panel (right sidebar)

### 3. Capture Initial State

```bash
agent-browser screenshot .cursor/live-preview-1-initial.png
```

### 4. Switch to Preview iframe

```bash
agent-browser frame "iframe[src*='localhost']"
```

### 5. Capture Console Baseline

```bash
agent-browser console > .cursor/live-preview-iframe-console-before.txt
```

### 6. Return to Main & Make Changes

```bash
agent-browser frame main
```

Have user make changes in Contentful (add/remove/reorder sections), then **Save** (not Publish).

### 7. Check Console for ENTRY_SAVED

```bash
agent-browser frame "iframe[src*='localhost']"
agent-browser console > .cursor/live-preview-iframe-console-after.txt
```

**Look for these log entries:**

```
[PageContentLive] postMessage received {method: ENTRY_SAVED, origin: https://app.contentful.com}
[PageContentLive] ENTRY_SAVED { entityId: "...", pageId: "...", match: true }
[PageContentLive] ENTRY_SAVED for this page → router.refresh()
```

If `match: false`, the save event was for a different entry (not the page).

### 8. Capture Final State

```bash
agent-browser frame main
agent-browser screenshot .cursor/live-preview-2-after-save.png
```

### 9. Compare Before/After

Analyze the console logs to determine:
- Did `ENTRY_SAVED` message arrive?
- Did the page ID match?
- Did `router.refresh()` execute?
- Did the preview iframe update visually?

### Files Created

| File | Purpose |
|------|---------|
| `.cursor/live-preview-1-initial.png` | Screenshot before changes |
| `.cursor/live-preview-2-after-save.png` | Screenshot after Save |
| `.cursor/live-preview-iframe-console-before.txt` | Console logs before changes |
| `.cursor/live-preview-iframe-console-after.txt` | Console logs after Save |
| `.cursor/live-preview-iframe-errors.txt` | Page errors (should be empty) |
| `.cursor/live-preview-iframe-network.txt` | Network requests for debugging |
| `.cursor/live-preview-diagnostic-report.md` | Final diagnosis summary |

## Called by AddContentfulBlock Agent

At Milestone 5, the AddContentfulBlock agent invokes this skill with:

- `url`: The Contentful preview URL for the new block
- `mode`: `iframe`
- `blockType`: The new block's type (e.g. `faq`)

**Success criteria:** No console errors, no network failures, no lessons matched, block renders correctly in the screenshot.

## Data Flow Inspection (from original workflow)

After capturing console/network, consider these when building `diagnosis`:

- **Embedded entries**: `[useFetchEmbeddedEntries]` logs; `/api/fetch-deferred-entries` status and payload; merge/replace logic if API succeeds but UI is incomplete.
- **Entry ID consistency**: IDs in rich text JSON vs `content.links.entries`; missing IDs prevent rendering.
- **SDK connection**: Live preview connection messages or errors in console.
- **Preview mode**: `__prerender_bypass` cookie; `preview: true` in hooks.
- **Hydration**: React hydration warnings may indicate server/client data mismatch.

Reference: domain knowledge in `.cursor/commands/archive/ctfl-live-preview-debug.md` (sections 3.5, 3.6).
