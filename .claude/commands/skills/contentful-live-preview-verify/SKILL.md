---
name: contentful-live-preview-verify
description: Browser-based debugging tool for broken Contentful live preview — captures console errors, network failures, and screenshots, then matches against LL-001–LL-008 known error patterns. Run when the preview iframe isn't updating, showing errors, or rendering incorrectly. Invoke when user says "preview not working", "debug live preview", "check why preview isn't updating", "verify the preview", or at Milestone 5. Skip for adding new preview support (use contentful-block-live-preview).
allowed-tools: mcp__docker__browser_navigate, mcp__docker__browser_take_screenshot, mcp__docker__browser_console_messages, mcp__docker__browser_network_requests, mcp__docker__browser_wait_for, mcp__docker__browser_resize, mcp__docker__browser_evaluate, mcp__docker__browser_snapshot, Bash(lsof:*), Bash(curl:*)
metadata:
  author: metafi-project
  version: 1.0.0
---

# Contentful Live Preview Verification

This skill verifies Contentful live preview by capturing browser diagnostics (console, network, screenshot) and checking them against known lessons-learned patterns. Callable by users for debugging or by the AddContentfulBlock agent at Milestone 5.

## Required Reading

- `documentation/lessons-learned.md` – LL-001 through LL-008 (patterns to match in report)

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

- **app**: Navigate to Contentful entry URL; capture diagnostics from parent frame (for debugging Section Style Editor, entry fields).
- **iframe**: Navigate to Contentful preview URL; use `mcp__docker__browser_evaluate` to extract iframe console state; for most live preview debugging, prefer **direct** mode by navigating to the localhost URL directly.
- **direct**: Navigate directly to app URL (e.g. `http://localhost:3000/preview/hero/123`); capture console/network. **Preferred for iframe debugging** since Claude Code browser tools work best with a single page context.

## Workflow

### Step 1: Find the Dev Server Port

Check which port the Next.js dev server is running on:

```bash
lsof -i :3000 | grep LISTEN
lsof -i :3001 | grep LISTEN
```

Or ping a known route:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/page/home
```

If the dev server isn't running or you can't detect the port, **ask the user for the app origin** (e.g. `http://localhost:3000`).

### Step 2: Determine Mode and Target URL

- If `mode` was supplied, use it. Otherwise apply auto-detection from `url`.
- **direct**: Target URL = `url` as given (must be localhost).
- **iframe**: Derive the direct app URL: `{terminal_origin}/preview/{blockType}/{entryId}` (e.g. `http://localhost:3000/preview/hero/6yUhVoaCfb1sBoHCKgBlrY`). Use **direct** mode against this derived URL for cleaner diagnostics. Note in the report that you're inspecting the iframe target directly.
- **app**: Target URL = Contentful entry URL. Navigate to it and capture parent-frame diagnostics only (can't easily inspect the embedded iframe).

### Step 3: Browser Automation

Use the `mcp__docker__browser_*` MCP tools in order.

#### 3.1 Navigate to Target URL

```
mcp__docker__browser_navigate(url: "<target_url>")
```

Then wait for the page to finish loading:

```
mcp__docker__browser_wait_for(time: 3000)
```

#### 3.2 Configure Viewport

Set a larger viewport to see more content:

```
mcp__docker__browser_resize(width: 1800, height: 1200)
```

#### 3.3 Authenticate (if needed)

If the browser opens to Contentful login, ask the user to sign in manually. You can't automate Contentful auth. Take a screenshot to confirm state before proceeding.

#### 3.4 Capture Initial Screenshot

```
mcp__docker__browser_take_screenshot()
```

Save the result as reference. Note: the screenshot is returned inline — mention what you see in your report.

#### 3.5 Capture Console Messages

```
mcp__docker__browser_console_messages()
```

**Key console messages to look for:**
- `[PageContentLive] subscribed to edit` / `subscribed to save` – SDK subscription registration
- `[PageContentLive] postMessage received {method: ENTRY_SAVED, ...}` – message from Contentful
- `[PageContentLive] ENTRY_SAVED for this page → router.refresh()` – refresh trigger
- `useLiveUpdates` / `useContentfulLiveUpdates` – SDK hooks
- Any `Error:` or `Warning:` lines

#### 3.6 Capture Network Requests

```
mcp__docker__browser_network_requests()
```

Look for:
- 404s on `/preview/*` routes → likely a missing route or null Contentful data
- Failed `/api/enable-draft` calls
- GraphQL errors (status 200 but `errors` in body)
- `/api/fetch-deferred-entries` failures

#### 3.7 Inspect Page State (if needed)

For deeper debugging, evaluate JavaScript in the page to check live preview state:

```
mcp__docker__browser_evaluate(script: "document.cookie")
```

Check for the `__prerender_bypass` cookie (confirms draft mode is active).

```
mcp__docker__browser_evaluate(script: "window.__NEXT_DATA__?.props?.pageProps")
```

#### 3.8 Test Content Changes

For debugging live preview refresh, make a change in the Contentful editor (in a separate browser window or tab the user controls), then re-capture console messages:

```
mcp__docker__browser_console_messages()
```

Look for the ENTRY_SAVED signals listed in Step 3.5.

#### 3.9 Capture Post-Change Screenshot

```
mcp__docker__browser_take_screenshot()
```

#### 3.10 Error Handling

| Situation | Action |
|-----------|--------|
| Navigation fails (timeout, connection refused) | Check dev server is running; verify port with `lsof -i :3000` |
| Page shows 404 | Check route exists; check entry ID is valid |
| Console output empty | Page may not have loaded fully; try `browser_wait_for(time: 5000)` then retry |
| Need to inspect iframe content | Navigate directly to the localhost URL instead; inspect there |

### Step 4: Check Against Lessons Learned

Compare captured **console messages**, **errors**, and **network requests** against `documentation/lessons-learned.md`:

> See [`references/lessons-patterns.md`](references/lessons-patterns.md) for the full LL-001–LL-008 pattern matching table.

### Live Preview Refresh Signals

See [`references/lessons-patterns.md`](references/lessons-patterns.md) for the full signal table and root cause pattern.

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
lessons_matched:
  - 'LL-XXX: description of match'
diagnosis: "Summary of findings or 'No issues detected'"
```

- `network_failures`: List requests with non-2xx status or that failed (e.g. 404, 500, CORS).
- If you navigated directly to the app URL instead of the Contentful iframe URL, set `mode: direct` and note this in `diagnosis`.

## Error Handling Summary

| Situation                                         | Action                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------- |
| Port detection fails                              | Ask user for app origin (e.g. `http://localhost:3000`)                          |
| Navigation fails (connection refused)             | Confirm dev server is running with `bun run dev`                                |
| Page renders but no console output                | Wait longer; check if LivePreviewProvider is mounted                            |

## Complete Debugging Workflow Example

See [`references/debugging-workflow.md`](references/debugging-workflow.md) for the full step-by-step debugging workflow with commands.

## Called by AddContentfulBlock Agent

At Milestone 5, the AddContentfulBlock agent invokes this skill with:

- `url`: The localhost preview URL for the new block (e.g. `http://localhost:3000/preview/faq/ENTRY_ID`)
- `mode`: `direct`
- `blockType`: The new block's type (e.g. `faq`)

**Success criteria:** No console errors, no network failures, no lessons matched, block renders correctly in the screenshot.

## Data Flow Inspection

See [`references/lessons-patterns.md`](references/lessons-patterns.md) for data flow inspection checklist.
