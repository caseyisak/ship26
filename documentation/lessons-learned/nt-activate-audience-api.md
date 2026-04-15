# LL-024 — Correct NT API for client-side audience activation is `window.ninetailed.plugins.preview.activateAudience()`

## Symptom

Attempts to manually activate an NT audience from client-side code (e.g. a persona switcher) either do nothing, update profile traits without triggering variant evaluation, or throw errors about undefined properties.

## Root Cause

The NT SDK exposes several surfaces that look like they should work but don't:

| Approach tried | Result |
|----------------|--------|
| Patching `window.ninetailed` directly | No effect — SDK internal state not updated |
| `onProfileChange` subscription | Read-only listener — cannot trigger activation |
| `ninetailed.identify({ audience: id })` | Updates traits but does not force audience evaluation |

The correct API lives on the **Preview plugin**:

```ts
window.ninetailed.plugins.preview.activateAudience(audienceId)
```

## Fix

Use `window.ninetailed.plugins.preview.activateAudience(audienceId)` for any client-side audience forcing — persona switchers, demo controls, QA tooling:

```ts
function activatePersona(audienceId: string) {
  window.ninetailed?.plugins?.preview?.activateAudience(audienceId)
}
```

## Important Constraint

This API requires the **NT Preview plugin** to be loaded. The plugin is available in:
- Development (`bun run dev` / `bun run dev:https`)
- Preview / staging environments configured with the plugin

It is **not available in production builds** unless the Preview plugin is explicitly included (not recommended for prod). Gate any calls behind an environment check if needed.

## Seen In

- `demo/wow-personalization-2026-04` — LocalAudienceEvaluator persona switcher (4 sequential fix commits before landing on this API)
