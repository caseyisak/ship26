# LL-038 — EditorInterface targetState fails when mapped field deleted from CT

## Symptom

"Failed to update app configuration" toast when saving the 3P App Integration config. No other error visible. Specific to content types where the mapped field was deleted after the mapping was created.

## Root cause

The `onConfigure` handler iterates saved mappings and builds `targetState.EditorInterface` controls for each `{ contentTypeId, fieldId }` pair. If the field was deleted from the content type in Contentful (e.g. `productListing.productCollection` removed), the API rejects the `targetState` because it references a non-existent field.

This is the 5th recurrence of the EditorInterface conflict pattern (see LL-032, LL-034, LL-035).

## Fix

Guard field existence before including in `targetState.EditorInterface`:

```typescript
const ctFieldIndex = new Map(
  contentTypes.map((ct) => [ct.sys.id, new Set(ct.fields.map((f) => f.id))])
);

for (const m of mappings) {
  if (!ctFieldIndex.get(m.contentTypeId)?.has(m.fieldId)) continue;
  // ... push to EditorInterface
}
```

`contentTypes` is already loaded in component state — no extra API call needed.

Additionally, show a "Mapped field missing" warning badge on stale rows in the Mappings tab so the user can see and fix the mapping.

## Related files

- `src/app/contentful-app/integration-simulator/config-screen.tsx` — `onConfigure` handler
- `src/app/contentful-app/integration-simulator/mappings-tab.tsx` — stale warning badge
- `documentation/lessons-learned/ll-032-squash-merge-removes-conditional-guard.md`
- `documentation/lessons-learned/ll-034-contentful-app-targetstate-widgetid-conflict.md`
- `documentation/lessons-learned/ll-035-contentful-app-appearance-resets-on-save.md`
