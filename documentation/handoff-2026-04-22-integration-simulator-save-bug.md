# Handoff — Integration Simulator Config Save Bug
**Date:** 2026-04-22
**Branch:** `main`
**Status:** RESOLVED — `b95f1cf` — save confirmed working via Playwright

---

## What Got Done This Session

### App folder consolidation (committed)
- `src/contentful-app/` (split business logic) merged into `src/app/contentful-app/`
- Each app is now self-contained:
  - `src/app/contentful-app/section-style-editor/` — page + editor + grid canvas
  - `src/app/contentful-app/integration-simulator/` — page + config + field + dialog + pickers + shared
- Root `src/app/contentful-app/page.tsx` is now a dev index listing both apps
- `src/app/field-preview/page.tsx` import path updated
- **Contentful App Definition URL to update:** Section Style Editor → `…/contentful-app/section-style-editor`

### Integration Simulator SDK location fix (committed earlier, `2083c69`)
- `sdk.app` is now defined (location correctly detected as `LOCATION_APP_CONFIG`)
- Diagnostic console log confirms: `[IntegrationSimulator] detected location: LOCATION_APP_CONFIG | sdk.app defined: true`

### Config screen save bug — 3 fix attempts
All committed to main. Bug: "Failed to update app configuration" popup when clicking Save.

**Fix 1 (`8d93db5`):** Empty `EditorInterface: {}` — Contentful rejects a `targetState` with no entries. Fixed by only including `targetState` when mappings exist. Also switched from deprecated `sdk.space.getContentTypes()` to `useCMA()` hook.

**Fix 2 (`7271fb2`):** `useCMA()` unreliable in dynamic import context — reverted to `sdk.space.getContentTypes()`. Switched to ref pattern for `onConfigure` so it registers once and reads latest activations via `useRef` instead of re-registering on every `activations` change. Added `onConfigurationCompleted` error logger.

**Status:** Not yet confirmed fixed. Playwright triage in progress.

---

## Active Issue: Config Save Failure

### Symptom
Clicking Save in the Integration Simulator config screen (with at least one CT activated) shows: "Failed to update app configuration."

### What we know
- SDK location is correct (`app-config`) ✅
- `sdk.app` is defined ✅
- Content types load correctly ✅
- Error happens on the Contentful side when it tries to persist parameters/targetState

### Possible remaining causes (to triage via Playwright)
1. `onConfigure` handler returning a value Contentful rejects — need to see `onConfigurationCompleted` log
2. `targetState.EditorInterface` field reference invalid — `internalName` may be a protected/title field
3. App Definition missing required configuration (locations, parameters schema)
4. Network error from Contentful API (check Network tab for 4xx/5xx on save)

### App Definition URL
`https://app.contentful.com/spaces/uumzxfocy3ef/apps/35DgPLQ0MS8z9tl4Ov7hFL`

### Triage steps (Playwright is running this)
1. Open app definition — verify locations registered (app-config, entry-field, dialog)
2. Open app installation config page
3. Toggle a CT, click Save
4. Capture console output — look for `onConfigurationCompleted error:`
5. Capture Network tab — look for failed API call on save
6. Check if save succeeds with NO CTs activated (tests empty-params path)

---

## Files Modified This Session

| File | Change |
|------|--------|
| `src/app/contentful-app/section-style-editor/page.tsx` | Moved + import fixed |
| `src/app/contentful-app/section-style-editor/section-style-editor.tsx` | Moved from src/contentful-app/ |
| `src/app/contentful-app/section-style-editor/section-grid-canvas.tsx` | Moved from src/contentful-app/ |
| `src/app/contentful-app/integration-simulator/config-screen.tsx` | Save fix + ref pattern |
| `src/app/contentful-app/integration-simulator/[all other files]` | Moved from src/contentful-app/ |
| `src/app/contentful-app/page.tsx` | New dev index |
| `src/app/field-preview/page.tsx` | Import path updated |
| `src/contentful-app/` | Deleted entirely |

---

## Next Session Start

1. Read this doc
2. Check if Playwright triage found the root cause (see `documentation/lessons-learned/` for new entry)
3. If save is still broken: check browser console for `[IntegrationSimulator] onConfigurationCompleted error:` and Network tab for the failing API call
4. Update Section Style Editor App Definition URL to `…/contentful-app/section-style-editor`
