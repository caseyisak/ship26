# Complete Debugging Workflow

## Complete Debugging Workflow Example

Full workflow for debugging live preview refresh (sections not updating):

### 1. Find port and navigate

```bash
lsof -i :3000 | grep LISTEN
```

```
mcp__docker__browser_navigate(url: "http://localhost:3000/page/home")
mcp__docker__browser_wait_for(time: 3000)
mcp__docker__browser_resize(width: 1800, height: 1200)
```

### 2. Capture baseline

```
mcp__docker__browser_take_screenshot()
mcp__docker__browser_console_messages()
```

Look for: `[PageContentLive] subscribed to edit` and `subscribed to save`

### 3. User makes changes in Contentful

Have the user add/remove/reorder a section in the Contentful editor and click Save (not Publish).

### 4. Check console for ENTRY_SAVED

```
mcp__docker__browser_console_messages()
```

**Look for:**
```
[PageContentLive] postMessage received {method: ENTRY_SAVED, origin: https://app.contentful.com}
[PageContentLive] ENTRY_SAVED { entityId: "...", pageId: "...", match: true }
[PageContentLive] ENTRY_SAVED for this page → router.refresh()
```

If `match: false`, the save event was for a different entry (not the page).

### 5. Capture final state

```
mcp__docker__browser_take_screenshot()
mcp__docker__browser_network_requests()
```

### 6. Generate report

Compare before/after console, determine root cause, check lessons-learned.
