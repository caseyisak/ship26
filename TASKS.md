# Migration tasks

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

## /page/kaz-test 404 (live preview debug)

**Preview URL used:** `https://app.contentful.com/spaces/uumzxfocy3ef/entries/6yuInMRWMJc5kKiFtW4gea/preview/...`

**Checked:** [x] browser (navigated to app URL `http://localhost:3000/page/kaz-test`), [x] terminal (origin + request logs), [ ] browser network/console (MCP returned metadata only).

**Terminal:** `GET /api/enable-draft?secret=kaz&slug=kaz-test&locale=en-US&ctype=page` → 307; `GET /page/kaz-test` → **404**. So enable-draft redirects correctly to `/page/kaz-test`, but `getPageBySlug({ slug: 'kaz-test', locale: 'en-US' })` returns null.

**Diagnosis:** The 404 means **no Page in Contentful has slug `kaz-test`** (for the locale/preview context in use), or the draft cookie isn’t sent in the iframe so the app doesn’t see draft content. Ensure a **Page** entry has slug exactly `kaz-test` and is published, or that when previewing a draft Page with slug kaz-test the enable-draft cookie is applied (SameSite/iframe can block cookies).

---

## ENOENT loop (enable-draft / contentful-app)

**Situation:** Dev server logs a loop of ENOENT errors:
- `open '.../.next/server/app/api/enable-draft/[__metadata_id__]/route/app-paths-manifest.json'`
- `open '.../.next/server/app/contentful-app/page/app-build-manifest.json'`

**Cause:** Next.js/Turbopack is trying to load a route at `enable-draft/[__metadata_id__]/route/`, but the app only has `api/enable-draft/route.ts` (no `[__metadata_id__]` folder). This is Turbopack cache/metadata resolution getting out of sync—not something the Hero live-preview setup introduced in source (there is no such folder).

**Fix:**
1. **Clear build and restart:** `rm -rf .next && bun run dev`. (Done once; restart dev yourself.)
2. **If the loop returns:** Run without Turbopack: `bun run dev:no-turbopack` (uses `next dev` only). Use this when debugging live preview / enable-draft until Turbopack is fixed.

**404 on /page/kaz-test after clearing cache:** enable-draft returns 307 and redirects; GET /page/kaz-test returns 404 because `getPageBySlug({ slug: 'kaz-test', locale: 'en-US' })` returns null. Page entry exists in Contentful (slug kaz-test). Dev-only logging was added in `getPageBySlug`: on null page you’ll see `[getPageBySlug] No page for slug=... items.length=...`; on throw you’ll see `[getPageBySlug] kaz-test en-US` + error. **Next:** Restart dev, open http://localhost:3000/page/kaz-test (or trigger preview again), then check the terminal for the `[getPageBySlug]` line to see whether the API returned 0 items or an error.
