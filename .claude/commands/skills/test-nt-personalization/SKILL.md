---
name: test-nt-personalization
description: Comprehensive Ninetailed personalization verification agent. Uses Playwright MCP to visually confirm variant swaps, monitors NT API network calls, cross-references Contentful entry config, and supports both nav-trigger and direct profile injection test paths. Invoke when user says "test personalization", "verify NT", "check if personalization works", "test the demo flow", "does the variant swap work", or "debug Ninetailed".
version: 3.0.0
author: casey-lisak
---

# Test NT Personalization Skill (v3)

End-to-end Ninetailed verification. Reads config from Contentful, validates entries are wired correctly, then runs visual browser tests using Playwright MCP. Does not assume anything hardcoded.

**Do not skip any phase. Do not run headless. Visual confirmation is required.**

---

## Architecture notes (read before debugging)

### How NT personalization renders (post-2026-04-27 fix)

The `<Experience>` component in `block-renderer.tsx` gets all NT experiences from a React context (`NtExperiencesContext` in `ninetailed-nextjs.tsx`), NOT from `data.ntExperiencesCollection`. This bypasses the `PAGE_BY_SLUG` byte limit (LL-011) which omits `ntExperiencesCollection` from page queries.

The SDK evaluates audience rules client-side via `LocalAudienceEvaluator` + `useSDKEvaluation: true`. No NT cloud call needed for audience matching — it's fully local.

Distribution is hash-deterministic by profile ID. A 90% distribution means most profiles see Variant 1.

### What `experienceVariantIndexes: {}` means

An EMPTY `{}` is NORMAL and EXPECTED on page load. It means there's no preview-panel override active. The SDK chose the variant via natural distribution (hash of profile ID). The React `<Experience>` component reads from the SDK's `useESR()` hook, which reflects the natural evaluation — not `experienceVariantIndexes`. You can't use `experienceVariantIndexes` to diagnose whether personalization is working. Check the rendered DOM instead.

### Gear icon preview panel

The preview panel (gear icon in nav) works. It opens a sidebar listing all audiences and their linked experiences with Baseline/Variant 1 radio buttons. The panel is in a cross-origin iframe so Playwright cannot click its radio buttons programmatically. Use `window.ninetailed.plugins.preview.toggle()` to open/close it via `browser_evaluate`.

---

## Phase 0 — Pre-flight

1. Confirm dev server is running: `lsof -ti :3000` — if empty, tell user to run `bun run dev` and wait.
2. Read `.env.local` from the active worktree. Extract:
   - `CONTENTFUL_SPACE_ID`
   - `CONTENTFUL_ENVIRONMENT`
   - `NEXT_PUBLIC_NINETAILED_API_KEY`
   - `NEXT_PUBLIC_NINETAILED_ENVIRONMENT`
3. Confirm `NEXT_PUBLIC_NINETAILED_ENVIRONMENT` matches the Contentful environment name — mismatch here causes silent NT failures.

---

## Phase 1 — Contentful config cross-reference (catches config bugs before browser)

Use Contentful MCP to validate everything is wired correctly before touching the browser.

**1a. Fetch all NT experiences**
`search_entries: content_type = nt_experience`
For each experience, check:
- `ntExperienceId` is set (must NOT be empty — this is what the SDK uses for matching)
- `ntAudience` is linked (not null)
- `ntVariantsCollection` has at least 1 item
- `ntConfig` (nt_config) is NOT empty `{}` — must have `{ components: [...], distribution: [...] }` shape
- The variant item's `sys.id` resolves to a real published entry

**1b. Fetch all NT audiences**
`search_entries: content_type = nt_audience`
For each audience, extract:
- `ntAudienceId` — must equal `sys.id` (mismatch breaks SDK matching silently)
- `ntRules` — find `type: 'identify'` conditions: extract `key` and `value`
- `ntRules` — find `type: 'page'` or `type: 'url'` conditions: extract the trigger URL

**1c. Validate nt_config format**
For each experience, `ntConfig` must match:
```json
{
  "components": [{
    "baseline": { "id": "<baseline-entry-sys-id>" },
    "variants": [{ "id": "<variant-entry-sys-id>" }]
  }],
  "distribution": [0.1, 0.9],
  "traffic": 1
}
```
`baseline.id` must match the Contentful sys.id of the block being personalized (e.g. the Hero entry).
`variants[].id` must match the sys.id of the variant entry.
Empty `nt_config: {}` = experience is broken and will always show baseline.

**1d. Fetch each variant entry**
- Note the variant field values — these are what you expect to see after audience activates

**1e. Build the scenario map**
```
{
  label: "Kaz Test Hero",
  experienceId: "7BPYMahwIjywrCk6RIA4Y6",  // ntExperienceId (NOT sys.id)
  baselineSysId: "<hero-entry-sys-id>",
  variantSysId: "<variant-entry-sys-id>",
  baselineValue: "Hero headline",
  variantValue: "Personalized Hero headline",
  distribution: "10% baseline / 90% variant"
}
```

Present the scenario map. If any `nt_config` is empty or baseline/variant IDs don't resolve, flag as config bug.

---

## Phase 2 — Visual browser test (Playwright MCP)

Use `mcp__playwright__browser_navigate`, `mcp__playwright__browser_evaluate`, `mcp__playwright__browser_snapshot`, `mcp__playwright__browser_take_screenshot`, `mcp__playwright__browser_network_requests`, and `mcp__playwright__browser_console_messages`.

### Step 2a — Fresh page load check (primary test)

The simplest and most reliable test: load the page and check the DOM.

```
browser_navigate: http://localhost:3000/page/home
browser_wait_for: { time: 2000 }
browser_evaluate: ({
  heroH1: document.querySelector('main h1')?.innerText,
  ntReady: !!window.ninetailed,
  experienceVariantIndexes: window.ninetailed?.plugins?.preview?.experienceVariantIndexes,
})
browser_take_screenshot → /tmp/nt-fresh-load.png
```

If `heroH1` matches a variant value → personalization is working. **Done.**

If `heroH1` matches baseline and you want to verify it's not a coincidence, reset the profile and reload:
```
browser_evaluate: window.ninetailed?.reset()
browser_navigate: http://localhost:3000/page/home
browser_wait_for: { time: 2000 }
browser_evaluate: document.querySelector('main h1')?.innerText
```
Note: After reset, a new profile ID is generated. With 90% distribution, most resets will still show the variant.

### Step 2b — Network monitoring
```
browser_network_requests
```
Look for calls to `*.ninetailed.io`. Confirm:
- Status 200
- Request contains the NT API key

If NT API calls fail → key or environment mismatch. Check `NEXT_PUBLIC_NINETAILED_API_KEY` and `NEXT_PUBLIC_NINETAILED_ENVIRONMENT`.

### Step 2c — Console error check
```
browser_console_messages
```
Look for errors containing: `ninetailed`, `experience`, `audience`, `variant`, `profile`. Any errors indicate SDK misconfiguration.

### Step 2d — Preview panel check
```
browser_evaluate: window.ninetailed?.plugins?.preview?.toggle()
browser_take_screenshot → /tmp/nt-panel-open.png
```
Confirm:
- Panel opens (right sidebar titled "Personalization Preview")
- All audiences are listed
- Each audience shows its linked experiences with Baseline/Variant 1 radio buttons

Close panel:
```
browser_evaluate: window.ninetailed?.plugins?.preview?.toggle()
```

### Step 2e — Natural audience trigger path (for identify/URL-rule audiences)

```
# Navigate to trigger page via client-side nav (preserves NT state)
browser_click: nav a[href="{triggerPath}"]
browser_wait_for: { url: "**{triggerPath}", time: 2000 }
# Navigate home — NT state persists via client-side nav
browser_click: nav a[href="/page/home"]
browser_wait_for: { time: 2000 }
browser_evaluate: document.querySelector('main h1')?.innerText  ← should match variantValue
browser_take_screenshot → /tmp/nt-after-trigger.png
```

### Step 2f — Direct profile injection (alternative / faster)
```
browser_navigate: http://localhost:3000/page/home
browser_evaluate: window.ninetailed?.identify("test-user", { ...identifyTraits })
browser_wait_for: { time: 2000 }
browser_navigate: http://localhost:3000/page/home   ← reload to pick up profile
browser_wait_for: { time: 2000 }
browser_evaluate: document.querySelector('main h1')?.innerText  ← should match variantValue
browser_take_screenshot → /tmp/nt-inject.png
```

---

## Phase 3 — Results table

| Scenario | nt_config valid | NT API 200 | Variant Rendered | Status |
|----------|----------------|-----------|-----------------|--------|
| Hero — Kaz Test | ✅ | ✅ | ✅ | ✅ PASS |

Screenshot paths for each step.

---

## Phase 4 — Failure diagnosis checklist

Work through in order — most bugs are config, not code:

1. **`nt_config` is empty `{}`** — The `nt_config` JSON field on the NT experience entry is empty or missing `components`. The SDK can't determine what baseline/variant to swap. Fix: update `ntConfig` in Contentful with correct `components[].baseline.id` and `components[].variants[].id`. This was the bug on Banner and Newsletter Form experiences (2026-04-27).

2. **`NtExperiencesContext` empty** — If `block-renderer.tsx` reads from context and gets `[]`, all `<Experience>` components show baseline. Check `ninetailed-nextjs.tsx` exports `NtExperiencesContext` and wraps children with it. Check `block-renderer.tsx` imports `useNtExperiences` and uses the context. This was the root cause discovered 2026-04-27: `PAGE_BY_SLUG` omits `ntExperiencesCollection` from block queries (LL-011), so `isPersonalized(data) = false` and `experiences=[]` for every block.

3. **`ntExperienceId` ≠ `sys.id`** — The `ntExperienceId` field must be set to the entry's own `sys.id`. The SDK uses `ntExperienceId` as the key in `experienceVariantIndexes`. Mismatch = experience never matches. Check `ntExperienceId` field value in Contentful editor vs the entry's `sys.id` in the URL.

4. **`ntAudienceId` ≠ `sys.id`** — Same as above but for audiences. Fix in Contentful entry.

5. **Environment mismatch** — `NEXT_PUBLIC_NINETAILED_ENVIRONMENT` in `.env.local` must exactly match the NT environment name (e.g. `main`).

6. **NT API empty experiences** — Network shows 200 but experiences array is empty. Confirm experiences are published in the NT dashboard under the correct environment.

7. **Variant entry unpublished** — NT fetches variants by entry ID. If the variant entry is draft-only, NT skips it. Publish it.

8. **ntRules shape malformed** — NT SDK expects `{ any: [{ all: [condition] }] }`. Malformed rules evaluate silently to false.

9. **`NinetailedPreviewPlugin` re-instantiated every render** — `new NinetailedPreviewPlugin(...)` was inline in JSX render, causing v7.9+ singleton enforcement to reset variant state. Fix: wrap in `useMemo` in `ninetailed-nextjs.tsx`. Already fixed as of 2026-04-27.

10. **PageTracker missing on trigger page** — Check `src/app/[trigger-slug]/page.tsx`. Must render `<PageTracker traits={{ [key]: '[value]' }} />`. Missing = audience never activates via nav.

---

## Phase 5 — Post-test checklist

- [ ] Fresh page load shows variant content in DOM
- [ ] NT API calls returning 200 in network log
- [ ] No NT errors in console
- [ ] Preview panel opens and lists all audiences + experiences
- [ ] Screenshots saved for: fresh load, panel open, post-trigger/inject
- [ ] `nt_config` validated for all experiences (non-empty, baseline/variant IDs correct)

If all pass: **"Personalization verified — all [N] scenarios pass."**
If any fail: Report exact failure point from Phase 4 diagnosis checklist.
