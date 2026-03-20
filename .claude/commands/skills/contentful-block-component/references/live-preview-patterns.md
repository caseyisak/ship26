# Live Preview & Component Patterns

## Key Patterns

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
// For image fields that have a media→image mapping:
const rawImageUrl = (liveData as [BlockName]Fragment).image?.url ?? data.image?.url;

// If live preview still shows stale images, also check raw field name:
type RawLiveData = [BlockName]Fragment & { media?: { url?: string } | null };
const imageUrl =
  (liveData as [BlockName]Fragment).image?.url ??
  ((liveData as RawLiveData).media?.url ?? undefined);
```

See **LL-008** in lessons-learned.md for full explanation.

**Media Field Naming Convention:**
| Contentful Field | TypeScript Type | Live Preview Check |
|-----------------|-----------------|-------------------|
| `media` | `image` | Check both `image` and `media` |
| `backgroundMedia` | `backgroundImage` | Check both `backgroundImage` and `backgroundMedia` |

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
// If using Rich Text, add dependency: bun add @contentful/rich-text-react-renderer
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

{liveData.richTextField?.json && documentToReactComponents(liveData.richTextField.json)}
```

## Porting from Existing Component

If porting from a metafi static component (e.g. `src/components/sections/metafi-faq.tsx`):

1. Copy the JSX structure and styling
2. Replace hardcoded data with `liveData.fieldName`
3. Replace hardcoded arrays with `liveData.itemsCollection?.items ?? []`
4. Add `{...getProps({ fieldId: 'fieldName' })}` to editable elements
5. Keep all styling classes (they use the project's design tokens)

## Common Issues

**`Cannot find module '@/cms-components/[name]'`**
- Check the directory name matches the import
- Check index.ts exports the component

**`typename 'X' not found in blockConfigs`**
- The `typename` in config must match `__typename` exactly (case-sensitive)
- Example: `typename: 'Faq'` not `typename: 'FAQ'` or `typename: 'faq'`

**`Component is not a function`**
- Check export is named export: `export { [BlockName] }` not `export default`
- Check import matches: `import { [BlockName] }` not `import [BlockName]`

**Test fails with undefined**
- Mock data missing required fields
- Add `sys: { id: 'test-1', spaceId: 'test' }`
- Add `__typename: '[BlockName]' as const`
