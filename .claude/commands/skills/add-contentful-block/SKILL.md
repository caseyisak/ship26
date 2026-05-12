---
name: add-contentful-block
description: End-to-end orchestrator for adding a new Contentful-driven block to this project. MANDATORY entry point — use this skill before writing any code for a new content type, block component, or integration. Covers: discovery → content model approval → migration script → GraphQL query → React component → live preview → NT personalization → tests → visual QA. Never skip steps.
metadata:
  author: skills-upgrade
  version: 1.0.0
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - mcp__contentful__get_content_type
  - mcp__contentful__list_content_types
  - mcp__contentful__create_content_type
  - mcp__contentful__update_content_type
  - mcp__contentful__publish_content_type
  - mcp__contentful__create_entry
  - mcp__contentful__update_entry
  - mcp__contentful__publish_entry
  - mcp__contentful__search_entries
  - mcp__contentful__get_entry
  - mcp__playwright__browser_navigate
  - mcp__playwright__browser_snapshot
  - mcp__playwright__browser_take_screenshot
  - mcp__playwright__browser_evaluate
  - mcp__playwright__browser_console_messages
---

# Add Contentful Block — Orchestrator

This is the **mandatory entry point** for adding any new block, content type, or integration. It coordinates all sub-skills in the correct order. Never skip to implementation without completing discovery and approval first.

## Phase 0 — Discovery

Before proposing any content model or writing any code, run discovery:

### Step 1: Check existing blocks

```bash
# Is there already a similar block?
ls src/cms-components/
```

Check `TASKS.md` "blocks inventory" table. If a similar block exists, extend it rather than creating a new one.

### Step 2: Check existing content types

```bash
# Via MCP:
mcp__contentful__list_content_types  # in space uumzxfocy3ef, env master
```

Confirm the CT doesn't already exist with a different name.

### Step 3: Check shadcnblocks

Before building any new UI, search shadcnblocks for a matching component:
- Browse: `https://www.shadcnblocks.com` by section type
- Install: `bunx shadcn add @shadcnblocks/[block-name]`
- Share the link + rationale, ask user to confirm before installing

### Step 4: Check the static template

Reference `metafi-nextjs-template-1.0.0/` for layout patterns (read-only, never modify).

---

## Phase 1 — Content Model Q&A

Before creating anything in Contentful, ask these questions and wait for answers:

1. **Block name:** What is the content type ID (camelCase, e.g. `iconFeatureGrid`)? What is the display name?
2. **Display field:** Which field shows in the Contentful entry list? (usually `internalName`)
3. **Fields:** Walk through each field — name, type, required?, help text?
4. **References:** What other CTs does this block reference? (buttons, media, sub-items)
5. **Personalization:** Will this block support NT experiences? (determines if we need `ntExperiencesCollection`)
6. **Demo use:** Is this for the sandbox or a specific demo? (affects environment)
7. **Sample entry:** What content goes in the first sample entry for testing?

Present the proposed content model as a table and **wait for explicit approval** before proceeding:

```
Proposed Content Type: [id]
Display Name: [name]
Display Field: [field]

| Field ID | Display Name | Type | Required | Notes |
|----------|-------------|------|----------|-------|
| internalName | Internal Name | Symbol | ✅ | Entry list display |
| headline | Headline | Symbol | ✅ | — |
| ...
```

**Do not create the CT until the user says "approved" or equivalent.**

---

## Phase 2 — Migration Script

Once the content model is approved, write a migration script **before** creating via MCP:

```javascript
// migrations/NNN-[block-name].js
// [date] — [description]
// Fields: [list]
// Reason: [why this block exists]
module.exports = function(migration) {
  const blockType = migration.createContentType('[ctId]', {
    name: '[Display Name]',
    description: '[Purpose]',
    displayField: 'internalName',
  });

  blockType.createField('internalName', {
    name: 'Internal Name',
    type: 'Symbol',
    required: true,
  });

  // ... all other fields
};
```

Then run the migration:
```bash
# Dry run first
bunx contentful space migration \
  --space-id uumzxfocy3ef \
  --environment-id master \
  --yes \
  migrations/NNN-[block-name].js --dry-run

# If dry run looks good, run for real
bunx contentful space migration \
  --space-id uumzxfocy3ef \
  --environment-id master \
  --yes \
  migrations/NNN-[block-name].js
```

**If MCP was already used to create the CT** (e.g., via `contentful-mcp-create-model` skill), still write the migration script retroactively as documentation.

---

## Phase 3 — GraphQL Fragment + Query

See `/skills:contentful-graphql-nextjs` for full patterns. Summary:

1. **Define fragment** in `src/services/contentful/queries.ts`:
```typescript
export const [BLOCK]_PAGE_FIELDS = `
  fragment [Block]PageFields on [Typename] {
    sys { id __typename }
    internalName
    // ... all page-level fields
  }
`;
```

2. **Define BY_ID query** (include `ntExperiencesCollection` only if personalizable):
```typescript
export const [BLOCK]_BY_ID = `
  query [Block]ById($id: String!, $preview: Boolean) {
    [ctId](id: $id, preview: $preview) {
      ...[Block]PageFields
      // NT fields here if applicable
    }
  }
  ${[BLOCK]_PAGE_FIELDS}
`;
```

3. **Add to PAGE_BY_SLUG query** in the `sectionsCollection` inline fragment selection.

4. **Add TypeScript types** to `src/block-renderer/types.ts`.

---

## Phase 4 — React Component

**Architecture rules (never violate):**
- Component receives raw GraphQL data (not transformed)
- Call `useLiveUpdates(rawData)` at the top of the component
- Add inspector mode props: `useContentfulInspectorMode()`
- Transform data AFTER `useLiveUpdates()` returns

**Component scaffold:**
```typescript
// src/cms-components/[block-name]/[block-name].tsx
'use client';

import { useLiveUpdates } from '@/lib/live-preview';
import { useContentfulInspectorMode } from '@contentful/live-preview/react';
import type { [Block]Fields } from '@/block-renderer/types';

interface [Block]Props {
  data: [Block]Fields;
}

export function [Block]({ data }: [Block]Props) {
  const { data: liveData } = useLiveUpdates(data);
  const inspectorProps = useContentfulInspectorMode({ entryId: liveData.sys.id });

  // Transform after live updates
  const headline = liveData.headline ?? '';

  return (
    <section>
      <h2 {...inspectorProps({ fieldId: 'headline' })}>{headline}</h2>
    </section>
  );
}
```

5. **Register in block-renderer:**
```typescript
// src/block-renderer/configs/index.ts
'[Typename]': dynamic(() => import('@/cms-components/[block-name]/[block-name]')
  .then(m => ({ default: m.[Block] })), { ssr: false }),
```

---

## Phase 5 — Sample Entry + Visual Test

1. Create a sample entry via Contentful MCP:
   - Use `mcp__contentful__create_entry` with `contentTypeId: '[ctId]'`
   - Fill all required fields
   - Publish with `mcp__contentful__publish_entry`

2. Add to a page's `sectionsCollection` (update the page entry)

3. Visual test with Playwright MCP:
   - Navigate to `/page/home?preview=true` (or relevant page)
   - Take screenshot: `mcp__playwright__browser_take_screenshot`
   - Check console for errors: `mcp__playwright__browser_console_messages`
   - Confirm the block renders

4. Test live preview:
   - Navigate to `/api/enable-draft?secret=kaz&entryId=[id]&type=[blockType]`
   - Take screenshot in draft mode
   - Make a field change via MCP → confirm live update appears

---

## Phase 6 — NT Personalization (if applicable)

If the block supports personalization, use `/skills:contentful-personalization` sub-skill `develop`:

1. Create `nt_audience` entry
2. Create a variant entry of the block type
3. Create `nt_experience` entry linking audience + variants
4. Add `ntExperiencesCollection` to the `*_BY_ID` query
5. Wire `NtExperiencesContext` or NT experience rendering in component
6. Test with Playwright MCP + NT Preview bar

---

## Phase 7 — Tests

```bash
# Type check
bunx tsc --noEmit

# Tests
bun test

# Lint
bun run lint
```

Write a test file `src/cms-components/[block-name]/[block-name].test.tsx` covering:
- Renders with required fields
- Renders with optional fields absent
- Snapshot test

See existing test files for the `vi.mock` pattern for Radix UI components.

---

## Phase 8 — Update Inventory

After all phases complete:

1. Add block to `TASKS.md` "blocks inventory" table
2. Write LL entry if any non-obvious issues were encountered
3. Commit with format: `feat([block-name]): add [Block] CT, component, and live preview — [why it exists]`

---

## Milestone Summary

| Phase | Output | Approval needed? |
|-------|--------|-----------------|
| 0 — Discovery | Existing block/CT check, shadcnblocks candidate | — |
| 1 — Content model Q&A | Proposed CT table | ✅ MUST approve |
| 2 — Migration script | `migrations/NNN-*.js` | No |
| 3 — GraphQL | Fragment + query + types | No |
| 4 — Component | React component + block-renderer registration | No |
| 5 — Sample entry + visual | Screenshot proof | ✅ Confirm renders |
| 6 — NT (if needed) | Experience wired + tested | ✅ Confirm personalization |
| 7 — Tests | All tests pass | ✅ Must be green |
| 8 — Inventory | TASKS.md updated | No |
