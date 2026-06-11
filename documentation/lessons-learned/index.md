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
| New field renders on PLP/callout but not on page route; always gets default value | [transformSection whitelist](./transform-section-whitelist.md) | Add field to `transformSection()` in `page-content-live.tsx` — it explicitly rebuilds every block, silently drops unlisted fields |
| Agent team runs, commits appear, but feature is broken; tests never ran; no visual QA | [Agent orchestration pitfalls](./ll-026-agent-orchestration-pitfalls.md) | All agents use `--dangerously-skip-permissions`; QA must Playwright-screenshot before marking done; orch never writes code |
| ProductListing renders empty grid on `/page/[slug]` but works in preview route | [ProductCatalog data flow](./ll-027-productcatalog-data-flow.md) | `PageContentLive` is `'use client'` — can't call `getSettings()`; component must self-fetch via `contentfulCatalogAdapter` |
| NT `<Experience>` always shows baseline on page routes; `experienceVariantIndexes` shows variant but DOM doesn't update | [NT experience context page routes](./ll-028-nt-experience-context-page-routes.md) | `PAGE_BY_SLUG` omits `ntExperiencesCollection` → `experiences=[]` → baseline always. Fix: `NtExperiencesContext` in `ninetailed-nextjs.tsx` |
| Banner swaps but hero doesn't (or vice versa); both audiences active, both in `experienceVariantIndexes` | [NT preview middleware find() bug](./ll-029-nt-preview-plugin-experience-selection-middleware.md) | Preview plugin `getExperienceSelectionMiddleware` uses `find()` — first matching experience wins for ALL blocks. Fix: filter `allNtExperiences` by `baseline.id === data.sys.id` in `BlockRenderer` before passing to `<Experience>` |
| Re-spinning old demo: content slots blank, live preview silent, no GraphQL errors | [Demo env schema drift](./ll-030-demo-env-schema-drift.md) | Old env entries have old field IDs (e.g. `headline`) but current code queries new Rt fields (`headlineRt`). Create fresh env from master + migrate entries with field mapping. |
| Blank page / ChunkLoadError; chunks on disk have hashes but HTML requests unhashed URLs | [Next dev stale production build cache](./ll-031-next-dev-production-next-cache.md) | `rm -rf .next && bun run dev` — dev server enters inconsistent state when `.next` contains a prior production build |
| Contentful app config save rejected; `onConfigure` sends `targetState: { EditorInterface: {} }` | [Squash merge drops conditional guard](./ll-032-squash-merge-removes-conditional-guard.md) | Restore `Object.keys(EditorInterface).length > 0` guard — later refactor silently removed fix added in earlier commit |
| Contentful app crashes at `LOCATION_PAGE`; `sdk.app` is undefined | [sdk.app undefined at LOCATION_PAGE](./ll-033-contentful-app-location-page-sdk-app.md) | `sdk.app` only exists at `LOCATION_APP_CONFIG` — gate all `sdk.app.*` calls behind `sdk.location.is(locations.LOCATION_APP_CONFIG)` |
| "Failed to update app configuration" with no other error; save fails silently | [widgetNamespace/widgetId in targetState](./ll-034-contentful-app-targetstate-widgetid-conflict.md) | Use bare `{ fieldId }` in targetState controls — omit `widgetNamespace`/`widgetId`; SDK auto-binds the installed app |
| Field reverts to JSON Object editor after every config save | [Omitting targetState resets field appearance](./ll-035-contentful-app-appearance-resets-on-save.md) | Always return `targetState` from `onConfigure` with bare `{ fieldId }` controls; omitting it resets EditorInterface to defaults |
| Custom field app disappears; field shows raw JSON editor with no error | [Config map crash causes silent JSON fallback](./ll-036-contentful-app-config-map-crash-json-fallback.md) | Any unhandled throw in field app = silent fallback to JSON editor; always `?? fallback` config map lookups |
| JSON Object field data ignored; array path runs on object shape; products don't render | [JSON field shape detection](./ll-037-contentful-app-json-field-shape-detection.md) | `Array.isArray()` is false for objects — use `'items' in (x as object)` shape detection; double-cast `as unknown as T` to avoid TS errors |
| "Failed to update app configuration" when mapped field deleted from CT | [EditorInterface deleted field guard](./ll-038-editorinterface-deleted-field-guard.md) | Guard field existence in `onConfigure` before building `targetState.EditorInterface` — skip mappings whose field no longer exists |
| Stale persona traits after `reset()` — Profile Previewer shows logged-in data for anonymous | [NT reset doesn't clear traits](./ll-042-nt-reset-doesnt-clear-traits.md) | Explicitly overwrite every trait key with empty value via `ANONYMOUS_OVERWRITE` map |
| Behavioral traits leak across persona switch — wrong audience fires | [NT identify is additive](./ll-043-nt-identify-additive-clear-behavioral.md) | Include `interested_in: persona.interested_in ?? ''` in every persona-switch `identify()` call |
| Build error: "useSearchParams() should be wrapped in a suspense boundary" | [useSearchParams Suspense](./ll-044-use-search-params-suspense.md) | Split into inner component + `<Suspense>` wrapper |
| Internal links lose `?preview=true` in live preview iframe | [PreviewLinkInterceptor capture phase](./ll-045-preview-link-interceptor-capture-phase.md) | Capture-phase click handler + `router.push()` (not `window.location.href`) |
| Inspector mode edit opens new tab instead of navigating sidebar | [Live preview env alias mismatch](./ll-046-live-preview-env-alias-mismatch.md) | Use `resolveEnvironmentAlias()` in layout — never pass raw alias to SDK |
| Dev server ignores file changes; new routes 404; stale `.next` cache | [Webpack ignore blocks worktree HMR](./ll-047-webpack-ignore-worktree.md) | Remove `**/metafi-worktrees/**` from `next.config.ts` ignored; `rm -rf .next` |
| `activateAudience()` fires but Experience component shows baseline | [activateAudience no variant selection](./ll-048-nt-activate-audience-no-variant-selection.md) | Also call `setExperienceVariant(expId, 1)` — activateAudience only updates plugin state |
| Global experiences query 400: TOO_COMPLEX_QUERY after adding nested collection | [Nested collection complexity explosion](./ll-049-contentful-query-complexity-nested-collections.md) | Don't nest collections 3+ deep in global queries; fetch variant data via separate API route |
| Merge tag renders literal ID instead of resolved value | [Merge tag ID resolution fallbacks](./ll-050-merge-tag-id-resolution-fallbacks.md) | Resolution needs 3 tiers: direct path, `traits.` prefix, camelCase→snake_case |
| Default-open accordion items show clipped text on first render | [CSS grid accordion default-open](./ll-051-css-grid-accordion-default-open.md) | Use `grid-rows-[1fr]/[0fr]` instead of JS height measurement |
