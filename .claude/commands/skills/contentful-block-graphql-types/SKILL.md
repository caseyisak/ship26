---
name: contentful-block-graphql-types
description: Add GraphQL fragment types, queries, and mappers for a new Contentful block. Use at Milestone 1 when adding types.ts, queries.ts, and page.ts modifications for a new block type.
---

# Contentful Block: GraphQL + Types

This skill adds the GraphQL fragment, TypeScript types, and page mapper for a new Contentful block. Follow this at Milestone 1 of the add-contentful-block workflow.

## Required Reading

Before following this skill, ensure you've read:
- `src/block-renderer/types.ts` – Existing fragment types (HeroFragment)
- `src/services/contentful/queries.ts` – HERO_FIELDS, PAGE_BY_SLUG patterns
- `src/services/contentful/page.ts` – PageSection union, RawHero, mapSection
- `documentation/lessons-learned.md` – Known issues to avoid

## Pre-Implementation Verification (MANDATORY)

Before writing any code, use Contentful MCP to verify field names:

1. Call `get_content_type(content_type_id: "[typename]")`
2. Extract field IDs from response – these are your GraphQL field names
3. Document the mapping:

```
Content Type: [typename]
Fields:
  - fieldId (Type) → fieldId: type | null
```

**Field type mapping:**
- Symbol/Text → `string | null`
- Integer/Number → `number | null`
- Boolean → `boolean | null`
- Media/Asset → `{ url?: string; width?: number; height?: number } | null`
- Rich Text → `{ json: unknown } | null`
- Reference (single) → `LinkedFragmentType | null`
- Reference (many) → `{ items: LinkedFragmentType[] } | null`
- JSON → `unknown` (parse at runtime)

## Touch Point 1: Fragment Type (`src/block-renderer/types.ts`)

Add the fragment type definition after existing types:

```typescript
/** [BlockName] section (matches Contentful [BlockName] content type). */
export type [BlockName]Fragment = BlockData & {
  __typename: '[BlockName]';
  internalName?: string | null;
  // Add fields from verification step
  // For nested collections: itemsCollection?: { items: LinkedFragment[] } | null;
  // For personalization: ntExperiencesCollection?: { items: Array<{ __typename?: string; sys?: { id: string } }> };
};
```

For nested/linked types, add a separate fragment:

```typescript
export type [LinkedType]Fragment = {
  __typename: '[LinkedType]';
  sys: { id: string };
  // fields...
};
```

## Touch Point 2: GraphQL Fragment (`src/services/contentful/queries.ts`)

Add the `*_FIELDS` constant:

```typescript
/** [BlockName] fields. */
const [BLOCKNAME]_FIELDS = `
  __typename
  sys { id }
  ... on [BlockName] {
    internalName
    // Add fields matching Contentful field IDs exactly
    // For nested: itemsCollection(limit: 50) { items { ...nested fields... } }
    // For personalization: ntExperiencesCollection(limit: 10) { items { __typename sys { id } } }
  }
`;
```

Then add to `PAGE_BY_SLUG` inside `sectionsCollection.items`:

```typescript
sectionsCollection(limit: 20) {
  items {
    ${HERO_FIELDS}
    ${[BLOCKNAME]_FIELDS}  // Add this line
  }
}
```

**Collection Field Naming (LL-007):**
- Contentful adds "Collection" suffix to all array/reference fields
- Field ID `items` → Query as `itemsCollection`
- Field ID `itemsCollection` → Query as `itemsCollectionCollection` (avoid this!)

**Media Field Naming Convention:**
- Use `media { url }` in GraphQL (matches Contentful field ID)
- Use `backgroundMedia { url }` for background images
- The mapper will rename these to `image` and `backgroundImage`

## Touch Point 3: Page Mapper (`src/services/contentful/page.ts`)

### 3a. Import the fragment type

```typescript
import type { [BlockName]Fragment, HeroFragment } from '@/block-renderer/types';
```

### 3b. Extend PageSection union

```typescript
export type PageSection = HeroFragment | [BlockName]Fragment;
```

### 3c. Add Raw type for API response

```typescript
type Raw[BlockName] = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  // Mirror the fragment type fields
};
```

### 3d. Add mapper function

```typescript
function map[BlockName](item: Raw[BlockName]): [BlockName]Fragment {
  return {
    __typename: '[BlockName]',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    // Map all fields with ?? null for optional fields
  };
}
```

### 3e. Extend mapSection discriminator

```typescript
function mapSection(item: RawHero | Raw[BlockName] | null): PageSection | null {
  if (!item) return null;
  if (item.__typename === 'Hero') return mapHero(item as RawHero);
  if (item.__typename === '[BlockName]') return map[BlockName](item as Raw[BlockName]);
  return null;
}
```

### 3f. Update PageBySlugResponse type

Add the new Raw type to the sections array type.

## For Nested Types

If the block has linked entries (like FAQ → FaqItem):

1. Add `[LinkedType]Fragment` in types.ts
2. Add `[LINKEDTYPE]_FIELDS` as a separate constant in queries.ts, include inside parent's `itemsCollection`
3. Add `Raw[LinkedType]` type in page.ts
4. Add `map[LinkedType]` function that returns `[LinkedType]Fragment | null`
5. In parent mapper: `itemsCollection: item.itemsCollection ? { items: item.itemsCollection.items.map(map[LinkedType]).filter(Boolean) as [LinkedType]Fragment[] } : null`

## Test Step

Add or extend unit tests in `src/block-renderer/block-renderer.test.tsx`:

```typescript
it('renders [BlockName] with mock [BlockName] data', () => {
  const mock[BlockName] = {
    __typename: '[BlockName]' as const,
    sys: { id: '[block]-1', spaceId: 'test' },
    internalName: 'Test [BlockName]',
    // All fields from fragment type
    // For nested: itemsCollection: { items: [...] }
  };

  render(
    <LivePreviewProvider locale="en-US">
      <BlockRenderer data={mock[BlockName]} />
    </LivePreviewProvider>,
  );

  // This will fail until Milestone 2 adds the component
  // The test validates the type setup is correct
});
```

Run `bun test`. The test may fail until the component exists (Milestone 2), but there should be no TypeScript errors.

## Test Enforcement (STRICT)

If `bun test` fails:

### Step 1: Diagnose
Read the full error. Identify the type:
- **Type error** → Fragment type doesn't match mock data or query response
- **Import error** → Module path incorrect
- **Assertion error** → Test expectations don't match implementation

### Step 2: Fix ONE thing
Make a single, targeted fix based on diagnosis.

### Step 3: Re-run
Run `bun test` again.

### Step 4: Iterate or Escalate
- If passes: proceed to Milestone 2
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

- [ ] Contentful MCP `get_content_type` verified field names
- [ ] Fragment type added to `types.ts`
- [ ] `*_FIELDS` constant added to `queries.ts`
- [ ] Fragment added to `PAGE_BY_SLUG` sectionsCollection
- [ ] `PageSection` union extended in `page.ts`
- [ ] Raw type added to `page.ts`
- [ ] Mapper function added to `page.ts`
- [ ] `mapSection` discriminator extended
- [ ] No TypeScript errors
- [ ] Tests run and pass (or escalated if failing)

Do not proceed to Milestone 2 until this checklist is complete and there are no TypeScript errors.
