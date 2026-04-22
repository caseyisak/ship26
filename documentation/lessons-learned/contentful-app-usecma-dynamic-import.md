# LL: Contentful App — useCMA() Unreliable Inside dynamic() Components

## Symptom
`useCMA()` from `@contentful/react-apps-toolkit` throws or returns an unusable client when called inside a component loaded via Next.js `dynamic(() => import(...), { ssr: false })`.

## Root Cause
`useCMA()` reads from the SDKProvider React context. Next.js `dynamic()` creates an async boundary — the context may not propagate reliably to the dynamically imported module, especially during hydration or initial render. The hook silently fails or throws, crashing the component.

## Fix
Use the deprecated-but-reliable `sdk.space.getContentTypes()` instead:

```typescript
// ✅ Works reliably even inside dynamic() imports
const ctsResult = await appSdk.space.getContentTypes();

// ❌ Unreliable inside dynamic() — context propagation issue
const cma = useCMA();
const ctsResult = await cma.contentType.getMany({ spaceId, environmentId });
```

The `sdk.space.*` methods are deprecated in App SDK v4 but remain functional. Prefer them over `useCMA()` when the component is dynamically imported.

## Related Files
- `src/app/contentful-app/integration-simulator/config-screen.tsx`

## Lesson
`useCMA()` requires SDKProvider context which doesn't propagate reliably through Next.js `dynamic()` boundaries. Fall back to `sdk.space.*` deprecated methods until Contentful fixes context propagation in dynamic imports.
