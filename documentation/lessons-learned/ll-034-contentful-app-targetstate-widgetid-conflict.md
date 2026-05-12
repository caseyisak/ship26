# LL-034 — widgetNamespace/widgetId in targetState causes "Failed to update app configuration"

## Symptom

`onConfigure` returns a `targetState` with `widgetNamespace` and `widgetId` set, and the Save button in App Config throws:

```
Failed to update app configuration
```

No other error message. The config is not saved.

## Root Cause

When `widgetNamespace: 'app'` and `widgetId: '<app-definition-id>'` are included in `targetState.EditorInterface`, the Contentful App SDK validates them against the registered app definition. If the IDs don't match exactly (e.g. dev vs. prod app definition, or any typo), the SDK rejects the entire `onConfigure` payload silently with a generic error.

## Fix

Use bare `targetState` with only `fieldId` — no `widgetNamespace`, no `widgetId`. The SDK auto-binds the installed app to the field:

```ts
// ✅ correct
targetState: {
  EditorInterface: {
    [contentTypeId]: {
      controls: [{ fieldId: 'skus' }]
    }
  }
}

// ❌ causes save error
targetState: {
  EditorInterface: {
    [contentTypeId]: {
      controls: [{
        fieldId: 'skus',
        widgetNamespace: 'app',
        widgetId: 'abc123-...'
      }]
    }
  }
}
```

## Related Files

- `src/app/contentful-app/integration-simulator/config-screen.tsx`
