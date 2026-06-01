# LL-043: NT `identify()` is additive — persona switch must clear behavioral traits

## Symptom

After switching personas, the previous persona's behavioral traits (e.g. `interested_in: 'burritos'`) leak into the new persona's profile. Audience rules that depend on `interested_in` fire for the wrong persona.

## Root cause

NT SDK's `identify()` **merges** new traits on top of existing ones. It never removes keys that aren't in the new payload. So if Persona A browsed `/page/burritos` (setting `interested_in: 'burritos'`), switching to Persona B without explicitly clearing `interested_in` leaves the old value in the profile.

## Fix

Every `identify()` call that switches personas must explicitly include `interested_in: persona.interested_in ?? ''` to clear the stale behavioral trait:

```ts
ninetailed.identify('', {
  ...persona,
  is_logged_in: true,
  interested_in: persona.interested_in ?? '',
});
```

Apply this in all identify call sites: navbar persona switch, dashboard top bar, `setPersona()`, and login success handler.

## Related files

- `src/lib/persona-session.ts` — `setPersona()` includes `interested_in` clearing
- `src/components/layout/navbar.tsx` — `handleSwitch`, login `onSuccess`
- `src/app/dashboard/_components/dashboard-top-bar.tsx` — `handleSwitch`, mount identify
