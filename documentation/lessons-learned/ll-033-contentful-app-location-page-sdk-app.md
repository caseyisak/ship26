# LL-033 — sdk.app is undefined at LOCATION_PAGE

## Symptom

Contentful app crashes or throws when rendered in the Page Editor sidebar (`LOCATION_PAGE`). Calls to `sdk.app.onConfigure()`, `sdk.app.setReady()`, or `sdk.app.getParameters()` fail with `TypeError: Cannot read properties of undefined`.

## Root Cause

`sdk.app` is only defined at `LOCATION_APP_CONFIG`. At `LOCATION_PAGE`, `LOCATION_ENTRY_EDITOR`, and `LOCATION_FIELD`, `sdk.app` is `undefined`. The App SDK does not expose the configuration surface in non-config locations.

## Fix

Gate all `sdk.app.*` calls behind a location check:

```ts
import { locations } from '@contentful/app-sdk';

const isConfig = sdk.location.is(locations.LOCATION_APP_CONFIG);

if (isConfig) {
  sdk.app.onConfigure(() => { ... });
  sdk.app.setReady();
}
```

At `LOCATION_PAGE`, render a read-only info screen instead (e.g. "To configure, go to Apps → Manage apps → Configure").

## Related Files

- `src/app/contentful-app/integration-simulator/page.tsx`
- `src/app/contentful-app/integration-simulator/config-screen.tsx`
