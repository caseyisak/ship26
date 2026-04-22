# LL: Contentful App — Empty EditorInterface Rejection

## Symptom
"Failed to update app configuration" popup immediately after clicking Save in a Contentful app config screen, even when `onConfigure` returns without throwing.

## Root Cause
Contentful rejects a `targetState` object that contains an empty `EditorInterface: {}`. If `onConfigure` always includes `targetState` (to wire up field appearances), saving with zero content types activated sends `{ EditorInterface: {} }` — Contentful's API treats this as invalid.

## Fix
Only include `targetState` in the `onConfigure` return value when there are mappings to apply:

```typescript
const result: Record<string, unknown> = { parameters: { mappings } };
if (mappings.length > 0) {
  const EditorInterface: Record<string, { controls: { fieldId: string }[] }> = {};
  for (const m of mappings) {
    EditorInterface[m.contentTypeId] = { controls: [{ fieldId: m.fieldId }] };
  }
  result.targetState = { EditorInterface };
}
return result;
```

## Related Files
- `src/app/contentful-app/integration-simulator/config-screen.tsx`

## Lesson
Never pass `targetState: { EditorInterface: {} }` — Contentful validates that EditorInterface is non-empty. Guard with `if (mappings.length > 0)` before constructing it.
