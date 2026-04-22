# LL: Contentful App — onConfigure Stale Closure / Re-registration

## Symptom
Config screen saves successfully but always uses the initial state — state changes (e.g. toggling content types) are not reflected. Or: `onConfigure` is called multiple times per save because the handler was re-registered on every state change.

## Root Cause
If `onConfigure` is registered inside a `useEffect([state])` dependency, every state change re-calls `sdk.app.onConfigure(newHandler)`. The SDK doesn't guarantee cleanup of previous handlers — this can cause stacking (multiple handlers firing) or the last registered handler racing with the previous one.

If `onConfigure` has no state in its dependencies, it captures a stale closure of initial state — toggles are ignored.

## Fix
Register `onConfigure` **once** (after `setReady`), and read latest state via a `useRef`:

```typescript
// Keep ref in sync with latest state
const activationsRef = useRef(activations);
useEffect(() => { activationsRef.current = activations; }, [activations]);

// Register once after ready — reads latest via ref, no re-registration
useEffect(() => {
  if (!ready) return;

  appSdk.app.onConfigure(() => {
    const current = activationsRef.current; // always fresh
    // ... build and return result
  });

  appSdk.app.onConfigurationCompleted((err) => {
    if (err) console.error('[App] onConfigurationCompleted error:', err);
  });
}, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
```

The `onConfigurationCompleted` logger is essential for debugging — it surfaces the exact error message Contentful's API returns when it rejects the config payload.

## Related Files
- `src/app/contentful-app/integration-simulator/config-screen.tsx`

## Lesson
Always register `onConfigure` once. Use `useRef` to avoid stale closures without re-registering. Add `onConfigurationCompleted` logger in every config screen to capture Contentful API rejection details.
