# GraphQL Field Type Reference

## Field Type Mapping

**Field type mapping:**
- Symbol/Text → `string | null`
- Integer/Number → `number | null`
- Boolean → `boolean | null`
- Media/Asset → `{ url?: string; width?: number; height?: number } | null`
- Rich Text → `{ json: unknown } | null`
- Reference (single) → `LinkedFragmentType | null`
- Reference (many) → `{ items: LinkedFragmentType[] } | null`
- JSON → `unknown` (parse at runtime)

## Collection Field Naming (LL-007)

**Collection Field Naming (LL-007):**
- Contentful adds "Collection" suffix to all array/reference fields
- Field ID `items` → Query as `itemsCollection`
- Field ID `itemsCollection` → Query as `itemsCollectionCollection` (avoid this!)

## Media Field Naming Convention

**Media Field Naming Convention:**
- Use `media { url }` in GraphQL (matches Contentful field ID)
- Use `backgroundMedia { url }` for background images
- The mapper will rename these to `image` and `backgroundImage`

## For Nested Types

If the block has linked entries (like FAQ → FaqItem):

1. Add `[LinkedType]Fragment` in types.ts
2. Add `[LINKEDTYPE]_FIELDS` as a separate constant in queries.ts, include inside parent's `itemsCollection`
3. Add `Raw[LinkedType]` type in page.ts
4. Add `map[LinkedType]` function that returns `[LinkedType]Fragment | null`
5. In parent mapper: `itemsCollection: item.itemsCollection ? { items: item.itemsCollection.items.map(map[LinkedType]).filter(Boolean) as [LinkedType]Fragment[] } : null`
