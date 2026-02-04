---
name: add-contentful-block
description: Orchestrates adding a new Contentful block from plan to delivery. Q&A (content source, existing component, style override, localization, personalization), content model proposal and approval, feature branch with TASKS.md, implementation milestones (GraphQL+types, component+config, Contentful MCP, live preview, tests), and check-ins with commit prompts. Use when the user wants to add a new block (e.g. FAQ), create a new Contentful component, or port a metafi/shadcn section into Contentful.
---

You orchestrate adding a new Contentful block to the metafi-nextjs-shadcnblocks app. Work in phases; do not skip Q&A or content model approval. Follow existing repo patterns only; do not introduce new architectures, doc formats, or tooling unless the user explicitly asks.

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

## Test Gate

For each milestone, add or extend unit tests (vitest, same style as `src/block-renderer/block-renderer.test.tsx`). Run `bun test`. Do not move on to the next milestone until tests pass.

## Continuous Improvement

At the end of each milestone:
1. Check lessons-learned.md if any errors occurred
2. If a new error pattern was encountered, add it to lessons-learned.md
3. Archive completed tasks from TASKS.md to archive/tasks-archive.md
4. Keep TASKS.md containing only current and upcoming milestones

Follow `.cursor/skills/continuous-improvement/SKILL.md` for the full protocol.

## Phase 1: Q&A Until Plan is Clear

Ask these questions before proceeding:

- **Block name and purpose:** What is this block called and what does it do?
- **Content source:** Do you have manual copy, should I generate it, or pull from a URL (Firecrawl)?
- **Existing component:** Is there a metafi static component (e.g. `src/components/sections/metafi-faq.tsx`) or a shadcn block URL/snippet to port?
- **Style override:** Will this block use the Section Style Editor app? (Note risks: JSON field, layout variants)
- **Localization:** Should this block be localized? (Default: follow Page/Hero locale pattern)
- **Personalization:** Should this block support Ninetailed experiences? (If yes: include `ntExperiencesCollection`)

Do not proceed until the plan is clear.

## Phase 2: Content Model Proposal

Before creating anything in Contentful:

1. Propose content type(s) and fields using repo conventions
2. Check existing types (Hero, Page) via Contentful MCP or codebase for consistent field naming
3. Present the proposal: "Here's the content model I'll create; does anything need to change?"

Wait for user approval before proceeding.

## Phase 3: Implementation

### Pre-Implementation Check

Read `documentation/lessons-learned.md` and note any lessons relevant to this block type (Rich Text handling, nested collections, field naming). Reference these during implementation.

### Feature Branch

Create feature branch (e.g. `feat/faq-block`). Add tasks to TASKS.md.

### Milestone 1: Types + GraphQL + Mapper

Follow skill **contentful-block-graphql-types**:

1. Fragment type in `src/block-renderer/types.ts`
2. Extend PageSection union in `src/services/contentful/page.ts`
3. Add fragment and PAGE_BY_SLUG in `src/services/contentful/queries.ts`
4. Add raw types + mapper in page.ts
5. Optional: BY_ID query + get-by-ID service for preview

**Tests:** Add or extend unit tests (BlockRenderer with mock new-type data). Run `bun test`; do not proceed until pass.

After tests pass: Follow continuous-improvement skill.

### Milestone 2: Component + Block Config

Follow skill **contentful-block-component**:

1. Add `src/cms-components/<name>/<name>.tsx` with `BlockProps`
2. Add `src/cms-components/<name>/index.ts`
3. Use `useLiveUpdates` and `useContentfulInspectorModeProps` for live preview
4. Register in `src/block-renderer/configs/index.ts` with correct typename

**Tests:** Add test(s) that render the new block with mock fragment data. Run `bun test`; do not proceed until pass.

After tests pass: Follow continuous-improvement skill.

### Milestone 3: Contentful

Follow skill **contentful-mcp-create-model**:

1. Use Contentful MCP to create content type(s)
2. Update Page's sections field to allow the new type (if needed)
3. Create at least one entry (and linked entries)
4. Use user-provided copy, generated copy, or scraped copy from URL

After completion: Follow continuous-improvement skill.

### Milestone 4: Live Preview (Optional)

If live preview is requested, follow skill **contentful-block-live-preview**:

1. Add preview route `src/app/preview/<name>/[entryId]/page.tsx`
2. Add `*_BY_ID` query to queries.ts
3. Add `get*ByEntryId` service function
4. Add enable-draft branch for `type === '<name>'`
5. Note: Set Contentful Preview URL with `{{entry.sys.id}}` merge tag

**Tests:** Add test(s) for get-by-ID or preview route if applicable. Run `bun test`; do not proceed until pass.

After tests pass: Follow continuous-improvement skill.

### Milestone 5: Verification

1. Re-run full test suite: `bun test`
2. Start dev server: `bun run dev`
3. Verify section appears on a page with expected content
4. (If live preview) Verify preview works from Contentful

Run the Final Verification Checklist:
- [ ] Contentful MCP: Content type exists and is published
- [ ] Contentful MCP: At least one entry exists and is published
- [ ] bun test passes with new block test
- [ ] Dev server: New section appears on a page
- [ ] (If live preview) Preview URL in Contentful is configured
- [ ] (If live preview) /preview/[type]/[entryId] renders the component

Then check-in and prompt user to commit.

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

If still failing after 3 attempts: Report the error to the user with what you tried; do NOT proceed.

## Check-Ins

At each milestone:
1. Summarize what was completed
2. Ask user to review and commit on the branch
3. Do not force-push, merge, or proceed without user approval
