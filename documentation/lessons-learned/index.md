# Lessons Learned — Index

Error patterns, root causes, and fixes from this project. Search by symptom below. Each lesson is its own file — click through for full detail, code examples, and related files.

To add a new lesson: create a new `.md` file in this folder and add one row to the table below.

---

## Quick Lookup

| Error / symptom | Lesson | Quick fix |
|-----------------|--------|-----------|
| Hero/preview 404; service returns null | [Field name mismatch](./field-name-mismatch.md) | Use Contentful field name in query (e.g. `media` not `image`) |
| Block not rendering; wrong component shown | [__typename case sensitivity](./typename-case-sensitivity.md) | Use exact `__typename` Contentful returns |
| `sections` or `items` undefined | [Collection shape](./collection-shape.md) | Use `*Collection { items { ... } }` in GraphQL |
| Preview shows published only / 404 | [Draft mode not enabled](./draft-mode.md) | Use enable-draft + preview token; HTTPS for app URL |
| Rich Text shows "[object Object]" | [Rich Text rendering](./rich-text-rendering.md) | Use `documentToReactComponents()` |
| Block filtered out; mapSection returns null | [Content type ID determines __typename](./content-type-id-typename.md) | Content type ID drives `__typename` — verify PascalCase from Contentful |
| GraphQL error: "Cannot query field X on type Y" | [GraphQL Collection suffix](./graphql-collection-suffix.md) | Array field `items` → query as `itemsCollection` |
| Live preview images not updating; stale values | [Live preview field names](./live-preview-field-names.md) | `useLiveUpdates` returns raw field names — check both `image` and `media` |
| SDK error "Invalid live updates subscription" | [Transformed data breaks useLiveUpdates](./transformed-data-live-updates.md) | Pass raw GraphQL to `useLiveUpdates`, transform after |
| `PAGE_BY_SLUG` 400 after adding NT fields | [PAGE_BY_SLUG NT query limit](./page-by-slug-nt-query-limit.md) | Add `ntExperiencesCollection` to `*_BY_ID` only, never shared `*_FIELDS` |
| Custom preview renderer shows stale data | [Custom renderer live updates](./custom-renderer-live-updates.md) | Call `useLiveUpdates(data)` at top of any custom preview renderer |
| `next/image` broken icon for Contentful assets | [Protocol-relative image URLs](./protocol-relative-image-urls.md) | Use `<img>` or prepend `https:` — Contentful returns `//images.ctfassets.net` |
| NT `identify()` fires but variant doesn't swap | [NT audience rules missing](./nt-audience-rules-missing.md) | Add `ntRules` to `NT_AUDIENCE_FIELDS`; pass `rules: a.ntRules` in `mapAudiences` |
| Draft entry 404 in Contentful live preview iframe | [Preview route draft token](./preview-route-draft-token.md) | Always use `preview: true` in `/preview/*` routes — iframe bypasses enable-draft |
| GraphQL 422 after connecting NT app | [NT experiences field collision](./nt-experiences-field-collision.md) | Delete custom `ntExperiences` field; use only NT-prescribed `nt_experiences` |
| `*_BY_ID` query null / 404 after adding `ntExperiencesCollection` | [NT experiences duplicate collection](./nt-experiences-duplicate-collection.md) | Don't add `ntExperiencesCollection` to `*_BY_ID` if already in shared `*_FIELDS` |
| GraphQL 400 even though character count appears safe | [GraphQL query byte inflation](./graphql-query-byte-inflation.md) | Minify: `query.replace(/\s+/g, ' ').trim()` in `fetchGraphQL` |
| Contentful field type change fails in single MCP call | [Contentful field type change](./contentful-field-type-change.md) | Two steps: omit+publish, then replace+publish |
| NT experience "already exists" error in demo env | [NT experience env conflict](./nt-experience-env-conflict.md) | Use "Link existing experience" — never clone NT experience entries into demo envs |
| GraphQL error querying `sys { id }` on a union collection field | [GraphQL union sys.id](./graphql-union-sys-id.md) | Use `... on Entry { sys { id } }` inline fragment — union root has no `sys` field |
| NT SDK silently dies on `bun run dev`; no audiences evaluate | [NT SDK HTTP randomUUID](./nt-sdk-http-random-uuid.md) | Run `bun run dev:https` — `crypto.randomUUID` requires a secure context |
| NT merge tag resolves to `undefined` even when field is populated | [NT merge tag ID format](./nt-mergetag-id-format.md) | Transform `{{ profile.traits.x }}` → `traits_x` before passing to `selectValueFromProfile` |
| Persona switcher / audience activation has no effect | [NT activateAudience API](./nt-activate-audience-api.md) | Use `window.ninetailed.plugins.preview.activateAudience(audienceId)` — other surfaces don't work |
| Live preview field changes not re-rendering; stale layout in preview iframe | [Server component live preview](./server-component-live-preview.md) | Add a `[Block]PreviewClient` client wrapper that calls `useLiveUpdates()` — server components can't subscribe |
| `ntExperiencesCollectionCollection` double suffix; NT query 400 or silent null | [NT field ID double collection](./nt-field-id-double-collection.md) | Never create `nt_experiences` manually — let NT app create it; if created with wrong ID, fix field ID to `nt_experiences` |
| "Failed to update app configuration" on save with no CTs activated | [Empty EditorInterface rejection](./contentful-app-empty-editor-interface.md) | Only include `targetState` when `mappings.length > 0` — Contentful rejects `EditorInterface: {}` |
| `useCMA()` throws or silently fails in dynamic import component | [useCMA in dynamic() imports](./contentful-app-usecma-dynamic-import.md) | Use deprecated `sdk.space.getContentTypes()` — `useCMA()` context doesn't propagate through Next.js dynamic() boundary |
| `onConfigure` saves stale state; or fires multiple times per save | [onConfigure ref pattern](./contentful-app-onconfigure-ref-pattern.md) | Register once via `useEffect([ready])`; read latest state via `useRef` — add `onConfigurationCompleted` logger |
| Agent team runs, commits appear, but feature is broken; tests never ran; no visual QA | [Agent orchestration pitfalls](./ll-026-agent-orchestration-pitfalls.md) | All agents use `--dangerously-skip-permissions`; QA must Playwright-screenshot before marking done; orch never writes code |
| ProductListing renders empty grid on `/page/[slug]` but works in preview route | [ProductCatalog data flow](./ll-027-productcatalog-data-flow.md) | `PageContentLive` is `'use client'` — can't call `getSettings()`; component must self-fetch via `contentfulCatalogAdapter` |
| NT `<Experience>` always shows baseline on page routes; `experienceVariantIndexes` shows variant but DOM doesn't update | [NT experience context page routes](./ll-028-nt-experience-context-page-routes.md) | `PAGE_BY_SLUG` omits `ntExperiencesCollection` → `experiences=[]` → baseline always. Fix: `NtExperiencesContext` in `ninetailed-nextjs.tsx` |
| Banner swaps but hero doesn't (or vice versa); both audiences active, both in `experienceVariantIndexes` | [NT preview middleware find() bug](./ll-029-nt-preview-plugin-experience-selection-middleware.md) | Preview plugin `getExperienceSelectionMiddleware` uses `find()` — first matching experience wins for ALL blocks. Fix: filter `allNtExperiences` by `baseline.id === data.sys.id` in `BlockRenderer` before passing to `<Experience>` |
