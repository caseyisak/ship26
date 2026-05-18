# NinetailedProvider Patterns

## Placement (App Router)

The provider must wrap the entire app. In Next.js App Router, this goes in `src/app/layout.tsx` (the root layout).

```typescript
// src/app/layout.tsx
import { NinetailedProvider } from '@ninetailed/experience.js-next';
import { NinetailedInsightsPlugin } from '@ninetailed/experience.js-insights';
import { NinetailedPreviewPlugin } from '@ninetailed/experience.js-preview';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <NinetailedProvider
          clientId={process.env.NEXT_PUBLIC_NINETAILED_API_KEY!}
          environment={process.env.NEXT_PUBLIC_NINETAILED_ENVIRONMENT as 'main' | 'development'}
          plugins={[
            new NinetailedInsightsPlugin(),
            ...(process.env.NODE_ENV === 'development'
              ? [new NinetailedPreviewPlugin()]
              : []),
          ]}
        >
          {children}
        </NinetailedProvider>
      </body>
    </html>
  );
}
```

## Props Reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `clientId` | `string` | ✅ | NT API key |
| `environment` | `'main' \| 'development'` | ✅ | Data bucket selector |
| `plugins` | `Plugin[]` | — | Analytics, preview bar |
| `profileId` | `string` | — | Override profile ID (SSR preflight) |
| `profile` | `Profile` | — | Hydrate with server-fetched profile |

## Hydration Safety (App Router)

The NinetailedProvider is a client component. Mark any file that imports it with `'use client'`. If you're putting it in a Server Component layout, extract it to a separate `<NinetailedWrapper>` client component:

```typescript
// src/components/ninetailed-wrapper.tsx
'use client';
import { NinetailedProvider } from '@ninetailed/experience.js-next';
// ... providers
export function NinetailedWrapper({ children }: { children: React.ReactNode }) {
  return <NinetailedProvider ...>{children}</NinetailedProvider>;
}
```

Then in the Server Component layout:
```typescript
// src/app/layout.tsx (Server Component — no 'use client')
import { NinetailedWrapper } from '@/components/ninetailed-wrapper';
export default function RootLayout({ children }) {
  return (
    <html><body>
      <NinetailedWrapper>{children}</NinetailedWrapper>
    </body></html>
  );
}
```

## Plugin Registration

```typescript
// Analytics — tracks page views, component views, clicks
new NinetailedInsightsPlugin()

// Preview bar — shows experience switcher UI (dev/demo only)
new NinetailedPreviewPlugin({
  clientId: process.env.NEXT_PUBLIC_NINETAILED_API_KEY!,
  environment: process.env.NEXT_PUBLIC_NINETAILED_ENVIRONMENT as 'main' | 'development',
})

// Custom analytics destination
new NinetailedInsightsPlugin({
  plugins: [
    // GTM, Segment, etc — see analytics-patterns.md
  ]
})
```
