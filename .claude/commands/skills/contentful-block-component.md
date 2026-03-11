---
description: Create the React component and block config registration for a new Contentful block. Use at Milestone 2 when adding the cms-component and registering it in block-renderer configs.
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
        <h2 {...getProps({ fieldId: 'headline' })}>
          {fieldName}
        </h2>
      </div>
    </section>
  );
};

export { [BlockName] };
```

### Key Patterns

**Live Preview:**
- `useLiveUpdates(data)` – Returns data that updates in real-time during Contentful preview
- `useContentfulInspectorModeProps(data.sys.id)` – Returns a function to add click-to-edit props
- Use `{...getProps({ fieldId: 'fieldName' })}` on elements that should be clickable in preview

**Field Access:**
- Use `liveData.fieldName` (not `data.fieldName`) for live preview support
- Always provide fallback: `liveData.fieldName ?? 'Default'`

**Live Preview Field Names (LL-008):**
`useLiveUpdates` returns **raw Contentful data** with original field names, not mapped names:
- Mapper converts `media` → `image` for initial data
- But live updates return `media` directly

In your component, check BOTH field names:
```typescript
type RawLiveData = [BlockName]Fragment & { media?: { url?: string } | null };
const imageUrl =
  (liveData as [BlockName]Fragment).image?.url ??
  ((liveData as RawLiveData).media?.url ?? undefined);
```

**Nested Collections:**
```typescript
const items = liveData.itemsCollection?.items ?? [];
{items.map((item) => (
  <div key={item.sys.id}>
    {item.fieldName}
  </div>
))}
```

**Rich Text:**
```typescript
// bun add @contentful/rich-text-react-renderer
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

{liveData.richTextField?.json && documentToReactComponents(liveData.richTextField.json)}
```

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

If porting from a metafi static component:

1. Copy the JSX structure and styling
2. Replace hardcoded data with `liveData.fieldName`
3. Replace hardcoded arrays with `liveData.itemsCollection?.items ?? []`
4. Add `{...getProps({ fieldId: 'fieldName' })}` to editable elements
5. Keep all styling classes (they use the project's design tokens)

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

  expect(screen.getByRole('heading', { level: 2 })).toBeTruthy();
  expect(screen.getByText('Expected Text')).toBeTruthy();
});
```

Run `bun test`. All tests must pass before proceeding.

## Common Issues

**`Cannot find module '@/cms-components/[name]'`**
- Check the directory name matches the import
- Check index.ts exports the component

**`typename 'X' not found in blockConfigs`**
- The `typename` in config must match `__typename` exactly (case-sensitive)

**`Component is not a function`**
- Check export is named export: `export { [BlockName] }` not `export default`

**Test fails with undefined**
- Mock data missing required fields
- Add `sys: { id: 'test-1', spaceId: 'test' }`
- Add `__typename: '[BlockName]' as const`

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
