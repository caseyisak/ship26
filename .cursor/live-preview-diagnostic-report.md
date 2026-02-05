# Live Preview Diagnostic Report (agent-browser + Contentful debug skill)

**Date:** 2026-02-05  
**Flow:** Resize 1800×1200 → screenshot 1 (initial) → Add Features entry → screenshot 2 (after add) → Publish → Refresh preview → screenshot 3 (after publish/refresh) → iframe console/errors/network.

## Root cause and fix (2026-02-05)

**Cause:** With `enableInspectorMode` on, the SDK’s save subscription only runs when the saved entry’s ID is in the **tagged** list (entries with `getProps()` on the page). The **Page** entry is not tagged (only section blocks are), so saving the Page never called our callback.

**Fix:** In `page-content-live.tsx`, listen to `postMessage` for `ENTRY_SAVED` and call `router.refresh()` when `e.data.entity.sys.id === page.sys.id`. This runs regardless of inspector mode. Dev log: `[PageContentLive] ENTRY_SAVED { entityId, pageId, match }` and `[PageContentLive] ENTRY_SAVED for this page → router.refresh()`.

**Verification:** After refresh preview and edit+save in Contentful, iframe console showed `match: true` and `ENTRY_SAVED for this page → router.refresh()`. Screenshot: `.cursor/live-preview-4-after-save-refresh.png`.

## Screenshots (full window)

| File | Moment |
|------|--------|
| `.cursor/live-preview-1-initial.png` | Initial live preview page (before adding Features) |
| `.cursor/live-preview-2-after-add-features.png` | After adding Features to sections (preview did not update) |
| `.cursor/live-preview-3-after-publish-refresh.png` | After Publish + Refresh preview |

## Iframe console (evidence)

- **`[PageContentLive] subscribed to edit`** and **`[PageContentLive] subscribed to save`** – present on load (subscriptions registered).
- **`[PageContentLive] postMessage received {method: ENTRY_SAVED, origin: https://app.contentful.com}`** – present multiple times. So the editor **does** send ENTRY_SAVED to the iframe when you save.
- **`[PageContentLive] save callback → router.refresh()`** – **not** seen in the captured log after ENTRY_SAVED. So either the SDK is not invoking our save callback when it receives ENTRY_SAVED, or the callback runs but the log is missing (e.g. timing/batching).
- **401, 422, 404** – present (e.g. LaunchDarkly 401; one 422; one 404). The 404 may be unrelated to live preview refresh.
- **Duplicate React key** – `Encountered two children with the same key, 6sAqLv0XQlh4b3ipvEg5qH` (Features entry ID). Same section reference was added twice, so `key={section.sys.id}` duplicated. **Fix applied:** use `key={\`${section.sys.id}-${index}\`}` in `page-content-live.tsx`.

## Iframe network

- **RSC requests:** `GET http://localhost:3000/page/kaz-test?_rsc=...` (fetch) – present; no 404 on this URL in the captured list.
- **Stack-frame / dev overlay** requests for the duplicate-key error (many GETs to `__nextjs_original-stack-frame`).

## Conclusions

1. **ENTRY_SAVED reaches the iframe** – postMessage from Contentful is received.
2. **Save callback may not run or refresh may not refetch draft** – we don’t see "save callback → router.refresh()" in the log; next step is to confirm whether the SDK calls the callback and whether `router.refresh()` runs and refetches with draft cookie.
3. **Duplicate key** – fixed by using index in the section key when the same entry can appear multiple times in sections.

## Log files

- Console (full): see agent-tools output or `.cursor/live-preview-iframe-console.txt` if saved.
- Errors: `.cursor/live-preview-iframe-errors.txt` (empty in run).
- Network: `agent-browser network requests --filter api` returned "No requests captured"; unfiltered `network requests` showed GETs above.
