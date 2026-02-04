# /ctfl-live-preview-debug

When the user invokes **/ctfl-live-preview-debug** (or asks to run this workflow), they provide a **URL** (Contentful live preview URL). The **agent** gathers all diagnostic information programmatically; the user does not copy-paste. Confirm in your reply that you checked all three (browser network, browser console, terminal) before giving a diagnosis or conclusion.

## 1. URL

Use the URL the user supplied. If none is given, ask for it.

## 2. Terminal (get app origin first)

- List or read the project's Cursor terminal files (e.g. under `.cursor/projects/.../terminals/`).
- Read the terminal that is running the dev server (e.g. `next dev` or `bun run dev`).
- **Get the app origin from the dev server output.** Look for a line like `Local: http://localhost:3000` or `- Local: http://localhost:3001`. The port is **not** fixed to 3000; it is whatever the local server is using. Extract the origin (e.g. `http://localhost:3000`) to use when building the app URL in step 3.

## 3. Browser (always inspect the previewed app)

- **Contentful preview URL** (e.g. `app.contentful.com/.../entries/.../preview/...`): The live preview runs **inside an iframe** (your app). The Browser MCP cannot read that iframe's console or network from the parent tab. So the agent must **inspect the same document the iframe loads** by navigating to the app URL and then gathering network and console there.
  1. **Derive the app URL** from the Contentful preview URL and the app origin from the terminal:
     - Parse the preview URL for **entry id** (e.g. from a path like `.../entries/118NRnWbHMV6pkdPquxXru/preview/...`) and **locale** if present (default e.g. `en-US`).
     - Path pattern for newsletter: `/{locale}/newsletter/{entryId}` (e.g. `/en-US/newsletter/118NRnWbHMV6pkdPquxXru`). For other content types, use the appropriate path (e.g. blog by slug).
     - App URL = `{origin from terminal}{path}` (e.g. `http://localhost:3000/en-US/newsletter/118NRnWbHMV6pkdPquxXru`). If preview uses draft, append the bypass cookie query param the app expects (e.g. `x-vercel-set-bypass-cookie=samesitenone`) when the app uses it for draft.
  2. **Navigate** the browser to that app URL (`browser_navigate`).
  3. **Wait** for the page to load (e.g. short wait then snapshot if needed).
  4. **Network:** Call `browser_network_requests` on that tab. Inspect failed requests, status codes, and relevant responses.
  5. **Console:** Call `browser_console_messages` on that tab. Include errors, warnings, and relevant logs in your summary.

- **Non-Contentful URL** (e.g. direct app URL): Navigate to the URL, then run `browser_network_requests` and `browser_console_messages` on that tab.

The agent must perform these steps so that **all** information (network, console) is gathered from the previewed app, not from the Contentful top-level page and not by asking the user to paste.

## 3.5. Data Flow Inspection (embedded entries)

After checking network and console, **inspect the data flow** to catch issues where entries are fetched but not properly merged:

1. **Check console logs** for `[useFetchEmbeddedEntries]` messages:
   - Look for logs showing "Fetched entries/assets" with entry details
   - Check if entries show `hasMedia: false` for CallToAction entries (indicates incomplete data)
   - Verify "Merged content" logs show entries were actually merged

2. **Inspect network responses** for `/api/fetch-deferred-entries`:
   - If the API call succeeded (200), check the response payload
   - Verify that fetched entries include required fields (e.g., `CallToAction` entries have `media` field)
   - Compare what was fetched vs. what's in the console logs

3. **Check for incomplete entry merge bugs**:
   - If console shows entries were fetched with complete data (`hasMedia: true`), but the UI still shows missing fields (e.g., CTA without image), this indicates a **merge logic bug**
   - The issue: incomplete entries in `links` are not being **replaced** with complete fetched versions
   - Solution: Check `src/hooks/use-fetch-embedded-entries.ts` merge logic - it should **replace** existing incomplete entries, not just append new ones

4. **Compare working vs. broken**:
   - If blog works but newsletter doesn't, compare their data flow:
     - Both should use `useFetchEmbeddedEntries` for live preview
     - Both should have the same merge logic
     - Check if one has incomplete entries that aren't being replaced

**Key insight**: If API calls succeed but UI still shows incomplete data, the bug is in the **merge/replace logic**, not the fetch logic.

## 3.6. Additional Data Flow Tracings

After data flow inspection, check these additional areas:

1. **Entry ID Consistency**:
   - Extract entry IDs from rich text JSON (`content.json` → find `EMBEDDED_ENTRY` nodes → get `node.data.target.sys.id`)
   - Compare with IDs in `content.links.entries.block` and `content.links.entries.inline`
   - **Issue**: If JSON references an ID that's not in `links`, the entry won't render
   - **Check**: All IDs in JSON should exist in `links` (either initially or after `useFetchEmbeddedEntries` runs)

2. **Live Preview SDK Connection**:
   - Check console for `useLiveUpdates` or `useContentfulLiveUpdates` warnings/errors
   - Verify `LivePreviewProvider` is wrapping the page component
   - Check if `targetOrigin` matches the app's origin (should be `https://{appHost}`)
   - **Issue**: If SDK isn't connected, live updates won't trigger `useFetchEmbeddedEntries`
   - **Check**: Look for Contentful Live Preview connection messages in console

3. **Rich Text JSON Structure Validation**:
   - Verify `content.json` is a valid rich text document structure
   - Check for required fields: `nodeType`, `content` array
   - Verify embedded entries have `data.target.sys.id`
   - **Issue**: Malformed JSON will cause rendering failures
   - **Check**: JSON should parse without errors and have expected structure

4. **Hydration Mismatches**:
   - Look for React hydration warnings in console (e.g., "hydrated but attributes didn't match")
   - These indicate server-rendered HTML differs from client-rendered HTML
   - **Issue**: Can cause rendering issues or missing content
   - **Check**: Look for hydration warnings mentioning rich text or embedded entries

5. **Preview Mode Detection**:
   - Verify `__prerender_bypass` cookie exists (check browser cookies)
   - Check if `isPreview` is correctly detected in `useFetchEmbeddedEntries` hook
   - Verify draft mode is enabled: `draftMode().isEnabled` should be `true`
   - **Issue**: If preview mode isn't detected, client-side fetching may not run
   - **Check**: Console logs should show `preview: true` in `useFetchEmbeddedEntries` calls

6. **Component Prop Validation**:
   - Check if `RichText` component receives `data` prop with both `json` and `links`
   - Verify `BlockRenderer` receives complete entry data (not just `{sys: {id}}`)
   - Check console for component warnings about missing props
   - **Issue**: Components may render but show placeholders if data is incomplete
   - **Check**: Look for `[RichText]` or `[BlockRenderer]` warnings in console

7. **Server vs Client Data Comparison**:
   - Compare initial page load data (from server) vs data after live preview update
   - Server-side: `fillDeferredEntries` should populate `links` completely
   - Client-side: `useFetchEmbeddedEntries` should enrich `links` for new entries
   - **Issue**: If server data is complete but client data is incomplete, check merge logic
   - **Check**: Compare `content.links` before and after live preview updates

**Key insights**:
- **Entry ID mismatch** → Entry won't render (check `extractEmbeddedIds` function)
- **SDK not connected** → Live updates won't trigger client-side fetching
- **Hydration mismatch** → May indicate server/client data inconsistency
- **Preview mode not detected** → Client-side hooks may not run

## 4. Terminal (diagnostics)

- Again read the dev server terminal for stack traces, build errors, and request logs related to the page load.

## 5. Report

- Summarize findings from **network**, **console**, **data flow**, and **terminal**.
- Explicitly state: "Checked: [x] browser network (app tab), [x] browser console (app tab), [x] data flow (embedded entries merge), [x] terminal."
- Only then state diagnosis or next steps.
