---
name: contentful-block-live-preview
description: Milestone 4 of the Contentful block workflow — run when it's time to wire up live preview for a new block (preview route, BY_ID query, get-by-ID service, enable-draft branch). Invoke when user says "add live preview", "wire up preview route", "set up the preview URL", "add the BY_ID query", "enable direct preview", or "Milestone 4". Skip for page-level live preview debugging (see page-content-live.tsx) or verifying preview works (use contentful-live-preview-verify).
metadata:
  author: metafi-project
  version: 1.0.0
---

# Contentful Block: Live Preview

This skill adds ID-based live preview support so a block can be previewed directly from Contentful (without needing a page). Follow this at Milestone 4 of the add-contentful-block workflow.

## Required Reading

Before following this skill, ensure you've read:
- `documentation/component-live-preview.md` – Full ID-based preview documentation
- `src/app/preview/hero/[entryId]/page.tsx` – Reference preview route
- `src/services/contentful/hero.ts` – Reference get-by-ID service
- `src/app/api/enable-draft/route.ts` – Enable-draft route with type branches

## Prerequisites

Milestones 1-3 must be complete:
- Fragment type, queries, and mapper exist
- Component and block config exist
- Content type and entry exist in Contentful

## Touch Point 6: BY_ID Query (`src/services/contentful/queries.ts`)

Add the BY_ID query after the `*_FIELDS` constant.

> See [`references/code-templates.md`](references/code-templates.md) for the full code template.

**Note:** The collection name is `[blockName]Collection` (camelCase with Collection suffix).

## Touch Point 7: Get-by-ID Service (`src/services/contentful/<name>.ts`)

Create a new service file.

> See [`references/code-templates.md`](references/code-templates.md) for the full code template.

## Touch Point 8: Preview Route (`src/app/preview/<name>/[entryId]/page.tsx`)

Create the preview route.

> See [`references/code-templates.md`](references/code-templates.md) for the full code template.

## Touch Point 9: Enable-Draft Branch (`src/app/api/enable-draft/route.ts`)

Add a branch for the new type. Find the existing Hero branch and add after it.

> See [`references/code-templates.md`](references/code-templates.md) for the full code template.

**Important:** The `type` value must be lowercase (e.g., `type === 'faq'` not `type === 'Faq'`).

## Contentful Configuration

After implementing, configure Contentful:

1. Go to **Settings → Content preview**
2. Find or create preview config for the content type
3. Set **Preview URL** to:
   ```
   https://YOUR_APP_URL/api/enable-draft?secret=YOUR_SECRET&entryId={{entry.sys.id}}&type=[name]
   ```
4. Use the UI's "Insert variable" → "Entry ID" to ensure the merge tag resolves

**Common issue:** If you see `{entry.sys.id_NOT_FOUND}` in the URL, the merge tag wasn't set correctly in Contentful.

## Test Step

Add test for the get-by-ID service or preview route if applicable:

```typescript
// Optional: test the mapper or service
it('maps [BlockName] correctly from raw data', () => {
  const raw = {
    __typename: '[BlockName]',
    sys: { id: 'test-1' },
    // ... fields
  };
  const result = map[BlockName](raw);
  expect(result?.__typename).toBe('[BlockName]');
  expect(result?.sys.id).toBe('test-1');
});
```

Run `bun test`. All tests must pass before proceeding.

## Verification

After implementation, verify:

1. **enable-draft route works:**
   ```
   curl "http://localhost:3000/api/enable-draft?secret=YOUR_SECRET&entryId=ENTRY_ID&type=[name]"
   ```
   Should redirect to `/preview/[name]/ENTRY_ID`

2. **Preview route renders:**
   Navigate to `http://localhost:3000/preview/[name]/ENTRY_ID` (with draft mode enabled)
   Should render the component

3. **Contentful preview works:**
   Open entry in Contentful → Click "Open preview"
   Should load the component in the preview iframe

4. **Live updates work:**
   Edit a field in Contentful
   Should see the change in the preview iframe within seconds

## Common Issues

See [`references/code-templates.md`](references/code-templates.md) for common issues and solutions.

## Test Enforcement (STRICT)

If `bun test` fails:

### Step 1: Diagnose
Read the full error. Identify the type:
- **Type error** → Service function types don't match fragment
- **Import error** → Query or service import path issue
- **Runtime error** → Preview route throws during render
- **Assertion error** → Mapper doesn't return expected data

### Step 2: Fix ONE thing
Make a single, targeted fix based on diagnosis.

### Step 3: Re-run
Run `bun test` again.

### Step 4: Iterate or Escalate
- If passes: proceed to Milestone 5 (Verification)
- If fails with DIFFERENT error: repeat from Step 1
- If fails with SAME error after 3 attempts: STOP and escalate

### Escalation Template (after 3 failed attempts)

Report to user:
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

### NOT ALLOWED

- "Tests are pre-existing issues" (without git diff evidence)
- "Proceeding anyway"
- "Will fix later"
- Skipping test step

---

## Completion Checklist

- [ ] `*_BY_ID` query added to queries.ts
- [ ] `get*ByEntryId` service function created
- [ ] Preview route created at `src/app/preview/<name>/[entryId]/page.tsx`
- [ ] Enable-draft branch added for `type === '<name>'`
- [ ] Contentful Preview URL configured with merge tag
- [ ] `bun test` passes (or escalated if failing)
- [ ] Manual verification: preview loads from Contentful

Do not mark Milestone 4 complete until this checklist is verified.
