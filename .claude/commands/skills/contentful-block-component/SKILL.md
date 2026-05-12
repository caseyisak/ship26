---
name: contentful-block-component
description: Milestone 2 of the Contentful block workflow — run when it's time to build the React component and register it in the block config. Invoke when user says "create the component", "build the React component", "add the cms-component", "register the block", "Milestone 2", or when types are done and the component is the next step. Skip for GraphQL/types work (use contentful-block-graphql-types) or creating Contentful content types (use contentful-mcp-create-model).
metadata:
  author: metafi-project
  version: 1.0.0
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# Contentful Block: Component + Config

This skill creates the React component and registers it with the block renderer. Follow this at Milestone 2 of the add-contentful-block workflow.

## Required Reading

Before following this skill, ensure you've read:
- `src/cms-components/hero/hero.tsx` – Reference component structure
- `src/cms-components/hero/index.ts` – Export pattern
- `src/block-renderer/configs/index.ts` – Block config registration
- `src/lib/live-preview.tsx` – `useLiveUpdates`, `useContentfulInspectorModeProps`

## Prerequisites

Milestone 1 must be complete:
- Fragment type exists in `src/block-renderer/types.ts`
- GraphQL fragment exists in `src/services/contentful/queries.ts`
- Mapper exists in `src/services/contentful/page.ts`

## Touch Point 4a: Component File (`src/cms-components/<name>/<name>.tsx`)

Create the component file:

```typescript
'use client';

import React from 'react';

import type { [BlockName]Fragment } from '@/block-renderer/types';
import { BlockProps } from '@/block-renderer/types';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { cn } from '@/lib/utils';

const [BlockName] = ({ data, className, ...props }: BlockProps<[BlockName]Fragment>) => {
  // Live preview support
  const liveData = useLiveUpdates(data);
  const getProps = useContentfulInspectorModeProps(data.sys.id);

  // Extract fields with fallbacks
  const fieldName = liveData.fieldName ?? 'Default Value';

  return (
    <section
      id="[block-name]"
      className={cn('py-16 md:py-24', className ?? '')}
      {...props}
    >
      <div className="container px-6">
        {/* Render content with inspector props for live preview click-to-edit */}
        <h2 {...getProps({ fieldId: 'headline' })}>
          {fieldName}
        </h2>
        {/* Rest of component */}
      </div>
    </section>
  );
};

export { [BlockName] };
```

### Key Patterns

See [`references/live-preview-patterns.md`](references/live-preview-patterns.md) for:
- Live preview hook usage (`useLiveUpdates`, `useContentfulInspectorModeProps`)
- LL-008: media→image field name handling in live updates
- Nested collections pattern
- Rich text rendering

## Touch Point 4b: Index Export (`src/cms-components/<name>/index.ts`)

```typescript
export { [BlockName] } from './[block-name]';
```

## Touch Point 5: Block Config (`src/block-renderer/configs/index.ts`)

### 5a. Import the fragment type and component

```typescript
import type {
  BlockConfig,
  BlockData,
  [BlockName]Fragment,
  HeroFragment,
} from '@/block-renderer/types';
import { [BlockName] } from '@/cms-components/[block-name]';
import { Hero } from '@/cms-components/hero';
```

### 5b. Add the config object

```typescript
const [blockName]Config: BlockConfig<[BlockName]Fragment> = {
  typename: '[BlockName]',  // Must match __typename exactly (case-sensitive!)
  layouts: {
    default: () => [BlockName],
  },
};
```

### 5c. Add to blockConfigs array

```typescript
export const blockConfigs: BlockConfig<BlockData>[] = [
  heroConfig as BlockConfig<BlockData>,
  [blockName]Config as BlockConfig<BlockData>,  // Add this line
];
```

## Porting from Existing Component

See [`references/live-preview-patterns.md`](references/live-preview-patterns.md) for the porting checklist.

## Test Step

Update the test in `src/block-renderer/block-renderer.test.tsx`:

```typescript
it('renders [BlockName] with mock [BlockName] data', () => {
  const mock[BlockName] = {
    __typename: '[BlockName]' as const,
    sys: { id: '[block]-1', spaceId: 'test' },
    internalName: 'Test [BlockName]',
    // All fields from fragment type with realistic test values
  };

  render(
    <LivePreviewProvider locale="en-US">
      <BlockRenderer data={mock[BlockName]} />
    </LivePreviewProvider>,
  );

  // Assert key content renders
  expect(screen.getByRole('heading', { level: 2 })).toBeTruthy();
  expect(screen.getByText('Expected Text')).toBeTruthy();
});
```

Run `bun test`. All tests must pass before proceeding.

## Common Issues

See [`references/live-preview-patterns.md`](references/live-preview-patterns.md) for common issues and solutions.

## Test Enforcement (STRICT)

If `bun test` fails:

### Step 1: Diagnose
Read the full error. Identify the type:
- **Type error** → Mock data doesn't match fragment type, or props mismatch
- **Runtime error** → Component throws during render
- **Import error** → Module path or export issue
- **Assertion error** → Expected content not rendered

### Step 2: Fix ONE thing
Make a single, targeted fix based on diagnosis.

### Step 3: Re-run
Run `bun test` again.

### Step 4: Iterate or Escalate
- If passes: proceed to Milestone 3
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

- [ ] Component file created at `src/cms-components/<name>/<name>.tsx`
- [ ] Index file created at `src/cms-components/<name>/index.ts`
- [ ] Component uses `useLiveUpdates` and `useContentfulInspectorModeProps`
- [ ] Fragment type imported in configs/index.ts
- [ ] Component imported in configs/index.ts
- [ ] Config object added with correct `typename`
- [ ] Config added to `blockConfigs` array
- [ ] `bun test` passes (or escalated if failing)
- [ ] No TypeScript errors

Do not proceed to Milestone 3 until this checklist is complete and tests pass.
