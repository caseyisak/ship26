# LL-044: `useSearchParams()` needs Suspense boundary in Next.js 15

## Symptom

Build error or runtime crash: "useSearchParams() should be wrapped in a suspense boundary" when using `useSearchParams()` in a client component rendered during SSR.

## Root cause

Next.js 15 (App Router) requires `useSearchParams()` to be inside a `<Suspense>` boundary because search params aren't available during server-side rendering. Without the boundary, Next.js can't gracefully handle the missing data.

## Fix

Split the component into an inner component (uses the hook) and a wrapper that provides the Suspense boundary:

```tsx
function Inner() {
  const searchParams = useSearchParams();
  // ... use searchParams
  return null;
}

export function MyComponent() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
```

## Related files

- `src/components/preview-link-interceptor.tsx` — `PreviewLinkInterceptorInner` + `PreviewLinkInterceptor` wrapper
