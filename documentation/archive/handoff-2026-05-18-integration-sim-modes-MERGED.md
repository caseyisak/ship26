# Handoff — feat/integration-sim-modes

**Branch:** `feat/integration-sim-modes`
**Worktree:** `/Users/casey.lisak/Dev/metafi-worktrees/feat-integration-sim-modes`
**Off:** `main` at `3f461ad`
**Created:** 2026-05-18
**Status:** IN PROGRESS

---

## Why this branch exists

Three related asks in one ticket:

1. **Save bug regression** — "Failed to update app configuration" when adding `productListing.productCollection` mapping to the 3P App Integration config. This is the 4th recurrence of the LL-032/LL-034/LL-035 EditorInterface conflict pattern. PR #102 (multi-select) merged cleanly, but the save bug surfaced again specifically when mapping the `productListing` CT (recently added as part of PLP work).

2. **Mode refactor** — rename `multi` → `Category`; add `Filtered Category` as a 3rd mode. The `Category` mode hard-filters products (same behavior as old `multi`). The `Filtered Category` mode only pre-selects the PLP sidebar filter — all products remain visible.

3. **Front-end wiring** — `Filtered Category` mode initializes the PLP sidebar category filter from the `productCollection` field value. `Category` mode on DynamicListing is already handled (ProductCollection shape already works).

---

## Files to read first (in order)

1. `src/app/contentful-app/integration-simulator/connector-types.ts` — `MappingRow.mode` type (`'single' | 'multi'`), `ProductCollection`, `AssetCollection`
2. `src/app/contentful-app/integration-simulator/config-screen.tsx` — `migrateMappings()`, `onConfigure` handler with targetState logic (lines 181–199)
3. `src/app/contentful-app/integration-simulator/mappings-tab.tsx` — `Activation` interface, Mode dropdown (lines 267–277)
4. `src/app/contentful-app/integration-simulator/field-editor.tsx` — `pickerMode` usage, `isMulti` check (lines 119–175), filled state detection (lines 166–174)
5. `src/app/contentful-app/integration-simulator/ecom-picker-modal.tsx` — current multi mode picker (for reference)
6. `src/app/contentful-app/integration-simulator/dialog.tsx` — `pickerMode` forwarding
7. `src/cms-components/product-listing/product-listing.tsx` — `productCollection` prop (currently unused), `selectedCategory` state
8. `src/cms-components/dynamic-listing/dynamic-listing.tsx` — ProductCollection detection (`'items' in data.skus`)
9. `documentation/lessons-learned/index.md` — find current LL max number before adding new entry

---

## Implementation steps (ordered)

### Step 1 — Diagnose + fix the save bug

**Hypothesis**: The `productCollection` field may have been deleted from the `productListing` CT in Contentful, but the `onConfigure` handler still tries to include it in `targetState.EditorInterface`, causing Contentful's API to reject the save.

**Diagnostic**: In `config-screen.tsx`, `contentTypes` state is loaded from `getContentTypes()`. Check if `contentTypes.find(ct => ct.sys.id === 'productListing')?.fields.find(f => f.id === 'productCollection')` returns a field or undefined.

**Primary fix** — add a field-existence guard in the `onConfigure` handler (config-screen.tsx lines 181–199):

```typescript
// Build a fast lookup: ctId → Set<fieldId> from already-loaded contentTypes state
// No extra API call needed — contentTypes is already in component state
const ctFieldIndex = new Map(
  contentTypes.map((ct) => [ct.sys.id, new Set(ct.fields.map((f) => f.id))])
);

for (const m of mappings) {
  // Skip if the CT or field no longer exists in Contentful — prevents
  // "Failed to update app configuration" when a field is deleted after mapping
  if (!ctFieldIndex.get(m.contentTypeId)?.has(m.fieldId)) continue;
  if (!EditorInterface[m.contentTypeId]) {
    EditorInterface[m.contentTypeId] = { controls: [] };
  }
  EditorInterface[m.contentTypeId].controls.push({ fieldId: m.fieldId });
}
```

**Note**: `contentTypes` is already in the component's props/state scope in the `onConfigure` effect. You may need to add it to the `useEffect` dependency array and reference it via closure.

**Secondary fix** — warn in UI when a saved mapping references a deleted field:

In `config-screen.tsx`, compute a `staleCtIds: Set<string>` after loading:
```typescript
// After loading contentTypes and activations, compute stale mappings
const staleCtIds = useMemo(() => {
  const stale = new Set<string>();
  for (const [ctId, activation] of Object.entries(activations)) {
    if (!activation) continue;
    const ct = contentTypes.find(c => c.sys.id === ctId);
    if (!ct || !ct.fields.find(f => f.id === activation.fieldId)) {
      stale.add(ctId);
    }
  }
  return stale;
}, [contentTypes, activations]);
```

Pass `staleCtIds` to `MappingsTab` and show a warning badge on any stale row.

**LL entry**: Add a new LL doc (next number after current max in `documentation/lessons-learned/index.md`) — "EditorInterface targetState fails when mapped field deleted from CT: guard field existence in onConfigure."

### Step 2 — Mode type refactor

**`connector-types.ts`** — change `MappingRow.mode`:
```typescript
// line 107:
mode?: 'single' | 'category' | 'filtered-category';
```

**`mappings-tab.tsx`** — change `Activation.mode` (line 28):
```typescript
mode?: 'single' | 'category' | 'filtered-category';
```

**`config-screen.tsx`** — update `migrateMappings()` to handle legacy `'multi'`:
```typescript
// In the return of the .map() inside migrateMappings():
mode: (m as Partial<MappingRow>).mode === 'multi' 
  ? 'category' 
  : (m as Partial<MappingRow>).mode,
```

Also update the inline type annotation on `migrateMappings`'s return type.

### Step 3 — Mode dropdown UI

**`mappings-tab.tsx`** — update the Mode `<Select>` (lines 267–277):
```tsx
<Select.Option value="single">Single</Select.Option>
<Select.Option value="category">Category</Select.Option>
<Select.Option value="filtered-category">Filtered Category</Select.Option>
```

Update the `onChange` cast: `e.target.value as 'single' | 'category' | 'filtered-category'`.

### Step 4 — field-editor.tsx picker changes

**Line 123**: `const pickerMode = mapping?.mode ?? 'single';`  
No change needed here — pickerMode still comes from the mapping.

**Line 142**: `const isMulti = pickerMode === 'multi';`  
Change to:
```typescript
const isCategory = pickerMode === 'category';
const isFilteredCategory = pickerMode === 'filtered-category';
```

**Lines 141–160 — `openPicker`**:
- For `isFilteredCategory`: open a compact dialog with `width: 'medium'`, `minHeight: 350`; pass `{ mode: simulatorType, pickerMode }` as before
- For `isCategory`: same as old `isMulti` — full width gallery picker
- Update dialog titles: `category` → "Select Category Collection"; `filtered-category` → "Set Category Pre-filter"; `single` → unchanged

**Lines 166–174 — value detection**: Add:
```typescript
const isFilteredCategoryValue = fieldValue && typeof fieldValue === 'object' && !Array.isArray(fieldValue) && 'type' in (fieldValue as object) && (fieldValue as Record<string, unknown>).type === 'filtered-category';
```

**Render for `filtered-category` filled state** (add after the existing render blocks):
Show a simple chip/badge: "Pre-filtering to: [category]" or "No pre-filter (All)" with a clear button. Keep it minimal — just a `Box` with `Text` and the clear button.

### Step 5 — ecom-picker-modal.tsx for filtered-category

For `pickerMode === 'filtered-category'`, render a lightweight view instead of the full gallery:
- A `<Select>` showing all unique categories from the product catalog (derive via `Array.from(new Set(products.map(p => p.category)))`)
- An "All" option at the top (value: null/empty)
- A Confirm button that calls `sdk.close({ type: 'filtered-category', category: selectedCategory })` where `selectedCategory` is `null` for "All" or the string category name

No product grid needed. Height is minimal.

For `pickerMode === 'category'`: identical to old `pickerMode === 'multi'` — no change needed.

### Step 6 — dialog.tsx pickerMode forwarding

Check that `pickerMode` is forwarded correctly. The dialog reads `pickerMode` from `dialogSdk.parameters?.invocation?.pickerMode`. Update any `=== 'multi'` checks to `=== 'category'`.

### Step 7 — ProductListing front-end wiring

**`src/cms-components/product-listing/product-listing.tsx`**:

The `productCollection` prop is already passed in (typed as `Record<string, unknown> | null`) but currently unused. Add initialization logic:

```typescript
// Derive initial category filter from productCollection field value
// Only applies when the 3P app configured this field with mode='filtered-category'
const initialCategory = useMemo(() => {
  if (
    productCollection &&
    typeof productCollection === 'object' &&
    'type' in productCollection &&
    (productCollection as Record<string, unknown>).type === 'filtered-category'
  ) {
    const cat = (productCollection as Record<string, unknown>).category;
    if (typeof cat === 'string') return cat;
  }
  return 'all';
}, [productCollection]);
```

Use `initialCategory` as the initial value for `selectedCategory` state:
```typescript
const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
```

This is the ONLY change — the sidebar UI and filtering logic are unchanged. The user can still change the filter interactively.

### Step 8 — DynamicListing verify

`src/cms-components/dynamic-listing/dynamic-listing.tsx` — `category` mode stores `ProductCollection` (`{ categories: string[], items: ProductRecord[] }`), same shape as old `multi`. The existing detection `'items' in data.skus` handles this already. **Verify by checking the detection logic** — if it works, no code change needed. If something is broken, note it.

### Step 9 — Types + build

```bash
bunx tsc --noEmit
bun run build
```

Fix any TypeScript errors from the mode type change.

---

## Stored value shapes (reference)

| Mode | Stored in field | Front-end behavior |
|------|----------------|-------------------|
| `single` | `ProductRecord \| AssetRecord` | Single item display (unchanged) |
| `category` | `{ categories: string[], items: ProductRecord[] }` | DynamicListing: show only those items |
| `filtered-category` | `{ type: 'filtered-category', category: string \| null }` | ProductListing: init sidebar filter to this category |

---

## Commit format

```
<type>(integration-sim): <what> — <why>
```

Examples:
```
fix(integration-sim): guard EditorInterface against deleted fields — prevents "Failed to update app configuration" when productListing.productCollection or any other mapped field is removed from CT
feat(integration-sim): rename multi→category, add filtered-category mode — category = hard filter collection; filtered-category = PLP pre-filter hint
feat(product-listing): init category filter from productCollection field — filtered-category mode pre-selects sidebar without limiting visible products
```

---

## Dev server

This branch needs port 3000 for the Contentful app (app definition points to localhost:3000).
Check if another worktree's dev server is already on 3000 before starting:
```bash
lsof -ti:3000
```
If blocked: `kill $(lsof -ti:3000)` then `bun run dev`.

---

## What NOT to change

- Don't rename or restructure the connector system (Shopify/BigCommerce/etc.) — out of scope
- Don't change the `single` mode behavior — it's correct as-is
- Don't modify the DAM picker for `filtered-category` — ecomm only for now
- Don't change the existing ProductCollection/AssetCollection detection in field-editor.tsx for the `category` mode render path — that render path already works for the renamed mode
