# Contentful Component Live Preview (ID-Based)

This guide explains how to add **ID-based live preview** for Contentful components (e.g. Hero, Quote) that don’t live on a page slug. Use it when you add a new component so you don’t hit the same issues again.

## Why ID-based preview?

- **Pages** have slugs, so preview URL can be `/page/[slug]` and enable-draft uses `slug`.
- **Components** (Hero, Quote, etc.) are entries without a slug. Contentful’s preview URL needs an **entry ID**, and the app needs a route like `/preview/hero/[entryId]` or `/preview/quote/[entryId]`.

## Checklist: Adding a New Component (e.g. Quote)

When you add a new CMS component that should have its own live preview:

1. **Preview route** — Add `src/app/preview/<componentType>/[entryId]/page.tsx` that:
   - Reads `entryId` from params and optional `locale` from searchParams.
   - Calls a service that fetches the entry by ID with `draftMode().isEnabled` for preview.
   - Renders only that component (e.g. `<BlockRenderer data={quote} />`).

2. **GraphQL query by ID** — In `src/services/contentful/queries.ts` add a query that fetches one entry by `sys.id`, e.g.:
   - `quoteCollection(where: { sys: { id: $id } }, locale: $locale, preview: $preview, limit: 1) { items { ... } }`
   - **Use the exact field names from your Contentful content type** (see “Field names” below).

3. **Service function** — In `src/services/contentful/` add a file (e.g. `quote.ts`) with `getQuoteByEntryId({ entryId, locale })` that:
   - Uses `draftMode()` and passes `preview: isEnabled` to the GraphQL client.
   - Maps the raw API response to your component’s fragment type (e.g. `QuoteFragment`).

4. **Enable-draft support** — In `src/app/api/enable-draft/route.ts`:
   - Add a branch: if `entryId` and `type === '<componentType>'` (e.g. `type === 'quote'`), validate `entryId` then redirect to `/preview/<componentType>/[entryId]` and set draft cookie.
   - **Accept both `type` and `ctype`**: Contentful may send `ctype=quote`. Use `const type = searchParams.get('type') ?? searchParams.get('ctype');` so both work.

5. **Contentful Preview URL** — In Contentful (Settings → Content preview), set the preview URL for that content type to:
   ```text
   https://<YOUR_APP_ORIGIN>/api/enable-draft?secret=<CONTENTFUL_PREVIEW_SECRET>&entryId={{entry.sys.id}}&type=quote
   ```
   Use `type=quote` or `ctype=quote`; the app accepts both. **Merge tag for entry ID:** `{{entry.sys.id}}` (or your UI’s equivalent). If this isn’t set, you’ll get 400 and a literal like `{entry.sys.id_NOT_FOUND}`.

6. **Live updates** — Ensure `LivePreviewProviderWrapper` in the root layout receives `space` and `environment` from env so Contentful live updates work in the iframe.

---

## Pitfalls to Avoid

### 1. Field names: Contentful vs GraphQL vs your code

- Contentful content types use **field IDs** (e.g. `media`, `headline`). The GraphQL API exposes the same IDs.
- Your app might use a different name (e.g. `image` in the component). **In the GraphQL query, request the Contentful field name** (e.g. `media { url }`). In the service mapper, map API → app (e.g. `image: item.media ?? null`).
- **If you use the wrong field name in the query** (e.g. `image` when the type has `media`), the GraphQL request can fail and the preview route returns 404 or 500.
- **Check the content type in Contentful** (or via Contentful MCP `get_entry` / schema) and use those field names in `queries.ts`.

### 2. `type` vs `ctype` in the preview URL

- Contentful sometimes sends **`ctype`** (e.g. `ctype=hero`) instead of `type`. The enable-draft route must accept both:
  ```ts
  const type = searchParams.get('type') ?? searchParams.get('ctype');
  ```
- Otherwise the hero/quote branch is never taken and you get 400 “Missing slug or entryId+type”.

### 3. Entry ID merge tag

- The preview URL must use a merge tag that resolves to the **entry ID** (e.g. `{{entry.sys.id}}`). If it’s missing or wrong, enable-draft gets a literal string and returns 400. In Contentful, configure the preview URL for that content type with the correct merge tag.

### 4. Debug instrumentation and Turbopack

- Adding `try { fetch(logEndpoint)... } catch (_) {}` (or similar) in client components that are in the app chunk can cause Turbopack to emit invalid bundles (e.g. “Missing catch or finally after try”). Prefer logging in API routes or avoid wrapping component bodies in try/catch for logging.

---

## Reference: Hero implementation

- **Route:** `src/app/preview/hero/[entryId]/page.tsx`
- **Query:** `HERO_BY_ID` in `queries.ts` (uses `media { url }` because Hero content type has `media`, not `image`)
- **Service:** `getHeroByEntryId` in `src/services/contentful/hero.ts`
- **Enable-draft:** branch `entryId && type === 'hero'` → redirect to `/preview/hero/[entryId]`
- **Preview URL in Contentful:**  
  `https://<ORIGIN>/api/enable-draft?secret=<SECRET>&entryId={{entry.sys.id}}&type=hero`  
  (or `ctype=hero`)

---

## Minimal preview layout

- `src/app/preview/layout.tsx` wraps all `/preview/*` routes with minimal chrome so the iframe shows mainly the component. The root layout still wraps with Navbar/Footer unless you change it; for a “component only” feel, the preview layout can be minimal (e.g. a single wrapper div).

---

## See also

- **TASKS.md** — “Hero live preview (ID-based, no slug)” for the Hero 404 fix (media vs image) and exact Contentful setup.
- **README** — Contentful & Section Style Editor section for env vars and enable-draft overview.
