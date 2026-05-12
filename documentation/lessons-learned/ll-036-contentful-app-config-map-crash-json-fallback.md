# LL-036 — Config map lookup crash causes silent JSON editor fallback

## Symptom

The custom field app disappears and the field renders the raw JSON Object editor instead. No error is visible in the UI. The field value is still correct in Contentful, but the custom widget is gone.

## Root Cause

If any synchronous code in the field app component throws an unhandled error, the Contentful Field SDK silently falls back to the default JSON editor. There is no error boundary shown to the user — the field just appears to revert to "Object (default)".

A common trigger: a lookup into a config map with an unknown key:

```ts
const brand = BRAND_CONFIG[simulatorType]; // undefined if simulatorType not in map
const color = brand.color; // TypeError: Cannot read properties of undefined
```

This throws synchronously during render, causing the silent fallback.

## Fix

Always use a `?? fallback` for any config map lookup in field app code. Never let an unknown key propagate:

```ts
const brand = BRAND_CONFIG[simulatorType] ?? {
  label: simulatorType ?? 'Unknown',
  color: '#8091A5',
  textColor: '#fff',
};
```

General rule: field apps must never throw unhandled errors. Crash = silent JSON fallback with no diagnostic information visible to the user.

## Related Files

- `src/app/contentful-app/integration-simulator/field-editor.tsx`
