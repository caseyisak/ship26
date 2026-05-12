# LL-035 — Omitting targetState entirely resets field appearance on every config save

## Symptom

After saving the app configuration, the field in the Entry Editor reverts to the default JSON widget instead of the custom app widget. The field "Appearance" tab in the Content Type editor shows "Object (default)" selected instead of the custom app.

This resets on every save, even though the mapping is correct and the app was previously bound to the field.

## Root Cause

When `onConfigure` returns a payload without `targetState`, Contentful interprets this as "no field bindings requested" and resets the EditorInterface to defaults for any CT touched by the configuration. The previous binding is lost.

## Fix

Always return `targetState` from `onConfigure`. Use bare `{ fieldId }` controls — see LL-034 for why `widgetNamespace`/`widgetId` must be omitted:

```ts
sdk.app.onConfigure(() => {
  const EditorInterface: Record<string, { controls: { fieldId: string }[] }> = {};

  for (const mapping of mappings) {
    if (!EditorInterface[mapping.contentTypeId]) {
      EditorInterface[mapping.contentTypeId] = { controls: [] };
    }
    EditorInterface[mapping.contentTypeId].controls.push({
      fieldId: mapping.fieldId,
    });
  }

  return {
    parameters: { mappings, connectors },
    ...(Object.keys(EditorInterface).length > 0 ? { targetState: { EditorInterface } } : {}),
  };
});
```

Guard with `Object.keys(EditorInterface).length > 0` — returning `targetState: { EditorInterface: {} }` also causes a save error (see LL-032).

## Related Files

- `src/app/contentful-app/integration-simulator/config-screen.tsx`
