# Handoff — feat/skills-upgrade

**Branch:** `feat/skills-upgrade`
**Created:** 2026-05-12
**Purpose:** Install contentful/skills into this project, create a GraphQL-specific skill for our codebase, write skill comparison test scenarios, and incorporate improvements from the audit agent findings.

---

## Why this branch exists

After a full analysis of https://github.com/contentful/skills, we identified:
1. **`contentful-personalization`** — directly relevant to our Ninetailed stack (not Contentful Experiences/Studio as initially assumed). Would have addressed 8+ documented LL incidents.
2. **`contentful-migration`** — critical gap: we have zero migration scripts; every CT is MCP-only with no rollback story.
3. **`contentful-guide`** — useful routing layer for new worktree CCs and agent teams.
4. **`contentful-nextjs`** — skip; teaches REST SDK, conflicts with our GraphQL-first stack.

There's also a **custom GraphQL skill** to create, since `contentful-nextjs` doesn't match our patterns at all.

---

## Your tasks (use /spin-team to parallelize)

### Recommended agent team

```
INSTALLER  — installs contentful/skills files into .claude/skills/
SKILL-AUTHOR — writes the contentful-graphql-nextjs custom skill
TESTER     — writes the test comparison scenarios
```

Agents work independently. ORCH coordinates. No agent writes to the same file as another.

---

## Track 1: Install contentful/skills (INSTALLER agent)

Install 3 skills by fetching their files from GitHub raw URLs and writing them to `.claude/skills/`.

### Skill 1: contentful-guide

Destination: `.claude/skills/contentful-guide/`

Files to fetch and write:
```
https://github.com/contentful/skills/blob/main/skills/contentful-guide/SKILL.md
https://github.com/contentful/skills/blob/main/skills/contentful-guide/references/ (list then fetch each)
```

**Reference files to fetch:** Check `https://github.com/contentful/skills/tree/main/skills/contentful-guide/references` for the file list, then fetch each one.

### Skill 2: contentful-migration

Destination: `.claude/skills/contentful-migration/`

Files to fetch and write:
```
https://github.com/contentful/skills/blob/main/skills/contentful-migration/SKILL.md
+ all files in references/
```

After installing:
- Create `migrations/` directory at repo root
- Add a `migrations/README.md` explaining: "All Contentful content type changes must be scripted here. Run: `bunx contentful space migration --space-id uumzxfocy3ef --environment-id <env> <script>`"
- Add `contentful-cli` and `contentful-migration` to devDependencies: `bun add -d contentful-cli contentful-migration`

### Skill 3: contentful-personalization

Destination: `.claude/skills/contentful-personalization/`

Files to fetch:
```
https://github.com/contentful/skills/blob/main/skills/contentful-personalization/SKILL.md
+ all files in references/ (19 files)
```

**Reference files known from analysis:**
- analytics-and-preview.md
- analytics-patterns.md
- common-errors.md
- component-patterns.md
- contentful-app-setup.md
- contentful-integration-guide.md
- env-var-spec.md
- framework-notes.md
- how-personalization-works.md
- implementation-examples.md
- middleware-patterns.md
- package-versions.md
- provider-patterns.md
- readiness-criteria.md
- rendering-pipeline.md
- sdk-legacy-guide.md
- sdk-next-guide.md
- sdk-selection.md
- ssr-guide.md

**MCP binary:** The skill uses a compiled binary (`bin/contentful-personalization.mjs`) for its `doctor`/`live-debug`/`onboard`/`develop` sub-skills via MCP. To install the binary:

1. Try: `bun add -d @contentful/skill-contentful-personalization` — if it's on npm, this gets you the binary
2. If not on npm, copy the raw binary file from: `https://github.com/contentful/skills/blob/main/skills/contentful-personalization/bin/contentful-personalization.mjs`
3. Configure in `.mcp.json` at project root (create if doesn't exist):
```json
{
  "contentful-personalization": {
    "type": "stdio",
    "command": "node",
    "args": [".claude/skills/contentful-personalization/bin/contentful-personalization.mjs"]
  }
}
```

If the binary doesn't work standalone, the skill still provides value from its SKILL.md + reference files alone — Claude reads them as context. Don't block on the MCP binary.

---

## Track 2: Create contentful-graphql-nextjs skill (SKILL-AUTHOR agent)

**Why this skill needs to exist:** `contentful-nextjs` from contentful/skills teaches REST SDK patterns. Our entire stack is GraphQL-first. A new CC following contentful-nextjs would write `createClient()` when we use `fetchGraphQL()`. We need a skill that encodes our specific patterns.

**Destination:** `.claude/skills/contentful-graphql-nextjs/`

**What the skill must cover** (built from our 37 LL files and codebase):

To write this skill, read these files first:
- `src/services/contentful/client.ts` — the fetchGraphQL function
- `src/services/contentful/queries.ts` — fragment + query patterns
- `src/services/contentful/page.ts` — mapper patterns
- `src/lib/live-preview.tsx` — useLiveUpdates wrapper
- `src/app/page/[slug]/page-content-live.tsx` — client page with live updates
- `documentation/lessons-learned/index.md` — all LL entries for patterns to encode
- All individual LL files, especially: field-name-mismatch, graphql-collection-suffix, typename-case-sensitivity, page-by-slug-nt-query-limit, live-preview-raw-data

Then write a `SKILL.md` + `references/` subdirectory covering:

**SKILL.md frontmatter:**
```yaml
---
name: contentful-graphql-nextjs
description: >-
  Build, debug, and maintain Contentful GraphQL integration in this Next.js project.
  Use when writing GraphQL fragments, queries, or mappers; debugging null/empty fields;
  fixing live preview; adding a new block to the query layer; or debugging fetchGraphQL errors.
  NOT for REST SDK patterns (we use GraphQL exclusively).
argument-hint: "[what to build or debug]"
allowed-tools: Bash(bunx tsc --noEmit) mcp__contentful__* Bash(bun run dev)
---
```

**Reference files to create in `.claude/skills/contentful-graphql-nextjs/references/`:**

1. **client-pattern.md** — fetchGraphQL function, delivery vs preview token, how to call it, error handling. Source: `src/services/contentful/client.ts`

2. **fragment-patterns.md** — how to write a GraphQL fragment for a new block. Cover:
   - `__typename` and `sys { id }` required on every fragment
   - Collection suffix rule (`itemsCollection { items { ... } }` not `items { ... }`)
   - Array field naming: never name a field `itemsCollection` (becomes `itemsCollectionCollection`)
   - CT API Identifier → `__typename` mapping (camelCase ID → PascalCase typename)
   - Why `__typename` is load-bearing for live preview (not metadata)

3. **live-preview-rules.md** — the most critical patterns:
   - Raw GraphQL data must be passed to `useLiveUpdates()` UNTRANSFORMED
   - `__typename` and `sys.id` must survive to the client component
   - Transform AFTER subscription, not before
   - Client wrapper pattern: `[Block]PreviewClient` receives raw data, subscribes, then transforms
   - ENTRY_SAVED postMessage listener for page-level changes

4. **query-size.md** — 8192-byte limit management:
   - Contentful counts transmitted bytes, not characters. Whitespace inflates by 30-40%
   - Use minified queries in fetchGraphQL: `query.replace(/\s+/g, ' ').trim()`
   - `ntExperiencesCollection` goes in `*_BY_ID` queries ONLY, never shared `*_FIELDS` constants
   - Measure: `Buffer.byteLength(query, 'utf8')` should be < 8000

5. **nt-query-architecture.md** — how NT personalization integrates with GraphQL:
   - `ntExperiencesCollection` field: why it's separate from page queries
   - `NtExperiencesContext` pattern for passing experiences to blocks without per-block query bloat
   - Why BY_ID queries can have NT data but PAGE_BY_SLUG cannot
   - Publishing order: variants → experiences → baseline entry

6. **field-naming-pitfalls.md** — common naming errors:
   - `image` vs `media` (Hero uses `media` in Contentful, mapped to `image` in fragments)
   - Symbol→RichText migrations add `Rt` suffix (`headline` → `headlineRt`)
   - After any CT change: check GraphQL fragment field names match current CT field IDs
   - How to verify: `fetchGraphQL` logs `[fetchGraphQL] GraphQL errors` to dev server terminal

7. **adding-new-block.md** — step-by-step for wiring a new block to GraphQL:
   1. Define fragment in `queries.ts`
   2. Add fragment to `PAGE_BY_SLUG` sections union
   3. Add type to `block-renderer/types.ts`
   4. Register in `block-renderer/configs/index.ts`
   5. Add preview route at `/preview/[block]/[entryId]`
   6. Verify `__typename` matches CT API Identifier exactly
   7. Test: `bun run dev`, open `/preview/[block]/[entryId]?preview=true`

---

## Track 3: Write test comparison scenarios (TESTER agent)

**Destination:** `documentation/skills-comparison-test.md`

Write a structured test document with 8 scenarios. For each scenario:
- **Prompt**: the exact text a user would type
- **Expected behavior (current setup)**: what happens with our existing skills today
- **Expected behavior (new skills)**: what the new skills should do differently
- **How to evaluate**: what to look for in the output
- **Demo relevance**: is this relevant to the upcoming demo?

**8 test scenarios to include:**

1. **NT variants not showing**
   Prompt: "My personalization isn't working — the variant never shows, always baseline"
   Relevant new skill: contentful-personalization (doctor sub-skill)
   Current: we walk through LL files manually
   New: doctor sub-skill runs automated checks

2. **New block wiring**
   Prompt: "Wire the new ProductCard block to GraphQL and enable live preview"
   Relevant new skill: contentful-graphql-nextjs
   Current: no skill for this specific workflow
   New: SKILL.md guides through fragment → query → type → config → preview route

3. **Content type creation**
   Prompt: "Create a new content type for EventCard with title, date, location, image fields"
   Relevant new skill: contentful-migration
   Current: MCP call with no script
   New: migration script generated, numbered in migrations/

4. **Live preview debugging**
   Prompt: "Live preview stopped updating fields after I changed the CT structure"
   Relevant new skill: contentful-personalization live-debug + contentful-graphql-nextjs live-preview-rules
   Current: walk through LL-001 through LL-020 manually
   New: structured debugging flow

5. **Which Contentful API to use**
   Prompt: "Should I use GraphQL or REST for this feature?"
   Relevant new skill: contentful-guide
   Current: CC reads CLAUDE.md and answers from memory
   New: contentful-guide skill routes with explicit rationale

6. **Demo env setup**
   Prompt: "Set up a new demo environment for the upcoming Punchbowl demo"
   Relevant new skill: contentful-migration (for env spin-up) + contentful-personalization (onboard)
   Current: manual CT recreation + runbook
   New: migrations/ + onboard sub-skill readiness check

7. **NT audience not matching**
   Prompt: "The geo audience rule works in preview but never matches in production"
   Relevant new skill: contentful-personalization (common-errors: missing geo context, unpublished entries)
   Current: LL-020 manual lookup
   New: doctor flags CDA vs CPA mismatch automatically

8. **Package selection for NT**
   Prompt: "What Ninetailed package should I be using for Next.js App Router?"
   Relevant new skill: contentful-personalization (package-versions.md + sdk-selection.md)
   Current: no formal answer — we have `@ninetailed/experience.js-react` but should have `-next`
   New: skill explicitly calls out this as a common mistake

---

## Audit findings — incorporate these (ARRIVED)

The audit agent completed a full review of all 14 project skills vs contentful/skills patterns.

### Critical finding 1: `add-contentful-block` skill doesn't exist

CLAUDE.md references `/add-contentful-block` as the mandatory entry point for block development. The skill file does not exist anywhere in `.claude/commands/skills/` or `.claude/skills/`. Users who follow CLAUDE.md instructions get a missing skill error.

**Fix:** Create `.claude/skills/add-contentful-block/SKILL.md` as an orchestrator that:
- Asks which phase the user is starting from
- Routes to the right milestone skill
- Enforces phase order with checkpoints

Frontmatter:
```yaml
---
name: add-contentful-block
description: >-
  End-to-end workflow for adding a new Contentful block. Orchestrates
  discovery → GraphQL types → React component → live preview → verification.
  Run when the user wants to add a new block to the site, regardless of
  which specific milestone they mention. Guides through phases sequentially
  with checkpoints. Skip only if the user confirms a phase is already done.
argument-hint: "[block name or description]"
allowed-tools: Bash(bun run *) mcp__contentful__get_content_type mcp__contentful__list_content_types mcp__contentful__search_entries
---
```

### Critical finding 2: Only 1 of 11 skills declares `allowed-tools`

Only `contentful-live-preview-verify` has `allowed-tools`. Every other skill can reach ANY tool when invoked — including destructive MCP operations. This violates the contentful/skills pattern where each skill declares its exact tool contract.

**Fix:** Add `allowed-tools` to every skill's SKILL.md frontmatter. Exact values per skill:

```
contentful-block-discovery:     Bash(ls *) Bash(grep *)
contentful-block-graphql-types: mcp__contentful__get_content_type Bash(grep *)
contentful-block-component:     Bash(bun run *) Bash(bun test *)
contentful-mcp-create-model:    mcp__contentful__create_content_type mcp__contentful__publish_content_type mcp__contentful__create_entry mcp__contentful__publish_entry mcp__contentful__get_content_type mcp__contentful__update_content_type
contentful-block-live-preview:  Bash(bun run *) Bash(bun test *)
test-nt-personalization:        mcp__playwright__browser_navigate mcp__playwright__browser_evaluate mcp__playwright__browser_take_screenshot mcp__playwright__browser_network_requests mcp__playwright__browser_console_messages mcp__contentful__search_entries mcp__contentful__get_entry
demo-setup:                     Bash(bash *) mcp__contentful__create_environment mcp__contentful__list_environments mcp__contentful__search_entries mcp__contentful__create_entry
write-demo-loop:                Bash(ls *) Bash(grep *)
continuous-improvement:         Bash(git log *) Bash(git show *)
skill-creator:                  Bash(bun *)
```

### Finding 3: No AGENTS.md

No single source of truth for multi-agent team role → skill bindings. `/spin-team` has no formal guide.

**Fix:** Create `AGENTS.md` at repo root with:
- Agent role definitions (Content Architect, Frontend Engineer, Preview Specialist, Demo Automation)
- Skill assignments per role
- Phase dependency order
- Coordination rules (what each agent owns in TASKS.md)

### Finding 4: Missing reference files in 5 skills

Skills missing references:
- `contentful-block-discovery`: needs existing-components.md, lessons-checklist.md
- `contentful-block-graphql-types`: needs field-naming-conventions.md, typename-mapping.md
- `contentful-block-component`: needs component-template.md, inspector-mode.md
- `contentful-block-live-preview`: needs enable-draft-route.md, preview-route-template.md
- `test-nt-personalization`: needs nt-config-format.md, profile-rules.md

These are lower priority than findings 1 and 2. Address only if time allows.

### Finding 5: CLAUDE.md additions needed

Add two sections after the "Skills — when to use which" table:
1. **Skill Routing & Triggering** — tier 1 (orchestrators) / tier 2 (milestone) / tier 3 (specialty) table with trigger phrases
2. **Using MCP Tools Safely** — which tools each skill category is allowed to use

The audit agent produced the exact text for both sections. Ask the audit agent summary for the full copy if needed (it's in the task output).

### Implementation priority for audit fixes

| Fix | Impact | Effort | Do now? |
|---|---|---|---|
| Create `add-contentful-block` skill | Critical | Medium | Yes |
| Add `allowed-tools` to all 11 skills | High | Low | Yes |
| Create `AGENTS.md` | Medium | Low | Yes |
| Add CLAUDE.md skill routing section | Medium | Low | Yes |
| Add missing reference files | Low | Medium | If time allows |

---

## Commit format for this branch

```
feat(skills): <what> — <why>
```

Examples:
```
feat(skills): install contentful-guide + migration + personalization — fills gap in CT versioning and NT debugging tooling
feat(skills): add contentful-graphql-nextjs skill — encodes our GraphQL-first patterns that contentful-nextjs REST skill would contradict
docs(skills): add comparison test scenarios — benchmark current vs new skill behavior for upcoming demo
```

---

## Definition of done

**New skills from contentful/skills:**
- [ ] `.claude/skills/contentful-guide/` exists with SKILL.md + references/
- [ ] `.claude/skills/contentful-migration/` exists with SKILL.md + references/
- [ ] `.claude/skills/contentful-personalization/` exists with SKILL.md + all 19 references/
- [ ] `migrations/` directory exists at repo root with README
- [ ] `contentful-cli` and `contentful-migration` in devDependencies
- [ ] `.mcp.json` updated with contentful-personalization server (if binary works)

**Custom GraphQL skill:**
- [ ] `.claude/skills/contentful-graphql-nextjs/` exists with SKILL.md + 7 reference files

**Test scenarios:**
- [ ] `documentation/skills-comparison-test.md` exists with 8 test scenarios

**Audit fixes (from audit agent):**
- [ ] `.claude/skills/add-contentful-block/SKILL.md` created (orchestrator skill)
- [ ] `allowed-tools` added to all 11 existing project skills
- [ ] `AGENTS.md` created at repo root
- [ ] CLAUDE.md updated with skill routing + MCP tool scoping sections

**Quality gates:**
- [ ] Types clean: `bunx tsc --noEmit`
- [ ] PR opened to main

---

## Files to read first in this worktree

1. This handoff doc
2. `CLAUDE.md` (project conventions)
3. `TASKS.md` (active work context)
4. `documentation/lessons-learned/index.md` (for SKILL-AUTHOR agent)
5. `src/services/contentful/client.ts` (for SKILL-AUTHOR agent)
