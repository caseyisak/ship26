# LL-042: NT SDK `reset()` doesn't clear traits

## Symptom

Profile Previewer or audience evaluation shows stale persona traits (e.g. `first_name`, `loyalty_tier`) even after calling `ninetailed.reset()` and switching to anonymous/logged-out state.

## Root cause

NT SDK's `reset()` only regenerates the anonymous ID in `__nt_profile__` localStorage. It does **not** wipe accumulated traits from the internal profile object. Any traits set via prior `identify()` calls persist across resets.

## Fix

For anonymous visitors, explicitly overwrite every persona trait key with an empty/default value before setting new behavioral traits. Use a constant `ANONYMOUS_OVERWRITE` map:

```ts
const ANONYMOUS_OVERWRITE: Record<string, string | number | boolean> = {
  customer_type: 'anonymous',
  is_logged_in: false,
  first_name: '',
  last_name: '',
  display_name: '',
  // ... all persona trait keys
};

ninetailed.identify('', { ...ANONYMOUS_OVERWRITE, ...newTraits });
```

## Related files

- `src/components/personalization/page-tracker.tsx` — ANONYMOUS_OVERWRITE pattern
- `src/components/layout/navbar.tsx` — logout calls `reset()` + `clearPersona()`
