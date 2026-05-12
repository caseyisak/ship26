---
name: Next.js dev server stale production build cache
type: project
description: Dev server returns HTML with unhashed chunk URLs that 404 when .next contains a prior production build
---

## Symptom
Next.js dev server returns HTML with unhashed chunk URLs (`webpack.js?v=...`) that 404, causing a blank page or ChunkLoadError in the browser. Chunks exist on disk with content hashes (`webpack-5057d0149661b15b.js`).

## Root Cause
`.next` directory contained a prior production build (`bun run build`). Dev server (`next dev`) found the existing `.next` and entered an inconsistent state — generating HTML with dev-mode unhashed URLs while only production-hashed files existed on disk.

## Fix
```bash
rm -rf .next && bun run dev
```
Must fully clear production artifacts before starting dev server.

## Related Files
- `.next/static/chunks/`
- `.next/BUILD_ID`
