# LL-046 — Inspector mode "edit" opens new tab instead of navigating sidebar — environment alias mismatch

## Symptom

In Contentful live preview, clicking a field's inspector mode edit button opens a **new browser tab** to the entry instead of navigating the sidebar to that field. The dotted-line highlighting appears correctly — only the click behavior is broken. The edit button is **grey** instead of blue.

## Root Cause

The `ContentfulLivePreviewProvider` must receive the **same environment identifier** the Contentful web app uses in its URL. The SDK sends this value in postMessage handshakes with the parent Contentful frame. If they don't match, the handshake fails → grey button → new tab fallback.

**The Contentful web app uses the alias name** (e.g. `master`), **not the resolved env ID** (e.g. `sandbox-master`).

- Contentful URL: `app.contentful.com/spaces/{id}/entries/...` (no env segment = `master` alias)
- SDK sends: `environment: "sandbox-master"` → **MISMATCH** → grey button, new tab

This means `resolveEnvironmentAlias()` must **NOT** be used for the SDK — that resolves `master` → `sandbox-master`, which breaks the handshake.

## Fix

Pass the raw `CONTENTFUL_ENVIRONMENT` env var to the LivePreviewProvider — always `master`:

```tsx
// src/app/layout.tsx
<LivePreviewProviderWrapper
  space={process.env.CONTENTFUL_SPACE_ID}
  environment={process.env.CONTENTFUL_ENVIRONMENT ?? 'master'}
>
```

**Never resolve the alias for the SDK.** The alias name is what the Contentful web app expects.

## Two different systems, two different needs

| System | Needs | Why |
|--------|-------|-----|
| **GraphQL API** (`fetchGraphQL`) | Alias name (`master`) | API resolves aliases server-side |
| **Live Preview SDK** (`ContentfulLivePreviewProvider`) | Alias name (`master`) | Must match Contentful web app's postMessage handshake |
| **`resolveEnvironmentAlias()`** | Returns actual env ID (`sandbox-master`) | Useful for CMA operations, NOT for SDK or GraphQL |

## Key rule

`.env.local` should always say `CONTENTFUL_ENVIRONMENT=master`. The alias is what both the GraphQL API and Live Preview SDK expect. The alias target controls which actual environment is hit.

## Related Files

- `src/app/layout.tsx` — passes env to LivePreviewProvider
- `src/lib/live-preview.tsx` — SDK wrapper
- `src/services/contentful/client.ts` — `resolveEnvironmentAlias()` (don't use for SDK)
