# Current State & Roadmap

## Main branch — what's in it (as of 2026-03-19)

All blocks are committed to `main`. This is the source of truth.

| Block | Component | Status |
|-------|-----------|--------|
| Hero | cms-components/hero | ✅ done, section style editor, custom grid |
| FAQ | cms-components/faq | ✅ done |
| TabbedContent | cms-components/tabbed-content | ✅ done |
| Features | cms-components/features | ✅ done, animation registry |
| DataViz | cms-components/data-viz | ✅ done, 5 chart types, interactive legend |
| Blog | cms-components/blog-post | ✅ done, rich text, sticky TOC, live preview |

## Demo System (building)

**Philosophy:** `main` = clean sandbox with all blocks. Every customer demo = branch off main.

### Phases

**Phase 1 — Demo loop structure** (next)
- [ ] Create `demo-loops/` folder structure
- [ ] Extract Bears mobile app viewer as generic `multi-channel` demo loop
- [ ] Write `multi-channel/bundle.sh` seed script

**Phase 2 — Brand scraper**
- [ ] Firecrawl scrape → extract CSS design tokens (colors, fonts, spacing)
- [ ] Auto-generate `[data-theme='customer']` CSS block
- [ ] Store in `demo-loops/[loop]/theme/`

**Phase 3 — Asset bundles / component docs**
- [ ] Document every block (fields → Contentful mapping, setup steps)
- [ ] Contentful migration script per block (`contentful/content-types/`)
- [ ] Seed entries JSON per block
- [ ] One-command env setup: `scripts/demo-setup/[customer].sh`

**Phase 4 — Slides integration**
- [ ] DEMO_SCRIPT.md template per demo
- [ ] Link to contentful-pptx skill for auto-deck generation

---

# Migration tasks (archived)

## Features block (branch: feat/features-block)

**Goal:** Contentful-driven features section (label, title, description, 2–4 feature cards with optional animation key or image). No variant field; reusable animation registry; personalization field present for later wiring.

### Done

1. **Reusable animation registry** (`src/lib/feature-visual-registry.tsx`): `FEATURE_VISUAL_KEYS` and `getFeatureVisualComponent(key)` so animations can be referenced by key (e.g. `checkout`, `recurring-billing`, `invoicing`, `payment-link`) and reused elsewhere.
2. **Types:** `FeaturesFragment`, `FeatureItemFragment` in `block-renderer/types.ts` (label, title, description, itemsCollection, ntExperiencesCollection; item: title, description, image, animationKey).
3. **GraphQL:** `FEATURE_ITEM_FIELDS`, `FEATURES_FIELDS` in `queries.ts`; included in `PAGE_BY_SLUG` sectionsCollection.
4. **Page mapper:** `RawFeatures`, `RawFeatureItem`, `mapFeatureItem`, `mapFeatures`; `mapSection` extended; `PageSection` includes `FeaturesFragment`.
5. **Component:** `src/cms-components/features/features.tsx` — live preview hooks, flexible grid (1 col or 2 cols for 2–4 items), FeatureCard uses registry for `animationKey` or image (LL-008: check both `image` and `media`).
6. **Block config:** Features registered in `block-renderer/configs/index.ts` with `typename: 'Features'`.
7. **Test:** `block-renderer.test.tsx` includes “renders Features with mock Features data”; `@/lib/feature-visual-registry` mocked so motion-based animations aren’t loaded. *(Note: full test run still hits a pre-existing motion package error when loading TabbedContent; Features test is in place for when that’s fixed.)*

7. **Milestone 3 (Contentful):** Content types **features** and **featureItem** created and published. Four Feature Item entries published: Checkout, Recurring Billing, Invoicing, Payment Link (IDs: `2lpBH3VFIOtLA596MoVyZ4`, `42ef4xXeOZ22vpWNnR2Y2e`, `7GXKVp2aQfIvLDjkqS6fNN`, `Vro4jZbk7rla4hrKNT86n`). One Features entry "Homepage Features" created and published (ID: `6sAqLv0XQlh4b3ipvEg5qH`) with all four items linked. Add this Features entry to a Page’s sections in Contentful to see it on the site.

### Next

- **Page sections:** In Contentful, edit a Page (e.g. Home) and add the Features entry (`6sAqLv0XQlh4b3ipvEg5qH`) to the sections field so the Features block appears on the page.
- **Personalization:** You will wire the block to the personalization app after creation; `ntExperiencesCollection` is already on the fragment and in the query.

### Content model (for MCP)

- **Features:** internalName, label (Symbol), title (Symbol), description (Text), items (References → Feature Item, many), ntExperiences (References → NtExperience if needed).
- **Feature Item:** title (Symbol), description (Text), media (Asset, optional), animationKey (Symbol, optional; one of checkout, recurring-billing, invoicing, payment-link or future keys in registry).

---

## Current hypothesis

- Migration happens **in this repo** (metafi-nextjs-shadcnblocks). No separate fork folder.
- Contentful plumbing is copied from colorful-demo-2.0 into this repo; metafi components are adapted to be CMS-driven.
- Each milestone has a test gate; we do not move on until tests and build pass.

## Milestone 4 — Full flow from Contentful (done)

**Goal**: Real Contentful client; page from Contentful; Live Preview in browser. Build passes; manual: open preview URL and see Hero.

### Done

1. Contentful GraphQL client (`services/contentful/client.ts`), Page + Hero query (`queries.ts`).
2. `getPageBySlug` / `getPageSlugs` fetch from Contentful; preview token when `draftMode().isEnabled`.
3. enable-draft: fallback cookie when `draft.enable()` throws (Turbopack).
4. Tests and build pass.

### Results

- **Milestone 0**: Vitest added; `src/lib/utils.test.ts` (2 tests) passes; `npm run build` passes. ✓
- **Milestone 1**: BlockRenderer plumbing added (types, utils, configs, error components, logger, x-ray, personalization stub). `src/block-renderer/block-renderer.test.tsx` (3 tests) passes; `npm run build` passes. ✓
- **Milestone 2**: Hero + BlockRenderer + page route; mock getPageBySlug; `src/block-renderer/block-renderer.test.tsx` (4 tests) passes; `npm run build` passes. ✓
- **Milestone 3**: Draft mode + Live Preview; enable-draft/disable-draft API routes; LivePreviewProvider + Hero inspector; `src/app/api/enable-draft/route.test.ts` (3 tests) passes; `npm run build` passes. ✓
- **Dev 500 fix**: Clearing `.next` and restarting dev fixes the "missing required error components" 500; `/page/home` returns 200. Use `bun run dev` when bun is in PATH, else `npm run dev`.
- **Milestone 4**: Contentful GraphQL client + Page/Hero query; real getPageBySlug/getPageSlugs; enable-draft fallback cookie; tests and build pass. ✓

---

## Checklist (do not proceed until current milestone passes)

- [x] Milestone 0: `npm run test` and `npm run build` pass
- [x] Milestone 1: Plumbing copied; build passes; BlockRenderer import test passes
- [x] Milestone 2: Hero + BlockRenderer + page route; build + render test pass
- [x] Milestone 3: Draft mode + Live Preview on Hero; build + draft API test pass
- [x] Milestone 4: Full flow from Contentful; build + manual/e2e pass

---

## Section style editor (branch: section-style-editor)

**App URL on localhost:** `http://localhost:3000/contentful-app`

- Contentful app at `/contentful-app` (entry-field + entry-editor); Section style editor UI with "Use style override", collapsible Background and Layout sections.
- Hero consumes `sectionStyle` (JSON) and `image`; switch for default vs override (overlay/split, blur, overlay color).
- Contentful setup: add Hero field `sectionStyle` (JSON), ensure `image` (Asset); create app with both locations; assign to field and/or entry editor.
- **App URL in Contentful:** Use full URL `http://localhost:3000/contentful-app`. If Contentful loads only the root (homepage in iframe), we redirect `/` → `/contentful-app` when loaded in an iframe (`ContentfulAppRedirect` in root layout).

**GraphQL codegen:** This repo does **not** use GraphQL codegen (no `codegen.ts` or script). Hero fields `sectionStyle` and `image` were added manually in `queries.ts` and `block-renderer/types.ts`; that is the source of truth. No codegen needed unless you add it later.

**Section style editor fixes (2025-02-03):**
1. **Height:** `useAutoResizer({ absoluteElements: true })` in a wrapper only when in iframe; iframe now resizes to content so no scroll inside entry.
2. **Forma-36:** Added `@contentful/forma-36-tokens`; `contentful-app.css` imports F36 tokens; section-style-editor uses F36 gray/blue, border-radius, spacing for Contentful-native look.
3. **Layout buttons:** Hero was reading `sectionStyle` from initial `data` only. Now uses `(liveData as HeroFragment).sectionStyle ?? data.sectionStyle` so Overlay center/left/right (and Split 50%/33%) updates in Live Preview when buttons are clicked. Ensure "Use style override" is ON for layout to apply.

**404 for `/page/kaz-test`:** Not caused by the Section Style app. A 404 means no page in Contentful has slug `kaz-test`. If you don’t have a page with that slug, the 404 is expected (e.g. from a link or bookmark). If you do have that page, the bug would be in `getPageBySlug`/slug resolution.

---

## Section Style in Contentful: "missing required error components, refreshing…"

**Situation:** In Contentful, the Section Style field shows "missing required error components, refreshing…" instead of the editor UI.

**Console findings (confirmed):**
- **Mixed Content:** "The page was loaded over HTTPS, but requested an insecure element" (×5). Contentful is HTTPS; the app iframe points at `http://localhost:3000`. Browsers block or restrict HTTPS pages embedding HTTP iframes, so the app iframe may not load properly.
- Other lines: Apollo DevTools ad, LaunchDarkly, osano sandbox warnings, Next image aspect-ratio warning, Contentful workflow 422 — none explain the Section Style blank/error.

**Root cause:** Mixed content. Use an **HTTPS** URL for the Section Style app when running inside Contentful.

**Fix — use HTTPS for the app URL:**
1. **Option A (recommended):** Run dev with HTTPS and point Contentful at `https://localhost:3000/contentful-app`:
   - `bun run dev:https` (uses Next.js `--experimental-https`; first run may prompt to trust the self-signed cert).
   - In Contentful app settings, set App URL to **`https://localhost:3000/contentful-app`** (not `http://`).
2. **Option B:** Use a tunnel (e.g. ngrok): `ngrok http 3000` → use the HTTPS URL ngrok gives you, e.g. `https://xxxx.ngrok.io/contentful-app`, as the app URL in Contentful.

**Changes made (code):**
- `contentful-app/layout.tsx`: mount `SDKProvider` only on the client (SSR-safe).
- `contentful-app/loading.tsx`: loading boundary.
- `package.json`: added `dev:https` script for HTTPS local dev.

---

## Hero live preview (ID-based, no slug)

**Goal:** Preview Hero entries in Contentful live preview without a page/slug. Use entry ID in the URL.

**Implemented:**
- `GET /preview/hero/[entryId]` — Renders only the Hero component with live preview. Uses draft mode when enabled (e.g. after redirect from enable-draft).
- `getHeroByEntryId` in `services/contentful/hero.ts`; `HERO_BY_ID` query in `queries.ts`.
- enable-draft API accepts `entryId` + `type=hero` and redirects to `/preview/hero/[entryId]` with draft cookie set.
- `LivePreviewProviderWrapper` now receives `space` and `environment` from layout so live updates connect.

**Contentful live preview URL for Hero content type:**

Use this as the **Preview URL** in Contentful (Settings → Content preview → add/edit preview for **Hero**):

```
https://<YOUR_APP_ORIGIN>/api/enable-draft?secret=<CONTENTFUL_PREVIEW_SECRET>&entryId={{entry.sys.id}}&type=hero
```

Replace:
- `<YOUR_APP_ORIGIN>` — e.g. `https://yoursite.com` or `http://localhost:3000`
- `<CONTENTFUL_PREVIEW_SECRET>` — same value as `CONTENTFUL_PREVIEW_SECRET` (or `PREVIEW_SECRET`) in your app env

Contentful merge tag for entry ID: `{{entry.sys.id}}` (or the equivalent in your Contentful UI). After opening preview, Contentful iframes your app; enable-draft redirects to `/preview/hero/<entryId>` with draft mode on, so the Hero loads with live updates.

**Success:** Open a Hero entry in Contentful → open Live Preview → see the Hero in the iframe; edits in Contentful reflect live.

**Hero preview 404 fix (ctfl-live-preview-debug):**
- **Situation:** `GET /preview/hero/6yUhVoaCfb1sBoHCKgBlrY` returned 404; Contentful MCP showed Hero entry exists.
- **Checked:** [x] terminal (origin `http://localhost:3000`, GET preview/hero → 404), [x] Contentful MCP (get_entry for Hero: content type `hero`, field for asset is **media** not image).
- **Cause:** GraphQL queries used `image { url }` but this space’s Hero content type has field **media** (Asset). Query failed → `getHeroByEntryId` returned null → `notFound()`.
- **Fix:** In `queries.ts` use `media { url }` for Hero in PAGE_BY_SLUG and HERO_BY_ID. In `hero.ts` and `page.ts`: RawHero type and mappers use `media` from API and map to `image` for HeroFragment (component still uses `data.image`). After fix: `GET /preview/hero/6yUhVoaCfb1sBoHCKgBlrY` → 200.

---

## Section Style: "Must be of type Object" (fixed)

**Situation:** After toggling "Use style override" on, Contentful showed "The type of 'value' is incorrect, expected type: Object" / "Must be of type Object."

**Cause:** Contentful JSON field validation expects an **Object**; the app was calling `field.setValue(JSON.stringify(config))` (string).

**Fix (code):**
- `section-style-editor.tsx`: `persist()` now calls `field.setValue(next)` with the object, not a string.
- On load: if field value is null/empty, persist `DEFAULT_SECTION_STYLE_CONFIG` so the field is valid; if value is a string (e.g. from an older version), persist the parsed object so validation passes.

---

## Live preview: refreshing when section references change

**Finding (exploration):** Contentful Live Preview SDK has two subscription events:
- **`edit`** — ENTRY_UPDATED: editor pushes **field-level** changes (e.g. text); LiveUpdates merges into subscribed data. Used in `page-content-live.tsx` with `router.refresh()`.
- **`save`** — ENTRY_SAVED: fired when the user **saves** the entry in the editor (no payload). Reference changes (add/remove/reorder sections) are typically committed on save, not as incremental edits.

**Current behavior:** This repo only subscribes to `'edit'`. So when you add, remove, or reorder section references on a Page, the preview does **not** refresh until you publish and reload—because those changes don’t trigger ENTRY_UPDATED the same way field edits do; they’re reflected on **save**.

**Demo 2.0 (colorful-demo-2.0-1):** No explicit `subscribe('edit')` or `subscribe('save')` at page level; only `useContentfulLiveUpdates` in components for field-level updates. So demo 2.0 does **not** implement full-page refetch on reference change either. Contentful’s “no client components” approach in the docs uses `subscribe('save', { callback })` then revalidate + reload to pick up structural/reference changes.

**Recommendation:** In `page-content-live.tsx`, also subscribe to `'save'` and call `router.refresh()` in its callback, so that when the user saves the Page (after changing sections), the iframe refetches and shows the new section list.

**Implemented:** `page-content-live.tsx` now subscribes to both `'edit'` and `'save'`; on either, it calls `router.refresh()`. Please test: change section references (add/remove/reorder) in the Contentful editor, save (without publishing), and confirm the preview iframe updates.

**Debug (section add/remove not updating iframe):**
- **Hypothesis:** Either (1) the editor never sends ENTRY_SAVED to the preview iframe, or (2) the SDK doesn’t invoke our save callback (e.g. init/registration order), or (3) router.refresh() doesn’t refetch draft content in the iframe.
- **Instrumentation added:** In dev, `page-content-live.tsx` logs: `[PageContentLive] subscribed to edit`, `[PageContentLive] subscribed to save` on mount; `[PageContentLive] save callback → router.refresh()` / `edit callback → router.refresh()` when callbacks run; and `[PageContentLive] postMessage received` for any ENTRY_SAVED/ENTRY_UPDATED message reaching the iframe. Open the **preview iframe’s** console (e.g. Chrome: DevTools → top frame dropdown → select the iframe that shows your app) to see these.
- **Next:** Run reproduction steps and report: (A) Do you see `subscribed to save` on load? (B) When you add Features to sections and click Save, do you see `postMessage received { method: 'ENTRY_SAVED' }`? (C) Do you see `save callback → router.refresh()`? That will show whether the message arrives and whether the SDK calls our callback.
- **Contentful debug skill:** `.cursor/skills/contentful-live-preview-verify/SKILL.md` + rule `.cursor/rules/contentful-live-preview-debug.mdc`. Verify skill uses agent-browser to switch into iframe (`frame "iframe[src*='localhost']"`) and capture console/network. Agent navigated to `http://localhost:3000/page/kaz-test` to mirror iframe; MCP returned metadata only. **Screenshot (user):** iframe console shows multiple 404s—need **Request URL** for each 404 from Network tab to fix.

**Agent-browser run (2026-02-05):** Headed Chromium → Contentful kaz-test entry → viewport 1800×1200 → full-page screenshots: `.cursor/live-preview-1-initial.png`, `.cursor/live-preview-2-after-add-features.png` (after adding Features; preview did not update), `.cursor/live-preview-3-after-publish-refresh.png` (after Publish + Refresh preview). Then `agent-browser frame "iframe[src*='localhost']"` → console, errors, network. **Evidence:** (1) `[PageContentLive] postMessage received {method: ENTRY_SAVED}` appears—editor does send ENTRY_SAVED to iframe. (2) `[PageContentLive] save callback → router.refresh()` **not** seen in log—SDK may not be calling our save callback when ENTRY_SAVED is received, or callback runs but refresh doesn’t refetch draft. (3) React duplicate key: same section entry (Features) added twice → key `6sAqLv0XQlh4b3ipvEg5qH` duplicated. **Fix applied:** `page-content-live.tsx` section key changed to `` `${section.sys.id}-${index}` `` so the same entry can appear multiple times. Full report: `.cursor/live-preview-diagnostic-report.md`. Logs: `.cursor/live-preview-iframe-console.txt`, `.cursor/live-preview-iframe-errors.txt`, `.cursor/live-preview-iframe-network.txt`.

**Root cause (SDK save callback):** With `enableInspectorMode` on, the SDK only invokes the save callback when the saved entry’s ID is in the **tagged** list (entries with getProps on the page). The **Page** entry is not tagged, so saving the Page never ran our callback. **Fix:** In `page-content-live.tsx`, listen to `postMessage` for `ENTRY_SAVED` and call `router.refresh()` when `e.data.entity.sys.id === page.sys.id`. Verified in agent-browser: after refresh preview + edit+save, iframe console showed `ENTRY_SAVED { entityId, pageId, match: true }` and `ENTRY_SAVED for this page → router.refresh()`.

---

## /page/kaz-test 404 (live preview debug)

**Preview URL used:** `https://app.contentful.com/spaces/uumzxfocy3ef/entries/6yuInMRWMJc5kKiFtW4gea/preview/...`

**Checked:** [x] browser (navigated to app URL `http://localhost:3000/page/kaz-test`), [x] terminal (origin + request logs), [ ] browser network/console (MCP returned metadata only).

**Terminal:** `GET /api/enable-draft?secret=kaz&slug=kaz-test&locale=en-US&ctype=page` → 307; `GET /page/kaz-test` → **404**. So enable-draft redirects correctly to `/page/kaz-test`, but `getPageBySlug({ slug: 'kaz-test', locale: 'en-US' })` returns null.

**Diagnosis:** The 404 means **no Page in Contentful has slug `kaz-test`** (for the locale/preview context in use), or the draft cookie isn’t sent in the iframe so the app doesn’t see draft content. Ensure a **Page** entry has slug exactly `kaz-test` and is published, or that when previewing a draft Page with slug kaz-test the enable-draft cookie is applied (SameSite/iframe can block cookies).

---

## ENOENT loop (enable-draft / contentful-app) — FIXED

**Situation:** Dev server logs a loop of ENOENT errors:
- `open '.../.next/server/app/api/enable-draft/[__metadata_id__]/route/app-paths-manifest.json'`
- `open '.../.next/server/app/contentful-app/page/app-build-manifest.json'`

**Cause:** Next.js 15.1.1 + Turbopack has a bug where manifest files aren't regenerated during hot reload. Turbopack cache/metadata resolution gets out of sync, causing Next.js to look for routes that don't exist (like `[__metadata_id__]` metadata routes).

**Fix (2025-02-03):**
- **Changed default dev script:** `dev` now uses `next dev` (no Turbopack) instead of `next dev --turbopack`
- **Added Turbopack option:** Use `bun run dev:turbo` if you want to use Turbopack (faster but has this bug)
- **Result:** Code updates now work without manual cache clearing. Hot reload works correctly with standard Next.js dev server.

**Note:** This is a known Turbopack bug in Next.js 15.1.1. Once Turbopack is fixed upstream, you can switch back to using it by default.

**404 on /page/kaz-test after clearing cache:** enable-draft returns 307 and redirects; GET /page/kaz-test returns 404 because `getPageBySlug({ slug: 'kaz-test', locale: 'en-US' })` returns null. Page entry exists in Contentful (slug kaz-test). Dev-only logging was added in `getPageBySlug`: on null page you’ll see `[getPageBySlug] No page for slug=... items.length=...`; on throw you’ll see `[getPageBySlug] kaz-test en-US` + error. **Next:** Restart dev, open http://localhost:3000/page/kaz-test (or trigger preview again), then check the terminal for the `[getPageBySlug]` line to see whether the API returned 0 items or an error.

---

## /page/kaz-test 404 after FAQ component (fixed)

**Situation:** After implementing FAQ component, `/page/kaz-test` started returning 404.

**Root cause:** GraphQL query used `FaqItem` (camelCase) but Contentful GraphQL API expects `Faqitem` (capitalized first letter only, matching content type ID `faqitem`). Error: `Unknown type "FaqItem". Did you mean "Faqitem" or "FaqFilter"?`

**Fix:**
- `src/services/contentful/queries.ts`: Changed `... on FaqItem` → `... on Faqitem` in `FAQ_ITEM_FIELDS`
- `src/services/contentful/page.ts`: Changed `item.__typename !== 'FaqItem'` → `item.__typename !== 'Faqitem'` in `mapFaqItem`
- Also enabled logger to output to console for debugging

**Result:** `/page/kaz-test` now returns 200. Page loads correctly with Hero section.

**Lesson:** Contentful GraphQL type names match content type IDs exactly (capitalized first letter only). Use Contentful MCP or GraphQL introspection to verify type names.

---

## Custom Grid Layout for Section Style Editor (2025-02-04)

**Goal:** Add a Custom Grid layout mode that allows dragging and resizing tiles (Content, Media, Background) on a 6-column, 2-6 row grid.

### Implemented

1. **Types (`section-style-types.ts`):**
   - Extended `SectionStyleLayout` to include `'customGrid'`
   - Added `SectionStyleTile` interface with `id`, `gridCol`, `gridRow`, `colSpan`, `rowSpan`, `visible`
   - Added `SectionStyleConfig.gridColumns`, `gridRows`, `tiles` fields
   - Added `getDefaultTiles(hasBackground)` helper
   - Updated `parseSectionStyle` to parse Custom Grid fields

2. **Background Field:**
   - Added `background { url }` to Hero GraphQL query
   - Added `background?: { url?: string }` to `HeroFragment` type
   - Updated mappers in `page.ts` and `hero.ts`

3. **Grid Canvas (`section-grid-canvas.tsx`):**
   - Adapted from TST dashboard's `GridCanvas`
   - 6 fixed columns, 2-6 rows selectable
   - Three tile types with distinct colors: Content (teal), Media (blue), Background (slate)
   - Drag to move, drag edges to resize
   - Background tile excluded from collision detection (can go underneath)
   - Uses F36 styling tokens for native Contentful look

4. **Section Style Editor:**
   - Added Custom Grid preset button
   - Shows tile visibility checkboxes when Custom Grid is selected
   - Integrates grid canvas for visual tile arrangement
   - Auto-detects `background` asset field presence

5. **Hero Component (`hero.tsx`):**
   - Added `customGrid` layout branch
   - Renders CSS Grid with positioned tiles based on `gridCol`/`gridRow`/`colSpan`/`rowSpan`
   - Background tile rendered at z-index 0 with blur/overlay support
   - Content and Media tiles rendered at z-index 10

### Usage

1. Open a Hero entry in Contentful
2. In the Section Style editor, toggle "Use style override" ON
3. Expand "Layout / tile grid" section
4. Click "Drag and resize tiles" button to enable Custom Grid
5. Use checkboxes to show/hide Content, Media, Background tiles
6. Drag tiles to move, drag edges/corners to resize
7. Changes reflect in live preview

### Notes

- Background tile only appears if the Hero entry has a `background` asset field with a value
- Content and Media tiles cannot overlap each other
- Background tile can span underneath Content and Media

---

**Completed work is archived in [archive/tasks-archive.md](archive/tasks-archive.md).** Error patterns and fixes are in [documentation/lessons-learned.md](documentation/lessons-learned.md). At the end of each milestone, follow the `.cursor/skills/continuous-improvement` skill to archive and update.
