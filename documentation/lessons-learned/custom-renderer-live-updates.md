## LL-012 — Custom preview renderers don't update without `useLiveUpdates`

- **Exact error / symptom:** Editing a field in Contentful doesn't update the preview page even though the SDK is connected and `BlockRenderer`-based blocks work fine.
- **Root cause:** Only components that explicitly call `useLiveUpdates(data)` subscribe to SDK push updates. Custom renderers (mobile frame, social card, etc.) that read props directly get a stale server snapshot and never re-render.
- **Solution:** In any client component rendering Contentful data outside `BlockRenderer`, call `useLiveUpdates` at the top:
  ```tsx
  const data = useLiveUpdates(props.banner);
  // then read from `data`, not `props.banner`
  ```
- **Prevention:** Any time you write a custom preview renderer that bypasses `BlockRenderer`, add `useLiveUpdates` as the first line.
- **Related files:** `src/lib/live-preview.tsx` — `useLiveUpdates` wrapper; any `src/app/preview/*/` custom renderer
