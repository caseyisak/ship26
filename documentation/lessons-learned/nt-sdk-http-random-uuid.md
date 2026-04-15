# LL-022 — Ninetailed SDK crashes on HTTP dev: `crypto.randomUUID` requires secure context

## Symptom

Running `bun run dev` (HTTP) with Ninetailed configured results in no audiences being evaluated, no variant swaps, no personalization — and no visible console error surfaced to the developer. The NT SDK silently dies.

## Root Cause

The NT SDK internally calls `crypto.randomUUID()`, which is only available in **HTTPS (secure) contexts**. On plain HTTP (the default for `bun run dev`), `crypto.randomUUID` is `undefined`, causing the SDK to throw internally and fail to initialize. Because the error is swallowed, there is no obvious indication that NT is not running.

## Fix

**Option A (preferred for any NT session):** Run the dev server over HTTPS:

```bash
bun run dev:https
```

**Option B (polyfill):** Add a `crypto.randomUUID` polyfill before the SDK loads — e.g. in `src/app/layout.tsx` or a client init file:

```ts
if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
  crypto.randomUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    }) as `${string}-${string}-${string}-${string}-${string}`
  }
}
```

## Diagnostic Check

If audiences never swap and you suspect this issue:
1. Open DevTools → Console
2. Run: `crypto.randomUUID()`
3. If it throws `TypeError: crypto.randomUUID is not a function`, you're on HTTP — switch to HTTPS.

## Seen In

- `demo/punchbowl-2026-04`
- `demo/wow-personalization-2026-04`
