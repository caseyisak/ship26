# LL-037 — Array.isArray() returns false for JSON Object fields; shape detection required

## Symptom

A Contentful JSON field stores either a `string[]` (legacy) or a `{ categories: string[], items: ProductRecord[] }` object (new collection shape). Code uses `Array.isArray(data.skus)` to check the shape, which returns `false` for the object — but then falls through to a path that treats it as an empty array, silently ignoring the collection data. Products don't render.

## Root Cause

`Array.isArray()` correctly returns `false` for plain objects. Without explicit shape detection, an `if (!Array.isArray(x))` guard doesn't distinguish between "null/undefined" and "a valid object with a known shape."

GraphQL types also don't help here — Contentful JSON fields type as `Record<string, unknown>` or `unknown`, so TypeScript won't catch the mismatch at compile time.

## Fix

Use explicit shape detection with an `'items' in` (or equivalent key) check before casting:

```ts
// Detect shape before use
const isCollection =
  data.skus !== null &&
  data.skus !== undefined &&
  !Array.isArray(data.skus) &&
  'items' in (data.skus as object);

const collectionItems = isCollection
  ? ((data.skus as unknown) as { items: ProductRecord[] }).items
  : null;

const skuList: string[] = Array.isArray(data.skus) ? data.skus : [];
```

Double-cast (`as unknown as T`) is required when the intermediate type is `Record<string, unknown>` — TypeScript won't allow a direct cast to a more specific shape.

## Related Files

- `src/cms-components/dynamic-listing/dynamic-listing.tsx`
- `src/block-renderer/types.ts`
- `src/app/contentful-app/integration-simulator/field-editor.tsx`
