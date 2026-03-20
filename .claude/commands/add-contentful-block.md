---
description: Orchestrates adding a new Contentful block from plan to delivery. Discovery phase, Q&A, content model proposal and approval, feature branch with TASKS.md, implementation milestones (GraphQL+types, component+config, Contentful MCP, live preview, tests), and check-ins with commit prompts. Use when the user wants to add a new block (e.g. FAQ), create a new Contentful component, or port a metafi/shadcn section into Contentful.
---

You orchestrate adding a new Contentful block to the metafi-nextjs-shadcnblocks app. Work in phases with explicit STOP points; do not skip discovery, Q&A, or content model approval. Follow existing repo patterns only; do not introduce new architectures, doc formats, or tooling unless the user explicitly asks.

## STOP Points (MANDATORY)

You MUST wait for explicit user approval at these checkpoints. Do NOT proceed until user responds.

| STOP | When | What to Show | Wait For |
|------|------|--------------|----------|
| STOP_0 | After discovery | Existing components found, patterns identified | User acknowledgment |
| STOP_1 | After content model proposal | Visual field diagram | "approved" or specific changes |
| STOP_2 | After entry preview | Proposed sample entries | "proceed" or user-provided content |
| STOP_3 | After each milestone | Test results + runtime status | "continue" or debug request |
| STOP_4 | After verification | Final checklist with evidence | User acceptance |

**If user doesn't respond, ask again. Do NOT proceed silently.**

## Required Reading (At Start)

When invoked, read these files first and note relevant patterns:

1. **README.md** – Tech stack, Contentful & Section Style Editor, Page/Hero content types
2. **documentation/component-live-preview.md** – ID-based preview route, enable-draft, merge tags
3. **documentation/content-model-proposal.md** – Content type conventions, field naming
4. **documentation/contentful-personalization-reference.md** – Ninetailed/ntExperiencesCollection
5. **documentation/lessons-learned.md** – Known error patterns and solutions; check before implementation

Do not skip this step.

## Documentation Priority

If docs conflict with code, follow the code. Priority order:
1. The actual code (`src/services/contentful/`, `src/cms-components/hero/`, `src/block-renderer/`)
2. migration-plan.md
3. content-model-proposal.md
4. component-live-preview.md

Ignore archived docs like chatgpt-isr.md.

## Conventions (Strict)

- Use existing code as the source of truth
- Bun for all commands
- No new markdown files except TASKS.md updates
- Internal Name = entry title in Contentful
- Pages have `slug`; sections reference block types
- Live preview per component-live-preview.md
- Do not merge to main or push without user approval; only prompt to commit on branch
- ALWAYS create feature branch before any code changes

## Test Gate (Enforced)

For each milestone:
1. Add or extend unit tests (vitest, same style as `src/block-renderer/block-renderer.test.tsx`)
2. Run `bun test`
3. If tests fail:
   - Fix ONE thing
   - Re-run
   - If still failing after 3 attempts: STOP and report to user with what you tried
   - Do NOT say "pre-existing issues" without evidence (git diff showing test was already failing before your changes)
4. Do not move on until tests pass

## Continuous Improvement

At the end of each milestone:
1. Check lessons-learned.md if any errors occurred
2. If a new error pattern was encountered, add it to lessons-learned.md
3. Archive completed tasks from TASKS.md to archive/tasks-archive.md
4. Keep TASKS.md containing only current and upcoming milestones

Follow `.claude/commands/skills/continuous-improvement.md` for the full protocol.

---

## Phase 0: Discovery

Before asking any questions, follow skill **contentful-block-discovery** (read `.claude/commands/skills/contentful-block-discovery.md`):

### 0a-pre. Research shadcnblocks for a matching component (MANDATORY)

Before searching the local codebase, check shadcnblocks for a pre-built component:

1. Browse https://www.shadcnblocks.com/components to find components matching the block type (e.g. searching "banner", "faq", "hero", "pricing")
2. Identify the best-fit component — consider layout, fields, and visual match
3. Present your finding to the user:

```
## shadcnblocks Match

**Component found:** [name] — [URL]
**Rationale:** [why this is a good fit — layout, fields, visual match]
**Install command:** bunx shadcn add @shadcnblocks/[name]

Shall I use this component as the base, or build a custom one?
```

4. Wait for user to confirm before proceeding
5. If no good match found, note "No shadcnblocks match — will build custom" and continue

> **Auth note:** Premium components require `SHADCNBLOCKS_API_KEY` in `.env.local` and the `@shadcnblocks` registry in `components.json` (already configured in this repo).

### 0a. Search for existing components

```
Search: src/components/sections/ for *[block-name]*.tsx
Search: src/cms-components/ for similar blocks
```

### 0b. Identify patterns from existing cms-components

Read `src/cms-components/hero/hero.tsx` and note:
- How live preview hooks are used
- How fields are accessed
- How fallbacks are handled

### 0c. Check lessons-learned.md

Scan the index for patterns matching this block type (e.g., Rich Text, nested collections, media fields).

### STOP_0: Discovery Report

Present your findings:

```
## Discovery Report

**Existing static component:** [path or "none found"]
**Similar cms-components:** [list or "none"]
**Patterns I'll follow:** [from hero.tsx]
**Relevant lessons:** [LL-XXX list or "none"]

Ready to proceed with Q&A?
```

Wait for user acknowledgment before proceeding.

---

## Phase 1: Q&A Until Plan is Clear

Ask these questions (do not skip any):

- **Block name and purpose:** What is this block called and what does it do?
- **Content source:** Do you have manual copy, should I generate it, or pull from a URL (Firecrawl)?
- **Existing component:** [Reference discovery] Should I port the existing component, or start fresh?
- **Style override:** Will this block use the Section Style Editor app? (Note risks: JSON field, layout variants)
- **Localization:** Should this block be localized? (Default: follow Page/Hero locale pattern)
- **Personalization:** Should this block support Ninetailed experiences? (If yes: include `ntExperiencesCollection`)

Do not proceed until the plan is clear.

---

## Phase 2: Content Model Proposal

Before creating anything in Contentful:

### 2a. Propose content type(s) visually

```
[ContentTypeName]
├── internalName: Symbol (required) — Entry title
├── fieldName: Type (optional) — Description
├── linkedField: Reference → [LinkedType] (many)
└── ntExperiencesCollection: Reference → [NtExperience] (if personalization)

[LinkedType] (if needed)
├── internalName: Symbol (required)
└── fieldName: Type
```

### 2b. Explain field choices

For each field, briefly explain:
- Why it exists
- Validation rules (if any)
- Default values (if any)

### 2c. Pre-creation checklist

Before calling MCP, verify against lessons-learned:
- [ ] Content type name uses spaces for word boundaries ("Faq Item" not "FaqItem") — per LL-006
- [ ] Field IDs are simple (`items` not `itemsCollection`) — per LL-007
- [ ] Media fields use `media` or `backgroundMedia` — per LL-001

### STOP_1: Content Model Approval

Ask:
```
Does this content model look correct?
Reply "approved" to proceed, or tell me what to change.
```

**Do NOT create content types until user says "approved".**

---

## Phase 2.5: Entry Preview

After content model is approved, before creating entries:

### Propose sample entries

```
## Proposed Entries

**[ContentTypeName] Entry 1:**
- internalName: "Homepage [BlockName]"
- title: "[Suggested title]"
- [other fields with sample values]

**[LinkedType] Items (if nested):**
1. "[Item 1 title]" — [brief content]
2. "[Item 2 title]" — [brief content]
3. "[Item 3 title]" — [brief content]
```

### STOP_2: Entry Approval

Ask:
```
Want me to create these sample entries?
- Reply "proceed" to use these
- Reply "yolo" to let me generate content
- Or provide your own content to use instead
```

**Do NOT create entries until user responds.**

---

## Phase 3: Implementation

### Pre-Implementation Check

Read `documentation/lessons-learned.md` and note any lessons relevant to this block type.

### Feature Branch (MANDATORY)

Create feature branch BEFORE any code changes:
```bash
git checkout -b feat/[block-name]-block
```

If not on a feature branch, STOP and create one.

Add tasks to TASKS.md.

### Milestone 1: Types + GraphQL + Mapper

Follow skill **contentful-block-graphql-types** (read `.claude/commands/skills/contentful-block-graphql-types.md`):

1. Fragment type in `src/block-renderer/types.ts`
2. Extend PageSection union in `src/services/contentful/page.ts`
3. Add fragment and PAGE_BY_SLUG in `src/services/contentful/queries.ts`
4. Add raw types + mapper in page.ts
5. Optional: BY_ID query + get-by-ID service for preview

**Tests:** Add or extend unit tests. Run `bun test`; do not proceed until pass.

### STOP_3a: Milestone 1 Verification

Report:
```
## Milestone 1 Complete

- [ ] Fragment type added
- [ ] Query updated
- [ ] Mapper added
- [ ] Tests: [PASS/FAIL]
- [ ] TypeScript: [no errors/X errors]

Ready to proceed to Milestone 2?
```

---

### Milestone 2: Component + Block Config

Follow skill **contentful-block-component** (read `.claude/commands/skills/contentful-block-component.md`):

1. Add `src/cms-components/<name>/<name>.tsx` with `BlockProps`
2. Add `src/cms-components/<name>/index.ts`
3. Use `useLiveUpdates` and `useContentfulInspectorModeProps` for live preview
4. Register in `src/block-renderer/configs/index.ts` with correct typename

**Tests:** Add test(s) that render the new block with mock fragment data. Run `bun test`; do not proceed until pass.

### STOP_3b: Milestone 2 Verification

Report:
```
## Milestone 2 Complete

- [ ] Component created
- [ ] Uses live preview hooks
- [ ] Registered in block configs
- [ ] Tests: [PASS/FAIL]

Ready to proceed to Milestone 3?
```

---

### Milestone 3: Contentful

Follow skill **contentful-mcp-create-model** (read `.claude/commands/skills/contentful-mcp-create-model.md`):

1. Use Contentful MCP to create content type(s) — using approved model from STOP_1
2. Update Page's sections field to allow the new type (if needed)
3. Create entries — using approved content from STOP_2
4. Publish all content types and entries

### STOP_3c: Milestone 3 Verification

Report:
```
## Milestone 3 Complete

- [ ] Content type(s) created and published
- [ ] Entry/entries created and published
- [ ] Page sections field updated (if needed)

Verified in Contentful: [entry URL or MCP confirmation]

Ready to proceed to Milestone 4?
```

---

### Milestone 4: Live Preview (Optional)

If live preview is requested, follow skill **contentful-block-live-preview** (read `.claude/commands/skills/contentful-block-live-preview.md`):

1. Add preview route `src/app/preview/<name>/[entryId]/page.tsx`
2. Add `*_BY_ID` query to queries.ts
3. Add `get*ByEntryId` service function
4. Add enable-draft branch for `type === '<name>'`
5. Note: Set Contentful Preview URL with `{{entry.sys.id}}` merge tag

**Tests:** Add test(s) for get-by-ID or preview route if applicable. Run `bun test`; do not proceed until pass.

### STOP_3d: Milestone 4 Verification

Report:
```
## Milestone 4 Complete

- [ ] Preview route created
- [ ] BY_ID query added
- [ ] get*ByEntryId service added
- [ ] enable-draft branch added
- [ ] Tests: [PASS/FAIL]

Ready to proceed to Milestone 5 (Runtime Verification)?
```

---

### Milestone 5: Runtime Verification (MANDATORY)

This milestone cannot be skipped or declared complete without evidence.

Follow skill **contentful-live-preview-verify** (read `.claude/commands/skills/contentful-live-preview-verify.md`):

1. Provide entry ID and block type to the verification skill
2. Skill navigates to the page and captures:
   - Whether block renders correctly
   - Console errors (if any)
   - Network failures (if any)
   - Known error patterns from lessons-learned.md
3. If live preview enabled, skill also verifies:
   - Preview URL works
   - Live updates function correctly

### STOP_4: Verification Evidence

Present the skill's structured output:

```
## Runtime Verification Results

**Page tested:** /page/[slug]
**Block appears:** [yes/no]
**Content correct:** [yes/no]

**Console errors:** [none or list]
**Network failures:** [none or list]
**Known patterns detected:** [none or LL-XXX list]

(If live preview enabled):
**Preview URL tested:** /preview/[type]/[entryId]
**Preview works:** [yes/no]
**Live updates work:** [yes/no]
```

If any issues are found, debug before requesting acceptance.

### Final Verification Checklist

Present with evidence:

```
## Final Verification Checklist

- [x] Contentful MCP: Content type exists and is published
- [x] Contentful MCP: Entry exists and is published
- [x] bun test passes
- [x] Dev server: Block appears on /page/[slug]
- [x] (If live preview) Preview URL configured in Contentful
- [x] (If live preview) /preview/[type]/[entryId] renders correctly
- [x] No console errors related to new block
- [x] No network failures for new block queries

**All items verified. Ready to commit?**
```

Wait for user acceptance before committing.

---

## When Tests Fail

If `bun test` fails at any milestone:

1. Read the full error message and stack trace
2. Identify the error type:
   - `TypeError: Cannot read property` → Mock data doesn't match fragment type
   - `Type '"X"' is not assignable` → `__typename` case mismatch
   - `Cannot find module` → Import path issue
   - `is not a function` → Named vs default export issue
3. Fix ONE thing
4. Re-run tests
5. If still failing after 3 attempts:
   - STOP
   - Report the error with what you tried
   - Ask user for guidance
   - Do NOT proceed

**NEVER dismiss failures as "pre-existing" without evidence:**
- Run `git diff` to show the test was failing before your changes
- Or show the test file hasn't been modified

### Test Failure Escalation Template

```
## Test Failure - Need Guidance

**Error:** [full error message]

**Attempts:**
1. Tried: [what you tried] → Result: [still failing]
2. Tried: [what you tried] → Result: [still failing]
3. Tried: [what you tried] → Result: [still failing]

**Hypothesis:** [what you think is wrong]

How would you like me to proceed?
```

---

## Check-Ins

At each STOP point:
1. Summarize what was completed
2. Show evidence (test output, verification steps)
3. Ask user to review
4. Do not proceed without response

At final acceptance:
1. Ask user to review and commit on the branch
2. Do not force-push, merge, or proceed without user approval
