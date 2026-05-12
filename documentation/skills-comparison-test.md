# Skills Comparison Test — New Contentful Skills vs Current Setup

## Purpose

Evaluate whether the new contentful skills (`contentful-guide`, `contentful-migration`, `contentful-personalization`, `contentful-graphql-nextjs`) improve CC response quality compared to the current skill set (`test-nt-personalization`, `contentful-live-preview-verify`, `contentful-mcp-create-model`, etc.).

Each scenario below is a real prompt that has caused pain in this project. Run it in both setups and score the difference.

---

## How to use this document

1. **Run each prompt in the CURRENT session** — main CC or any CC without the new skills installed.
2. Note response quality: Did it invoke the right skill? Did it know the error pattern? Was the answer complete?
3. **Open the worktree CC:** `claude /Users/casey.lisak/Dev/metafi-worktrees/feat-skills-upgrade`
4. Run the same prompts in the worktree CC.
5. Compare and score each scenario (see scoring rubric at the bottom).

---

## Demo relevance flags

Scenarios marked **🔴** directly block the upcoming Punchbowl demo. Resolve any regressions in new-skill behavior for these before merging the skills upgrade.

---

## Scenarios

---

### S-01 — NT variant not showing

**Category:** NT debugging
**Demo risk:** 🔴 blocks demo — this is the primary personalization scenario

**Prompt:**
```
My Ninetailed personalization isn't working — the variant never shows, it always renders baseline. I've checked that the experience is configured and the audience rules are set.
```

**Background:** This is exactly the 4-hour failure documented in LL-028. Root cause: `PAGE_BY_SLUG` omits `ntExperiencesCollection` from page queries, so `NtExperiencesContext` is empty, and every `<Experience>` block falls back to baseline. Not obvious from the symptom.

**Current setup behavior:**
- `test-nt-personalization` skill (v3) is invoked.
- Phase 1 checks `nt_config` shape, `ntExperienceId` vs `sys.id`, audience rules, variant publishing state — all solid checks.
- Phase 4 failure diagnosis checklist includes the `NtExperiencesContext empty` item (item 2) which covers LL-028.
- However, Phase 4 is presented as a manual checklist. CC lists the items; it does not run them automatically or in order of likelihood.
- The check for LL-029 (`find()` bug in preview middleware) is NOT in the current skill.

**New skills behavior:**
- `contentful-personalization` doctor sub-skill should run these checks automatically in a deterministic order, starting with the highest-frequency causes.
- Should auto-query Contentful MCP to confirm `nt_config.components[].baseline.id` resolves to the correct entry.
- Should check `NtExperiencesContext` wiring in `ninetailed-nextjs.tsx` and `block-renderer.tsx` as part of the doctor flow — not just list it as a bullet.
- Should surface LL-028 and LL-029 by name and explain which one is more likely given the symptom description.
- Include depth check: confirm `ntExperiencesCollection` is queried at the right depth (page query level, not block level).

**How to evaluate:**
- Does CC automatically run diagnostic steps or just list them?
- Does it distinguish between LL-028 (context missing) and LL-029 (preview middleware `find()` bug)?
- Does it read actual Contentful entries via MCP as part of the diagnosis?
- Does it identify "PAGE_BY_SLUG omits ntExperiencesCollection" as the likely root cause?

**Pass criteria:** New skill runs automated MCP checks, surfaces LL-028/LL-029 by name, identifies `NtExperiencesContext` as the primary suspect, and does not require the user to manually work through a checklist.

---

### S-02 — Create a new content type for a ProductCard block

**Category:** CT creation / migration
**Demo risk:** 🟡 degrades demo — content model drift affects all new block work

**Prompt:**
```
I need to create a new content type for a ProductCard block. Fields: title (short text), price (number), image (media), description (rich text), ctaLabel (short text), ctaUrl (short text).
```

**Current setup behavior:**
- `contentful-mcp-create-model` skill (Milestone 3) is invoked.
- Skill creates the CT directly via Contentful MCP calls — `create_content_type`, adds fields one by one, then `publish_content_type`.
- No migration script is produced. The creation is MCP-direct and leaves no auditable artifact.
- If the user later needs to replicate the CT in a demo env (e.g. Punchbowl), there is no migration file to run — they must recreate it manually or export/import via the Contentful UI.
- Field naming follows the `references/field-type-mapping.md` reference embedded in the skill.

**New skills behavior:**
- `contentful-migration` should generate a numbered TypeScript migration script: `migrations/002-product-card.ts`.
- Script uses the Contentful Migration SDK (`runMigration`, `migration.createContentType`, `.createField`).
- Migration script is committed alongside the component code so that new environments (demo envs, future spaces) can apply the migration rather than recreating manually.
- After generating the script, the skill should offer to run it against `master` via MCP or the Contentful CLI.
- Should warn if a CT named `productCard` already exists (check via `get_content_type` first).

**How to evaluate:**
- Does CC produce a `.ts` migration file in `migrations/`?
- Is the migration script syntactically correct (uses `runMigration` pattern)?
- Does it check for an existing CT before creating?
- Does it offer a run path (MCP exec or CLI command)?

**Pass criteria:** A numbered migration script is created in `migrations/`. Script is syntactically correct and self-contained. MCP-direct creation is secondary to the migration artifact.

---

### S-03 — GraphQL field returning null after CT update

**Category:** GraphQL debugging
**Demo risk:** 🔴 blocks demo — field-name drift is the most common silent failure in this project

**Prompt:**
```
The headline field on my Hero block is returning null after I updated the content type. Everything looks right in Contentful but the page shows nothing.
```

**Background:** Documented in LL-030 (demo env schema drift). Also related to the `headlineRt` Symbol→RichText migration pattern. The symptom — "everything looks right" — is exactly what happens when the GraphQL query uses the old field ID (`headline`) but the CT was migrated to a new field ID (`headlineRt`). `fetchGraphQL` catches the error and returns null silently. The dev server terminal is the only place the error appears.

**Current setup behavior:**
- No dedicated GraphQL debugging skill exists.
- CC reasons from first principles or pattern-matches against `documentation/lessons-learned/index.md` if the user mentions that index.
- Without the index being in context, CC may suggest checking Contentful field IDs in the UI, checking the query, checking the component — valid but slow.
- The specific instruction to check `[fetchGraphQL] GraphQL errors` in the dev server terminal (not the browser) is NOT surfaced automatically.
- The `Rt` suffix pattern (field type upgrade from Symbol to RichText renames the field) is not in any current skill.

**New skills behavior:**
- `contentful-graphql-nextjs` should immediately identify the Symbol→RichText migration pattern.
- Should check for `Rt` suffix: ask "was the field type changed from Short Text to Rich Text? If so, the field ID may have changed to `headlineRt`."
- Should instruct: "Check the dev server terminal for `[fetchGraphQL] GraphQL errors` — these are swallowed in the browser."
- Should offer to run a MCP query (`get_content_type`) to read actual field IDs and diff against what the GraphQL query uses.
- Should reference LL-030 explicitly.

**How to evaluate:**
- Does CC immediately surface the `Rt` suffix pattern?
- Does it tell the user to check the dev server terminal (not the browser console)?
- Does it offer to fetch the CT field list via MCP?
- Does it reference LL-030?

**Pass criteria:** Within the first response, CC identifies the `headlineRt` / field-rename pattern, directs to the dev server terminal, and offers to auto-diff CT fields vs query fields via MCP.

---

### S-04 — Live preview stopped updating after CT change

**Category:** Live preview debugging
**Demo risk:** 🔴 blocks demo — live preview is the primary Contentful differentiator in every demo

**Prompt:**
```
Live preview was working but stopped after I changed the content type structure. The Contentful editor shows updates but the preview iframe doesn't change.
```

**Current setup behavior:**
- `contentful-live-preview-verify` skill is invoked.
- Skill runs Playwright MCP browser diagnostics: console messages, network requests, screenshot, checks for `[PageContentLive] postMessage received` signals and `useLiveUpdates` wiring.
- Checks against `references/lessons-patterns.md` for known patterns.
- The specific failure mode — CT change breaks live preview because `__typename` changes or a server component lost its client wrapper — is covered in the reference file but requires pattern matching.
- Does NOT check: was `useLiveUpdates` receiving the correct raw data (pre-transform)? Did the CT change cause the query to return null silently (masking as a live preview bug when it's actually a GraphQL field mismatch)?

**New skills behavior:**
- `contentful-graphql-nextjs` live-preview-rules sub-skill should triage first: "Did the CT change rename any fields? If so, the issue may not be live preview — it may be a null GraphQL response masking as a stale preview."
- Should check: is `useLiveUpdates` called with raw GraphQL data (not transformed data)? This is the LL-009 (Transformed data breaks useLiveUpdates) check.
- Should check: does `__typename` still reach the client component? Server component → client component boundary must preserve `__typename`.
- Should check: is there a `[Block]PreviewClient` wrapper? If not, server components can't subscribe to live updates (LL-024: Server component live preview).
- Triage order: GraphQL null first → `useLiveUpdates` raw-data contract → `__typename` propagation → server component wrapper.

**How to evaluate:**
- Does CC first ask "did the CT change rename any fields?" before jumping to browser debugging?
- Does it check the `useLiveUpdates` raw-data contract (LL-009)?
- Does it check for a `[Block]PreviewClient` wrapper (LL-024)?
- Is the triage ordered by likelihood rather than alphabetically?

**Pass criteria:** CC triages GraphQL-null-masking-as-preview-bug before running browser automation. Surfaces LL-009 and LL-024 explicitly. Does not jump to Playwright diagnostics until the query is confirmed healthy.

---

### S-05 — Which Contentful API should I use?

**Category:** Routing / architecture concepts
**Demo risk:** ⚪ nice to have — wrong API choice causes technical debt, not demo failure

**Prompt:**
```
I need to fetch some content server-side for a new route. Should I use the GraphQL API, the REST API, or the MCP server? This is for a new page that doesn't need live preview.
```

**Current setup behavior:**
- No routing skill exists for this question.
- CC answers from general Contentful knowledge: GraphQL for typed queries, REST for simple fetches, MCP for agent operations.
- May not know this project's specific convention: `fetchGraphQL` wrapper in `src/services/contentful/`, always use preview token from `.env.local`, never use REST in this project (convention is GraphQL-only for page fetches).
- May suggest REST as a valid option, which contradicts project convention.

**New skills behavior:**
- `contentful-guide` should route this question to the correct answer without ambiguity.
- Should state the project decision tree: GraphQL API for all page data fetches (server-side and client-side), MCP for agent-driven content operations (create/update/publish during session), never REST (not configured in this project).
- Should point to `src/services/contentful/` as the existing service layer to extend.
- Should note: even without live preview, use the preview token pattern (always `preview: true` in `/preview/*` routes — see LL-014).
- Should not require the user to know the project convention — the skill surfaces it.

**How to evaluate:**
- Does CC unambiguously recommend GraphQL (not REST)?
- Does it point to the existing `src/services/contentful/` service layer?
- Does it mention the MCP distinction (agent ops only)?
- Does it avoid suggesting REST?

**Pass criteria:** CC recommends GraphQL without hedging, points to the service layer, clarifies MCP scope, and does not suggest REST as an option for this project.

---

### S-06 — Set up new demo environment for Punchbowl

**Category:** Demo env setup
**Demo risk:** 🟡 degrades demo — wrong setup order causes content drift and blocked preview

**Prompt:**
```
I need to set up a new Contentful environment for the Punchbowl demo. Brand colors are navy blue and gold. They're a media company.
```

**Current setup behavior:**
- `demo-setup` skill is invoked.
- Skill walks through: create Contentful env, add env to API key, brand scraping via Firecrawl MCP, paste tokens into siteSettings entry.
- CT replication is manual: user must recreate content types in the new env by hand or copy entries via the Contentful UI export/import.
- No migration script is run against the new env — CT parity depends on the user doing it correctly.
- No NT personalization readiness check: the skill does not confirm NT is wired to the correct data bucket (Development bucket for demo envs).

**New skills behavior:**
- `contentful-migration` should be invoked to run the `migrations/` folder against the new env — ensuring CT parity without manual recreation.
- `contentful-personalization` onboard sub-skill should run a readiness assessment: confirm NT environment name matches `NEXT_PUBLIC_NINETAILED_ENVIRONMENT`, confirm the correct data bucket (Development) is configured, confirm the API key is scoped to the new env.
- Should also flag: "Add the new env to the Contentful API key in Settings → API Keys before any content queries will work" — the MEMORY.md entry about this critical first task.
- Migration run + NT onboard should happen in parallel, not sequentially.

**How to evaluate:**
- Does CC invoke `contentful-migration` to run migrations against the new env?
- Does CC run a NT personalization readiness check?
- Does it flag the API key scoping step?
- Does it mention the Development data bucket (not Main) for demo envs?

**Pass criteria:** CC produces a migration run against the new env AND a NT readiness report. API key scoping is flagged. Development bucket is correctly identified.

---

### S-07 — NT geo audience never matches in production

**Category:** NT debugging — geo audience
**Demo risk:** 🔴 blocks demo — if Punchbowl demo uses geo targeting, this silently breaks it

**Prompt:**
```
I set up a geo audience for UK visitors but it never activates in production. Works fine in preview mode with the preview plugin.
```

**Background:** Two separate failure modes are combined here: (1) geo context not being injected server-side (NT SDK needs `ninetailed.io/v2/track` to receive geo headers, or the app needs to pass geo traits via `identify()`), and (2) the entry having unpublished changes (NT CDA only serves published entries). The fact that it works in preview mode but not production is the key signal — preview plugin uses CPA (preview API), production uses CDA.

**Current setup behavior:**
- `test-nt-personalization` skill Phase 4 checklist item 7 covers "Variant entry unpublished" but not geo context injection specifically.
- The CDA vs CPA distinction (preview works, prod doesn't) is not surfaced as a named pattern in the current skill.
- No dedicated `common-errors.md` reference in the current skill for this exact symptom.
- CC must reason from first principles to reach the geo context conclusion.

**New skills behavior:**
- `contentful-personalization` common-errors.md should cover this exact symptom: "preview works, production doesn't" → CDA vs CPA + geo context missing.
- Doctor sub-skill should flag: "Geo audiences require geo data in the NT request. In Next.js, you must pass geo traits via `identify()` or use NT's Edge middleware to inject `cf-ipcountry` headers."
- Should also flag: "Check if the experience or audience entry has unpublished changes — CDA serves only published content."
- Should check `NEXT_PUBLIC_NINETAILED_ENVIRONMENT` matches the production NT environment (not `development`).
- Should distinguish: "preview plugin works because it uses CPA (preview API) which serves drafts; your production build uses CDA."

**How to evaluate:**
- Does CC immediately identify the CDA vs CPA distinction as the explanation for "works in preview, breaks in production"?
- Does it surface the geo context injection requirement?
- Does it check for unpublished changes on the experience/audience entries?
- Does it check `NEXT_PUBLIC_NINETAILED_ENVIRONMENT` for production?

**Pass criteria:** CC identifies CDA/CPA distinction within the first response, surfaces geo context injection as a likely missing piece, and checks for unpublished changes via MCP.

---

### S-08 — Add NT personalization to an existing block

**Category:** NT setup / wiring
**Demo risk:** 🟡 degrades demo — incorrect wiring order causes baseline-always bug (LL-028 repeat)

**Prompt:**
```
I want to add Ninetailed personalization to the Hero block. I already have an audience set up. Walk me through wiring it.
```

**Current setup behavior:**
- No dedicated "wire NT to an existing block" skill exists.
- CC reasons from general NT knowledge: create variant entry, create `nt_experience`, link audience, publish.
- Does NOT enforce the correct ordering (critical — wrong order causes the `nt_config` empty `{}` bug).
- Does NOT check that `nt_experiences` field exists on the Hero CT (must be the NT-prescribed field ID, not a custom one — LL-023: NT field ID double collection).
- Does NOT remind about the `NtExperiencesContext` requirement (the root cause of LL-028): the `nt_experience` entry must be reachable at the PAGE level via `NtExperiencesContext`, not embedded in the block query.
- Does NOT verify that `ntExperienceId` is set to `sys.id` on the new experience entry (must be done in UI after creation — see MEMORY.md NT patterns entry).

**New skills behavior:**
- `contentful-personalization` develop sub-skill should walk through the wiring in the correct order with verification steps at each stage:
  1. Confirm `nt_experiences` field exists on Hero CT (field ID must be exactly `nt_experiences`, not a custom name).
  2. Create variant Hero entry via MCP — confirm it's published before proceeding.
  3. Create `nt_experience` entry via MCP, link audience and variant.
  4. **Flag:** Open the `nt_experience` entry in Contentful UI and confirm `ntExperienceId` field is populated with `sys.id` — NT auto-fills it but only when the entry is opened in the editor.
  5. Link the `nt_experience` to the baseline Hero entry via the `nt_experiences` field.
  6. Publish the baseline Hero entry (with the linked experience).
  7. Run the doctor sub-skill to verify `nt_config` is non-empty and `baseline.id` / `variant.id` are correct.
- Should warn: "Do not query `ntExperiencesCollection` in the block-level GraphQL query — experiences are served via `NtExperiencesContext` at the page level."

**How to evaluate:**
- Does CC produce a step-by-step ordered list (not just a conceptual overview)?
- Does it flag the `ntExperienceId` = `sys.id` manual step?
- Does it warn against querying `ntExperiencesCollection` at block level?
- Does it run or suggest running the doctor after wiring?
- Does it check the `nt_experiences` field ID (not a custom field name)?

**Pass criteria:** CC produces an ordered, verifiable wiring guide. `ntExperienceId` manual step is flagged. Block-level query warning is included. Doctor is invoked or suggested at the end.

---

## Summary matrix

| ID | Scenario | Category | Demo Risk | Current skill handles? | Expected new skill improvement |
|----|----------|----------|-----------|------------------------|-------------------------------|
| S-01 | NT variant always baseline | NT debug | 🔴 | Partial — checklist only, no auto-run | Doctor auto-runs MCP checks; surfaces LL-028/029 |
| S-02 | Create ProductCard CT | CT creation | 🟡 | Yes — MCP direct creation | Now also produces `migrations/NNN-product-card.ts` |
| S-03 | GraphQL field null after CT update | GraphQL debug | 🔴 | No — no dedicated skill | Identifies `Rt` suffix pattern; checks dev server terminal |
| S-04 | Live preview stopped after CT change | Live preview | 🔴 | Partial — browser diagnostics only | Triages GraphQL-null first; checks LL-009 and LL-024 |
| S-05 | Which API to use? | Architecture | ⚪ | No — general knowledge only | contentful-guide gives project-specific decision tree |
| S-06 | Set up Punchbowl demo env | Demo setup | 🟡 | Partial — no migration run, no NT onboard | Runs migrations + NT readiness check in parallel |
| S-07 | Geo audience never matches in prod | NT debug | 🔴 | Partial — unpublished check only | CDA/CPA distinction + geo context injection guidance |
| S-08 | Wire NT to Hero block | NT setup | 🟡 | No — no wiring skill | Ordered guide with verification + doctor at end |

---

## Scoring rubric

Score each scenario after running in both setups:

| Score | Meaning |
|-------|---------|
| 0 | No difference — responses are equivalent |
| 1 | Marginally better — new skill adds one useful detail |
| 2 | Significantly better — new skill automates steps or surfaces a key pattern the current setup missed |
| 3 | Completely different and better — new skill catches a bug or follows a workflow that the current setup cannot |

Record scores here after running:

| Scenario | Score | Notes |
|----------|-------|-------|
| S-01 | | |
| S-02 | | |
| S-03 | | |
| S-04 | | |
| S-05 | | |
| S-06 | | |
| S-07 | | |
| S-08 | | |
| **Total** | **/24** | |

**Threshold for merge:** Total score ≥ 14/24, with no 🔴 scenario scoring 0.

---

## Running the tests

### Current setup (baseline)

Run in any CC instance that does NOT have the new skills installed (main branch CC or a fresh session):

```
# Paste each prompt from S-01 through S-08
# For each, record:
#   - Which skill (if any) was invoked
#   - Whether the root cause was identified
#   - Whether the response was automated or manual-checklist
#   - Score: 0-3 (fill in after running worktree CC)
```

### Worktree CC (new skills)

```bash
claude /Users/casey.lisak/Dev/metafi-worktrees/feat-skills-upgrade
```

Run the same 8 prompts. For each, record:
- Which new skill was invoked
- What it did differently
- Whether it used MCP calls automatically
- Score: 0-3 vs current setup

### What to look for

- **Auto-invocation:** Did the skill trigger without being explicitly named?
- **MCP usage:** Did the skill query Contentful automatically (vs asking the user to check manually)?
- **Pattern recognition:** Did the skill name the LL entry (e.g. "this looks like LL-028")?
- **Ordering:** Did the skill triage in likelihood order (most common first)?
- **Completeness:** Did the skill cover all sub-cases or stop after the happy path?
