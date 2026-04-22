# Handoff — Integration Simulator App Config Screen
**Date:** 2026-04-22  
**Branch:** `main`  
**Status:** Active — one remaining issue, root cause identified

---

## What Got Done This Session

### Bug fixes (committed to main)

**Commit `92fbf83`** — 3 bugs from port 3002→3000 migration:
1. `src/app/contentful-app/integration-simulator/page.tsx` — hardcoded `localhost:3002` → `localhost:3000` in display text
2. `src/app/preview/pdp/[entryId]/page.tsx` — PDP live preview was missing Navbar/Footer; added both + `getSettings()` for footerForm
3. `src/contentful-app/integration-simulator/config-screen.tsx` — `onConfigure` handler now returns `targetState: { EditorInterface }` so Contentful auto-assigns field appearance to the app on save

**Commit `cde2bb9`** — Catalog migration:
- Added `productCatalog` (JSON) and `assetCatalog` (JSON) fields to Settings CT in Contentful
- Populated both with the full seed catalog data via Contentful MCP
- Updated `src/app/api/catalog/route.ts` to read from `getSettings()` with fallback to `seed-data.ts`
- `seed-data.ts` stays as fallback but is no longer the source of truth

### Uncommitted local changes (need to commit next session)
- `next.config.ts` — added `**/metafi-worktrees/**` to webpack `watchOptions.ignored` (stops ENOENT errors from deleted worktree)
- `src/app/contentful-app/integration-simulator/page.tsx` — improved location detection + diagnostic error UI (see below)

---

## Active Issue: App Config Screen SDK Location

### Symptom
When navigating to the Integration Simulator app installation config page in Contentful, the config screen renders but crashes immediately:
```
TypeError: Cannot read properties of undefined (reading 'getParameters')
at config-screen.tsx:88 → appSdk.app.getParameters()
```

### Root Cause (confirmed from SDK source)
Read `node_modules/@contentful/app-sdk/dist/cf-extension-api.js` end-to-end. Key finding:

The SDK object is built from a location lookup table:
```js
K["app-config"] = [U, function(e) { return { app: F(e) }; }]
```
`sdk.app` is **only added when `t.location === 'app-config'`**. For all other locations, `sdk.app` is undefined.

Since `sdk.app` is undefined at runtime, Contentful is initializing the SDK with a location other than `'app-config'`.

### Current page.tsx state (after fixes)
The page now:
1. Detects the actual location by testing all `locations.*` constants
2. Logs: `[IntegrationSimulator] detected location: <name> | sdk.app defined: <bool>`
3. Correctly renders each component only when location matches
4. Shows a red diagnostic error if SDK is present but location is unrecognized — includes the detected location name

### What to do next

**Step 1: Check the browser console**  
Open the app installation config page in Contentful, open DevTools → Console inside the iframe, look for:
```
[IntegrationSimulator] detected location: ???  | sdk.app defined: false
```
This will tell you exactly what location string Contentful is sending.

**Step 2: Verify App Definition has `app-config` registered**  
Go to Contentful → Apps (top nav) → Integration Simulator → Edit App Definition  
Under "Locations", confirm `App configuration` is checked/enabled.

If it's NOT checked: enable it, save, then reload the app installation page. The SDK will now send `app-config` and `sdk.app` will be defined.

If it IS checked but location is still wrong: the URL the browser is navigating to (`/apps/app_installations/35DgPLQ0MS8z9tl4Ov7hFL/`) may be an app management page rather than the actual config screen. Try accessing it via Apps → Integration Simulator → Configure instead.

**Step 3: Likely no code changes needed**  
Once the App Definition has `app-config` registered, the existing code path works:
```tsx
if (sdk && isConfig) return <IntegrationSimulatorConfig sdk={sdk} />;
```
The config screen will receive a proper SDK with `sdk.app` defined.

---

## Files Modified This Session

| File | Change |
|------|--------|
| `src/app/contentful-app/integration-simulator/page.tsx` | Location detection, diagnostic error UI, debug console.log |
| `src/app/preview/pdp/[entryId]/page.tsx` | Added Navbar, Footer, getSettings |
| `src/contentful-app/integration-simulator/config-screen.tsx` | `onConfigure` returns `targetState` |
| `src/app/api/catalog/route.ts` | Reads from Settings CT with seed-data fallback |
| `next.config.ts` | Added `**/metafi-worktrees/**` to watchOptions.ignored |
| `~/.claude/mcp_settings.json` | Added `--headed` flag to Playwright MCP |

---

## Context to Load Next Session

- Read `documentation/handoff-2026-04-22-integration-simulator-config.md` (this file)
- Run `git log --oneline -5` to see recent commits
- The main working question: **what location is Contentful sending?** — browser console will answer this immediately
