---
name: contentful-block-discovery
description: Starting point for all new Contentful block development. Run this before any other block skill — before writing GraphQL types, creating content types, or building React components — when the user's goal is to add a new block or section to the site. The key signal is NEW block work beginning, not which specific task they mention. Skip only when the user has confirmed discovery is already done, or the request is about fixing/debugging an existing block.
metadata:
  author: metafi-project
  version: 1.0.0
allowed-tools:
  - Read
  - Glob
  - Grep
  - mcp__contentful__list_content_types
  - mcp__contentful__get_content_type
  - mcp__contentful__search_entries
---

# Contentful Block: Discovery

This skill performs the discovery phase before asking Q&A questions. It helps the agent understand existing patterns and avoid reinventing the wheel.

## When to Use

At Phase 0 of the add-contentful-block workflow, BEFORE asking any Q&A questions.

## Required Actions

### 1. Search for existing static component

Look for a component that might already implement this UI:

**Search paths:**
- `src/components/sections/*[block-name]*.tsx`
- `src/components/sections/metafi-*.tsx`
- `src/components/*[block-name]*.tsx`

If found, note:
- File path
- How it renders (layout, styling)
- What data it expects (props structure)
- Whether it's suitable for porting

**Example search for FAQ block:**
```
Glob: src/components/sections/*faq*.tsx
Glob: src/components/sections/metafi-faq*.tsx
```

### 2. Check existing cms-components

List all existing Contentful-integrated components:

```
LS: src/cms-components/
```

For each existing component, note:
- How it uses `useLiveUpdates`
- How it accesses fields
- How it handles nested collections
- Error handling patterns

**Current cms-components to check:**
- `hero/` — Reference implementation for all patterns
- `faq/` — Example of nested collections
- `tabbed-content/` — Example of complex nested structure

### 3. Read Hero as reference (MANDATORY)

Always read `src/cms-components/hero/hero.tsx` as the canonical example.

Note specifically:
- Live preview hook usage pattern:
  ```typescript
  const liveData = useLiveUpdates(data);
  const getProps = useContentfulInspectorModeProps(data.sys.id);
  ```
- Field access with fallbacks:
  ```typescript
  const fieldValue = liveData.fieldName ?? 'fallback';
  ```
- Inspector mode props usage:
  ```typescript
  <h1 {...getProps({ fieldId: 'headline' })}>{headline}</h1>
  ```
- How media/image fields are handled (LL-008):
  ```typescript
  // Check both mapped and raw field names
  const imageUrl = liveData.image?.url ?? liveData.media?.url;
  ```

### 4. Check lessons-learned.md (MANDATORY)

Read `documentation/lessons-learned.md` and scan the index table for patterns matching:

| Check For | If Block Has |
|-----------|--------------|
| LL-001 | Media/image fields |
| LL-002 | Any block (typename casing) |
| LL-003 | Nested collections (items, sections) |
| LL-005 | Rich Text fields |
| LL-006 | Any block (content type ID naming) |
| LL-007 | Array/reference fields |
| LL-008 | Media fields with live preview |

Document which lessons apply to the new block.

### 5. Check block-renderer registration

Read `src/block-renderer/configs/index.ts` to see:
- How other blocks are registered
- The typename pattern used
- Import patterns

**Expected pattern:**
```typescript
const [blockName]Config: BlockConfig<[BlockName]Fragment> = {
  typename: '[BlockName]',  // Must match __typename exactly
  layouts: {
    default: () => [BlockName],
  },
};
```

### 6. Check existing types

Read `src/block-renderer/types.ts` to see:
- Existing fragment type patterns
- How `BlockData` is extended
- How nested types are defined

---

## Discovery Report Template

After completing all checks, present this report:

```markdown
## Discovery Report

### Existing Components

**Static component found:** 
- Path: [path or "none found"]
- Suitable for porting: [yes/no/partial]
- Notes: [what to keep, what to change]

**Similar cms-components:**
- [Component 1]: [what's similar, what patterns to follow]
- [Component 2]: [what's similar]

### Patterns to Follow

From `hero.tsx`:
- Live preview: `useLiveUpdates(data)` + `useContentfulInspectorModeProps(data.sys.id)`
- Field access: `liveData.fieldName ?? 'fallback'`
- Media handling: Check both `image` and `media` (LL-008)

From `block-renderer/configs`:
- Registration pattern: `typename: '[BlockName]'` (exact match to Contentful __typename)
- Import pattern: `import { [BlockName] } from '@/cms-components/[block-name]';`

### Applicable Lessons

| Lesson | Applies Because |
|--------|-----------------|
| LL-XXX | [reason] |
| LL-XXX | [reason] |

### Pre-Q&A Recommendations

Based on discovery:
1. [Recommendation 1 - e.g., "Port existing metafi-faq.tsx styling"]
2. [Recommendation 2 - e.g., "Use simple field IDs per LL-007"]
3. [Recommendation 3 - e.g., "Include ntExperiencesCollection if personalization needed"]

---

Ready to proceed with Q&A?
```

---

## Completion Checklist

- [ ] Searched for existing static component in `src/components/sections/`
- [ ] Listed cms-components and identified similar patterns
- [ ] Read `hero.tsx` and documented patterns to follow
- [ ] Reviewed lessons-learned.md and noted applicable lessons
- [ ] Checked block-renderer registration pattern
- [ ] Prepared discovery report with recommendations
- [ ] Presented report to user and waiting for acknowledgment

**Do NOT proceed to Phase 1 (Q&A) until user acknowledges the discovery report.**

---

## Common Discoveries

### If static component exists

The user likely wants to port it. Recommend:
- Keep the styling and layout
- Replace hardcoded data with Contentful fields
- Add live preview hooks

### If no static component exists

Ask user:
- Is there a design/mockup to follow?
- Should I use shadcn/ui patterns?
- What existing block is most similar?

### If similar cms-component exists

Use it as the primary pattern. For example:
- If adding a new "accordion" block and `faq` exists, follow `faq` patterns for nested collections
- If adding "banner" block and `hero` exists, follow `hero` patterns for single-level content

---

## Integration with Agent Workflow

This skill is called at **Phase 0** of the add-contentful-block agent.

After this skill completes:
1. Agent presents STOP_0 with discovery report
2. User acknowledges
3. Agent proceeds to Phase 1 (Q&A)

The discoveries inform the Q&A questions:
- If static component found → Ask "Should I port this?"
- If personalization lesson applies → Ask about Ninetailed
- If nested collections needed → Ask about item structure
