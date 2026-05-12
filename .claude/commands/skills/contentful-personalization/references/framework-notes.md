# Framework Notes — Next.js App Router

## This Project: Next.js 15 App Router

All personalization is implemented for the App Router pattern. Key differences from Pages Router:

| Concern | App Router (this project) | Pages Router (avoid) |
|---------|--------------------------|---------------------|
| Provider placement | Root `layout.tsx` via client wrapper | `_app.tsx` directly |
| Server components | `NinetailedWrapper` pattern (client child) | N/A |
| `useNinetailed()` hook | Only in client components | Only in client components |
| `page()` auto-tracking | ✅ via `-next` package | ✅ via `-next` package |
| ISR compatibility | ✅ with client-side hydration | ✅ |
| SSR preflight | Via middleware + `getNinetailedProfile()` | Via `getServerSideProps` |

## App Router Gotchas

### Server Component boundary
Never import NT hooks in a Server Component — they use `useContext` which requires a client boundary. Always add `'use client'` to any component that uses NT.

### Hydration mismatches
If the server renders a different variant than the client expects, React will warn about hydration mismatch. Use `suppressHydrationWarning` on experience containers, or use SSR preflight to ensure server/client match.

### Streaming (Suspense)
NT works with Suspense boundaries. If a block with experiences is inside a Suspense boundary, NT will evaluate after the boundary resolves.

### `usePathname` for page tracking
The `-next` package uses `usePathname` from `next/navigation` to detect navigation events. This hook must be used in a client component within an App Router context — it won't work in Pages Router or plain React.

## Common Mistakes with App Router

1. **Putting NinetailedProvider directly in layout.tsx** — layout is a Server Component; must extract to client wrapper
2. **Using `-react` package** — no automatic page tracking in App Router
3. **Calling `identify()` without defer** — fires before parent subscription is ready
4. **ntExperiencesCollection in page-level fragments** — inflates query over 8192 bytes
