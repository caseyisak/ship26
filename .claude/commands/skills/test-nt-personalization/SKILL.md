---
name: test-nt-personalization
description: Comprehensive Ninetailed personalization verification agent. Uses Playwright MCP to visually confirm variant swaps, monitors NT API network calls, cross-references Contentful entry config, and supports both nav-trigger and direct profile injection test paths. Invoke when user says "test personalization", "verify NT", "check if personalization works", "test the demo flow", "does the variant swap work", or "debug Ninetailed".
version: 2.0.0
author: casey-lisak
---

# Test NT Personalization Skill (v2)

End-to-end Ninetailed verification. Reads config from Contentful, validates entries are wired correctly, then runs visual browser tests using Playwright MCP. Does not assume anything hardcoded.

**Do not skip any phase. Do not run headless. Visual confirmation is required.**

---

## ⚠️ Known blocker: Gear icon sidebar

The personalization preview sidebar (gear icon, bottom-right of page) is currently broken — reset button does nothing, no green audience indicator shows. Cannot use it to tab baseline ↔ variant until GH #37/#36 is fixed.

Workaround: Use `browser_evaluate` to call `window.ninetailed.reset()` and `window.ninetailed.identify({...})` directly, then reload and observe. This is more reliable for automation anyway.

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
- `ntAudience` is linked (not null)
- `ntVariantsCollection` has at least 1 item
- The variant item's `sys.id` resolves to a real published entry

**1b. Fetch all NT audiences**
`search_entries: content_type = nt_audience`
For each audience, extract:
- `ntAudienceId` — must equal `sys.id` (mismatch breaks SDK matching silently)
- `ntRules` — find `type: 'identify'` conditions: extract `key` and `value`
- `ntRules` — find `type: 'page'` or `type: 'url'` conditions: extract the trigger URL

**1c. Fetch the baseline component entry being personalized** (e.g. the Hero)
- Confirm `ntExperiencesCollection` has the experience linked
- Note the baseline field values (headline, ctaText, etc.) — compare against after swap

**1d. Fetch each variant entry**
- Note the variant field values — these are what you expect to see after audience activates

**1e. Build the scenario map**
For each audience with both an identify rule AND a trigger URL:
```
{
  label: "Fiber Interest",
  triggerPath: "/fiber-internet",        // from page/url rule
  identifyTraits: { interest: "fiber" }, // from identify rule
  audienceId: "56oWuinrUlYervWj6b5GlO", // ntAudienceId
  experienceId: "abc123",               // nt_experience sys.id
  baselineValue: "Fast, reliable internet for everyone",
  variantValue: "Fiber just arrived in your neighborhood"
}
```

Present the scenario map. If any scenario is missing trigger URL or identify traits, flag it as a config bug before running the browser test.

---

## Phase 2 — Visual browser test (Playwright MCP)

Use `mcp__playwright__browser_navigate`, `mcp__playwright__browser_evaluate`, `mcp__playwright__browser_snapshot`, `mcp__playwright__browser_take_screenshot`, `mcp__playwright__browser_network_requests`, and `mcp__playwright__browser_console_messages`.

### Step 2a — Baseline capture
```
browser_navigate: http://localhost:3000/page/home
browser_evaluate: window.ninetailed?.reset()
browser_wait_for: { time: 1500 }
browser_navigate: http://localhost:3000/page/home   ← reload to apply reset
browser_wait_for: { time: 2000 }
browser_take_screenshot → /tmp/nt-baseline.png
browser_evaluate: document.querySelector('h1, h2')?.innerText   ← capture baseline hero text
browser_evaluate: window.ninetailed?.plugins?.preview?.activeAudiences  ← should be []
```

### Step 2b — Network monitoring
```
browser_network_requests
```
Look for calls to `*.ninetailed.io`. Confirm:
- Status 200
- Response contains `experiences` array
- The relevant `experienceId` is present

If NT API calls fail or return empty experiences → key or environment mismatch. Check `NEXT_PUBLIC_NINETAILED_API_KEY` and `NEXT_PUBLIC_NINETAILED_ENVIRONMENT`.

### Step 2c — Console error check
```
browser_console_messages
```
Look for errors containing: `ninetailed`, `experience`, `audience`, `variant`, `profile`. Any errors indicate SDK misconfiguration.

### Step 2d — For each scenario: Nav-trigger path
```
# Navigate to trigger page via nav link (client-side nav preserves NT state)
browser_click: nav a[href="{triggerPath}"]
browser_wait_for: { url: "**{triggerPath}", time: 2000 }
browser_evaluate: window.ninetailed?.plugins?.preview?.activeAudiences
  → should now include audienceId
browser_take_screenshot → /tmp/nt-on-{label}.png

# Navigate home — client-side nav so NT state persists
browser_click: nav a[href="/page/home"] (or home nav link)
browser_wait_for: { time: 2000 }
browser_evaluate: document.querySelector('h1, h2')?.innerText  ← should match variantValue
browser_evaluate: window.ninetailed?.plugins?.preview?.experienceVariantIndexes
  → values > 0 = variant is active
browser_take_screenshot → /tmp/nt-home-after-{label}.png
```

### Step 2e — Direct profile injection path (use if nav trigger fails or for faster iteration)
```
browser_navigate: http://localhost:3000/page/home
browser_evaluate: window.ninetailed?.identify("test-user", { ...identifyTraits })
browser_wait_for: { time: 2000 }
browser_navigate: http://localhost:3000/page/home   ← reload to pick up profile
browser_wait_for: { time: 2000 }
browser_evaluate: document.querySelector('h1, h2')?.innerText  ← should match variantValue
browser_take_screenshot → /tmp/nt-inject-{label}.png
```

If nav-trigger fails but injection works → bug is in PageTracker or nav wiring, not NT config.
If injection also fails → bug is in NT config, Contentful entries, or environment keys.

---

## Phase 3 — Results table

| Scenario | Config Valid | NT API 200 | Audience Active | Variant Rendered | Hero Matches Expected | Status |
|----------|-------------|-----------|----------------|-----------------|----------------------|--------|
| Fiber Interest | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ PASS |

Screenshot paths for each step.

---

## Phase 4 — Failure diagnosis checklist

Work through in order — most bugs are config, not code:

1. **ntAudienceId ≠ sys.id** — the NT SDK uses `ntAudienceId` to match audiences. If it doesn't equal `sys.id`, the SDK silently never matches. Fix in Contentful entry.
2. **Environment mismatch** — `NEXT_PUBLIC_NINETAILED_ENVIRONMENT` in `.env.local` must exactly match the NT environment name (e.g. `main`).
3. **NT API empty experiences** — Network shows 200 but experiences array is empty. Confirm experiences are published in the NT dashboard under the correct environment.
4. **Experience not linked to baseline entry** — Fetch the baseline Hero/Banner from Contentful. If `ntExperiencesCollection` is empty, the experience was never attached. Fix in Contentful UI.
5. **Variant entry unpublished** — NT fetches variants by entry ID. If the variant entry is draft-only, NT skips it. Publish it.
6. **PageTracker missing on trigger page** — Check `src/app/[trigger-slug]/page.tsx`. Must render `<PageTracker traits={{ [key]: '[value]' }} />`. Missing = audience never activates via nav.
7. **LocalAudienceEvaluator bug** — Check `src/personalization/local-audience-evaluator.tsx`. The identify condition check must return `true` when `cond.type === 'identify'`, not `false`.
8. **ntRules shape malformed** — NT SDK expects `{ any: [{ all: [condition] }] }`. Malformed rules evaluate silently to false.
9. **Gear icon sidebar broken** — Cannot use for visual confirmation until #37/#36 is fixed. Use `window.ninetailed.plugins.preview` via `browser_evaluate` instead.

---

## Phase 5 — Post-test checklist

- [ ] All baseline hero texts captured and confirmed
- [ ] All variant hero texts confirmed different from baseline and matching Contentful entry values
- [ ] All audience IDs present in `activeAudiences` after trigger
- [ ] All `experienceVariantIndexes` show index > 0
- [ ] NT API calls returning 200 with experience data in network log
- [ ] No NT errors in console
- [ ] Screenshots saved for all scenarios + baseline
- [ ] Both nav-trigger AND injection paths tested when debugging

If all pass: **"Personalization verified — all [N] scenarios pass."**
If any fail: Report exact failure point from Phase 4 diagnosis checklist.
