# Handoff — feat/integration-sim-multi-select

**Branch:** `feat/integration-sim-multi-select`
**PR:** caseyisak/metafi#102
**GH Issue:** #101
**Last updated:** 2026-05-11
**Status:** READY TO MERGE — all work complete, QA passed visual inspection

---

## What this branch is

Adds single/multi mode toggle to the Integration Simulator 3P App. Each mapping row in the config screen now has a **Mode** column (Single / Multi). Multi mode stores an array of products/assets instead of one object. Also renames `bookingCatalog` → `thirdPartyCatalog` in the Settings CT.

---

## Commits on this branch (vs main)

| Hash | What |
|------|------|
| `611dd19` | fix: remove targetState from onConfigure (was causing save error); setReady() only once via ref |
| `56532a1` | fix: setReady() race condition — register onConfigure first, then signal ready |
| `ce1779f` | fix: PAGE location now shows config UI instead of landing page; sdk.app optional chaining |
| `5ada7c4` | feat: bookingCatalog → thirdPartyCatalog; /api/catalog?type=bookings reads nested provider JSON |
| `92c6be5` | feat: multi-select mode — checkboxes, thumbnail strip filled state, order-by dropdown |

---

## Contentful changes (already published)

**Settings CT** (`settings`, space `uumzxfocy3ef`, env `master`, published v24):
- `bookingCatalog` — deleted (was omitted first, then removed)
- `thirdPartyCatalog` — new Object field, active

**Settings entry** (`2cgyEdELIF1EbwlLLdSZgR`, published v44+):
- `thirdPartyCatalog` populated with nested JSON:
  ```json
  {
    "BOOKING_REVRAISE": [...3 items],
    "BOOKING_SPAONE": [...3 items],
    "BOOKING_OPENTABLE": [...3 items]
  }
  ```

---

## What works

- ✅ Config screen (Manage apps → Configure) renders Mappings + Connectors tabs
- ✅ Mode column (Single/Multi) visible per mapping row
- ✅ Save no longer throws "Failed to update app configuration"
- ✅ Config screen renders at PAGE location (`/apps/app_installations/...`) instead of static landing page
- ✅ `/api/catalog?type=bookings` returns booking items from `thirdPartyCatalog`; accepts `?provider=BOOKING_REVRAISE` to filter
- ✅ Ecom picker: checkboxes + order-by dropdown + confirm footer in multi mode
- ✅ DAM picker: checkboxes + order-by dropdown + confirm footer in multi mode
- ✅ Types clean, build clean

---

## What's broken / open

### 🔴 #1 — Field editor doesn't respect Multi mode (PRIORITY)

**Symptom:** On an entry with `dynamicListing.skus` mapped to BigCommerce/Multi, clicking the field picker opens the single-product view (not checkboxes).

**Root cause:** `field-editor.tsx` reads `pickerMode` from `sdk.parameters.invocation.pickerMode`. That value is passed when `openCurrentApp()` is called. `openCurrentApp` reads the mapping's `mode` from `sdk.parameters.installation` (saved app params). BUT — the saved params didn't have `mode` until now (save was broken). Now that save works, the params need to be read and passed through correctly.

**What to check:**
1. In `field-editor.tsx` — find where `openCurrentApp` is called and where `pickerMode` is passed in the parameters. Verify it reads `mode` from the saved installation params for the right CT/field combo.
2. Save the config with Dynamic Listing → SKUs → Multi. Confirm the saved params JSON includes `mode: "multi"` for that mapping. Then open the entry and try the picker again.

**Files:**
- `src/app/contentful-app/integration-simulator/field-editor.tsx` — `openCurrentApp` call (around line 145-155)
- `src/app/contentful-app/integration-simulator/dialog.tsx` — reads `pickerMode` from invocation params

### 🟡 #2 — PAGE location: verify config UI actually renders

**Symptom:** User still saw the landing page at the app installation URL after our fix. Suspected cause: browser cached old JS bundle from before the dev server restart.

**What happened:** We changed `page.tsx` to route `LOCATION_PAGE → IntegrationSimulatorConfig` instead of `IntegrationSimulatorLanding`. We also added optional chaining to all `sdk.app` calls so PAGE context (where `sdk.app` is undefined) doesn't crash.

**What to verify:** In a fresh browser session (no cache), navigate to `https://app.contentful.com/spaces/uumzxfocy3ef/environments/master/apps/app_installations/35DgPLQ0MS8z9tl4Ov7hFL/`. It should show Mappings + Connectors tabs. If it still shows the landing page, check the browser console for JS errors — `appSdk.space.getContentTypes()` may throw in PAGE context (PageAppSDK may not expose `.space`).

**If `appSdk.space` is undefined in PAGE context:** guard it in `config-screen.tsx` init:
```ts
appSdk.space?.getContentTypes?.() ?? { items: [] }
```

### 🟡 #3 — Landing component cleanup

`IntegrationSimulatorLanding` is no longer reached from `page.tsx` but still exists in `landing.tsx`. Can be deleted once we confirm the PAGE location fix is stable.

---

## Dev server setup

```bash
# In the worktree — needs .env (was missing, copy from main project)
cp /Users/casey.lisak/Dev/metafi-nextjs-shadcnblocks/.env /Users/casey.lisak/Dev/metafi-worktrees/feat-integration-sim-multi-select/.env

# Start server (port 3000 — Contentful app definition points here)
bun run dev
```

The dev app definition points to `localhost:3000`. Do NOT start on 5000.

Note: `worktree-add.sh` already symlinks `.env` — this worktree was created before that step existed so the copy was manual.

---

## Files to read first

1. `src/app/contentful-app/integration-simulator/page.tsx` — location routing
2. `src/app/contentful-app/integration-simulator/config-screen.tsx` — main config UI, onConfigure handler, setReady logic
3. `src/app/contentful-app/integration-simulator/field-editor.tsx` — filled state, openCurrentApp call
4. `src/app/contentful-app/integration-simulator/dialog.tsx` — threads pickerMode to picker modals
5. `src/app/contentful-app/integration-simulator/ecom-picker-modal.tsx` — multi mode checkboxes
6. `src/app/contentful-app/integration-simulator/dam-picker-modal.tsx` — multi mode checkboxes
7. `src/app/contentful-app/integration-simulator/connector-types.ts` — MappingRow type with `mode`
8. `src/services/contentful/settings.ts` — thirdPartyCatalog type + GraphQL query
9. `src/app/api/catalog/route.ts` — bookings handler reads thirdPartyCatalog

---

## Next steps (ordered)

1. **Verify save works** — open Manage apps → Configure, set Dynamic Listing → SKUs → Multi, click Save. Should succeed silently.
2. **Fix field editor multi-mode** (Issue #1 above) — trace `openCurrentApp` → `dialog.tsx` → picker modal, confirm `pickerMode: 'multi'` is being passed when the mapping mode is multi.
3. **Verify PAGE location** (Issue #2) — fresh browser, navigate to app installation URL, confirm Mappings + Connectors tabs show.
4. `bunx tsc --noEmit` + `bun run build` — confirm still clean after any changes.
5. Push + merge PR #102 to main.
6. Update TASKS.md: mark #101 done, remove active branch entry.

---

## Known non-issues

- "Served from localhost" Contentful banner — normal for local dev, not a bug
- `metadataBase` warning in build — pre-existing, unrelated to this branch
- QA agent couldn't test Contentful UI via Playwright — mixed content (HTTPS Contentful + HTTP localhost) blocks the iframe in headless mode. Use headed Chrome with mixed content allowed for manual QA.
