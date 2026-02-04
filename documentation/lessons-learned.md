# Lessons learned

Error patterns, root causes, and fixes from this project so agents and humans don’t repeat the same mistakes. Search this doc (and the index below) before debugging Contentful or block-renderer issues.

---

## Index (quick lookup)

| ID     | Error pattern                          | Root cause                         | Quick fix |
|--------|----------------------------------------|------------------------------------|-----------|
| LL-001 | Hero/preview 404; query returns null   | GraphQL field name ≠ Contentful    | Use Contentful field name in query (e.g. `media` not `image`) |
| LL-002 | Block not rendering; wrong component   | `__typename` case or value wrong   | Query and compare use exact `__typename` (e.g. `Hero` not `hero`) |
| LL-003 | `sections` or `items` undefined        | Wrong collection shape             | Use `*Collection { items { ... } }` in GraphQL; access `.items` in code |
| LL-004 | Preview shows published only / 404     | Draft not enabled for request      | Use enable-draft flow + preview token; set App URL to HTTPS in Contentful |
| LL-005 | Rich Text shows "[object Object]"      | Rendered as object, not document   | Use `@contentful/rich-text-react-renderer` (or equivalent) to render document nodes |
| LL-006 | FAQ items filtered out; mapSection returns null | `__typename` = content type ID (not name) | Use PascalCase for content type IDs (e.g., `Faq` not `faq`) |
| LL-007 | GraphQL error: "Cannot query field X on type Y" | Array field names get "Collection" suffix in GraphQL | Use `fieldNameCollection` in GraphQL if field ID is `fieldName` |
| LL-008 | Live preview images not updating; shows old values | useLiveUpdates returns raw Contentful field names, not mapped names | Check both mapped field (image) and raw field (media) in live preview components |

---

## LL-001 — Field name mismatch (media vs image)

- **Exact error / symptom:** `GET /preview/hero/<id>` returns 404; `getHeroByEntryId` returns null even though the Hero entry exists in Contentful.
- **Root cause:** The GraphQL query requested a field name that doesn’t exist on the content type in this space (e.g. `image { url }` while the Hero content type has an Asset field named **media**). The API response doesn’t match what the code expects, so the entry is treated as missing.
- **Solution:** In `queries.ts` (and any Hero query), use the **exact** Contentful field name. If the type has `media` (Asset), use `media { url }`. In app code, map API shape to component props (e.g. `media` → `image`) in the service layer (`hero.ts`, `page.ts`).
- **Prevention:** Confirm field names in Contentful (or MCP) before writing or changing GraphQL. This repo does not use codegen; `queries.ts` and block-renderer types are the source of truth.
- **Related files:** `src/services/contentful/queries.ts`, `src/services/contentful/hero.ts`, `src/services/contentful/page.ts`.

---

## LL-002 — __typename case sensitivity

- **Exact error / symptom:** Block renderer shows wrong component or "unknown type"; config lookup fails.
- **Root cause:** Block resolution uses `data.__typename` (e.g. `config.typename === data.__typename`). Contentful GraphQL returns `__typename: "Hero"` (capital H). If code or tests use `"hero"` or a different casing, the match fails.
- **Solution:** Use the exact string Contentful returns. In queries, request `__typename`; in types and configs use `__typename: 'Hero'` (and the same for other block types). In tests, use `__typename: 'Hero' as const` so types align.
- **Prevention:** When adding a new content type or block, copy the `__typename` from the GraphQL response or Contentful model; don’t guess casing.
- **Related files:** `src/block-renderer/types.ts`, `src/block-renderer/utils.ts`, `src/services/contentful/page.ts`, `src/services/contentful/hero.ts`.

---

## LL-003 — itemsCollection vs items (collection shape)

- **Exact error / symptom:** `page.sections` or `sectionsCollection.items` is undefined; "Cannot read property 'items' of undefined".
- **Root cause:** Contentful GraphQL uses **collection** types: e.g. `pageCollection`, `sectionsCollection`, each with an `items` array. Code that assumes a top-level `sections` or `items` (without the `*Collection` wrapper) will fail.
- **Solution:** In queries: use `pageCollection(limit: 1) { items { sectionsCollection(limit: 20) { items { ... } } } }`. In code: read `data.pageCollection?.items?.[0]` and `page.sectionsCollection?.items ?? []`. Do not assume a flat `items` on the page type itself.
- **Prevention:** When writing or changing queries, follow existing patterns in `queries.ts` (e.g. PAGE_BY_SLUG, HERO_BY_ID). New linked/collection fields need a `*Collection { items { ... } }` shape.
- **Related files:** `src/services/contentful/queries.ts`, `src/services/contentful/page.ts`.

---

## LL-004 — Missing enable-draft / preview for draft content

- **Exact error / symptom:** Live Preview shows published content only; or preview URL returns 404 for a draft page/entry.
- **Root cause:** Draft content is only returned when the request is made with a valid preview token (and the client sends the draft cookie). If the app URL in Contentful is HTTP while Contentful is HTTPS, the iframe may be blocked (mixed content) or cookies may not be sent, so draft mode never enables.
- **Solution:** (1) Use **HTTPS** for the Contentful app / preview URL when running locally: `bun run dev:https` and set App URL to `https://localhost:3000/contentful-app` (or use a tunnel). (2) Ensure enable-draft is called with the right `secret`, `entryId`/`slug`, and `type`, and that the redirect lands on a route that uses draft mode (e.g. `/preview/hero/[entryId]`, `/page/[slug]`). (3) For Hero preview, set Contentful Preview URL to the enable-draft URL with `entryId={{entry.sys.id}}&type=hero`.
- **Prevention:** Document the exact Preview URL and App URL in TASKS or README. When adding new preview routes, wire them through enable-draft and pass `preview: true` in GraphQL variables when draft mode is enabled.
- **Related files:** `src/app/api/enable-draft/route.ts`, `src/app/preview/`, layout/providers for draft cookie, `package.json` (`dev:https`).

---

## LL-005 — Rich Text rendering [object Object]

- **Exact error / symptom:** Rich Text field shows literal "[object Object]" in the UI.
- **Root cause:** The field value from Contentful is a Rich Text **document** (object with `nodeType`, `content`, etc.). Rendering it with `{field}` or `String(field)` in React produces "[object Object]".
- **Solution:** Use the Rich Text renderer for your stack. For React: `@contentful/rich-text-react-renderer` and render the document with `documentToReactComponents(field)` (or equivalent). Map node types to your components (paragraphs, links, embedded entries) as needed.
- **Prevention:** For any Contentful field that is "Rich Text", treat it as a document structure, not a string. Check the field type in the content model and use the matching renderer in the codebase.
- **Related files:** Any component that displays a Rich Text field; add a shared Rich Text renderer if not present.

---

## LL-006 — Content type ID determines __typename (Contentful Documentation)

- **Exact error / symptom:** Block doesn't render; `mapSection` returns null. Build passes but runtime shows nothing or 404.

- **Root cause (Documentation-Backed):**
  From [Contentful GraphQL API docs](https://www.contentful.com/developers/docs/references/graphql/#/reference/schema-generation/types):
  > "Type name is the pascalcase version of the content type ID"

  The content type **Api Identifier** (not Name) determines `__typename`:
  - Contentful UI auto-generates Api Identifier from Name using camelCase
  - GraphQL applies PascalCase transformation to the Api Identifier
  - "Faq Item" → `faqItem` → `__typename: "FaqItem"`
  - "FaqItem" (no space) → `faqitem` → `__typename: "Faqitem"`

- **Solution:**
  1. Check the Api Identifier in Contentful for your content type
  2. Apply PascalCase transformation = your `__typename`
  3. Update code to match (don't invent conventions)

- **Prevention:**
  1. Use spaces in content type Names ("Faq Item" not "FaqItem") for clear word boundaries
  2. After creating content types, verify the Api Identifier before writing code
  3. Query via GraphQL to confirm actual `__typename` returned
  4. Follow `contentful-mcp-create-model` skill which documents this behavior

- **Related files:**
  - `.cursor/skills/contentful-mcp-create-model/SKILL.md` (authoritative source)
  - `src/services/contentful/queries.ts` (`... on TypeName` fragments)
  - `src/block-renderer/types.ts` (`__typename` literal types)

---

## Template for adding a new lesson

Copy the block below, assign the next ID (LL-007, …), and fill in. Then add one row to the Index table at the top.

```markdown
## LL-XXX — Short title (keyword-rich)

- **Exact error / symptom:** (message or behavior user/agent sees)
- **Root cause:** (why it happens)
- **Solution:** (steps or code fix)
- **Prevention:** (how to avoid next time)
- **Related files:** (paths that matter)
```

---

---

## LL-007 — GraphQL Collection field naming (Contentful adds "Collection" suffix)

- **Exact error / symptom:** GraphQL query fails with "Cannot query field \"itemsCollection\" on type \"Tabbedcontent\"" or "Did you mean \"itemsCollectionCollection\"?". Page returns 404 or sections don't render.

- **Root cause:** Contentful's GraphQL API automatically adds "Collection" suffix to array/reference fields. If a field ID is `itemsCollection`, GraphQL exposes it as `itemsCollectionCollection`. The code was querying `itemsCollection` but GraphQL expected `itemsCollectionCollection`.

- **Solution:** 
  1. Check the Contentful field ID (e.g., `itemsCollection`)
  2. In GraphQL queries, use `itemsCollectionCollection` (add "Collection" suffix)
  3. In mapper functions, map from `itemsCollectionCollection` to `itemsCollection` for component props
  4. Pattern: Field ID `X` → GraphQL field `XCollection` → Access as `data.XCollection`

- **Prevention:**
  1. When creating content types, prefer simple field names without "Collection" (e.g., `items` not `itemsCollection`)
  2. If field ID already has "Collection", remember GraphQL will add another "Collection" suffix
  3. Test GraphQL queries immediately after creating content types
  4. Use Contentful MCP `get_content_type` to verify field IDs before writing queries

- **Related files:**
  - `src/services/contentful/queries.ts` (GraphQL fragments)
  - `src/services/contentful/page.ts` (mapper functions)
  - `src/services/contentful/tabbed-content.ts` (preview mapper)

---

---

## LL-008 — Live preview field name mismatch (raw vs mapped fields)

- **Exact error / symptom:** Images don't update in Contentful live preview when changed; background image persists even after removal; media image doesn't appear when added. Component shows stale data despite Contentful updates.

- **Root cause:** 
  1. `useLiveUpdates` returns **raw Contentful data** with original field names (e.g., `media`), not the mapped field names used in the app (e.g., `image`). The mapper (`hero.ts`, `page.ts`) converts `media` → `image` for initial data, but live updates bypass this mapping.
  2. Fallback logic (`?? data.field`) prevents updates: when Contentful sends `null` for a removed field, code falls back to stale `data` instead of using the `null`.
  3. Conditional rendering components (like GridBackground) render unconditionally, showing visual elements even when data is missing.

- **Solution:**
  1. In live preview components, check **both** mapped and raw field names:
     ```typescript
     type RawLiveData = HeroFragment & { media?: { url?: string } | null };
     const rawImageUrl =
       (liveData as HeroFragment).image?.url ??
       ((liveData as RawLiveData).media?.url ?? undefined);
     ```
  2. **Don't fall back to `data`** for live preview updates - use `liveData` directly. If `liveData.field` is `null`, it means the field was removed.
  3. Conditionally render visual elements only when data exists:
     ```typescript
     {backgroundUrl && (
       <>
         <BackgroundImage />
         <GridBackground />
       </>
     )}
     ```
  4. Remove default/fallback content - conditionally render elements only when Contentful data exists to avoid unnecessary whitespace.

- **Prevention:**
  1. When using `useLiveUpdates`, remember it returns raw Contentful structure, not mapped structure
  2. Always check both mapped field name (from initial data) and raw field name (from live updates)
  3. Never fall back to `data` for fields that should update in live preview
  4. Conditionally render all visual elements based on actual data presence
  5. Remove placeholder/fallback content - let empty fields render nothing

- **Related files:**
  - `src/cms-components/hero/hero.tsx` (live preview field handling)
  - `src/lib/live-preview.tsx` (useLiveUpdates hook)
  - `src/services/contentful/hero.ts` (mapper functions)

---

**Last updated:** 2026-02-03  
**Total lessons:** 8
