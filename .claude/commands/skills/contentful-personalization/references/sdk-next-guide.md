# NT Next.js SDK Guide

## App Router Setup

### 1. Install

```bash
bun add @ninetailed/experience.js-next @ninetailed/experience.js-insights @ninetailed/experience.js-preview
```

### 2. Root Layout Provider

```typescript
// src/app/layout.tsx
import { NinetailedWrapper } from '@/components/ninetailed-wrapper';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NinetailedWrapper>{children}</NinetailedWrapper>
      </body>
    </html>
  );
}
```

```typescript
// src/components/ninetailed-wrapper.tsx
'use client';
import { NinetailedProvider } from '@ninetailed/experience.js-next';
import { NinetailedInsightsPlugin } from '@ninetailed/experience.js-insights';
import { NinetailedPreviewPlugin } from '@ninetailed/experience.js-preview';

export function NinetailedWrapper({ children }: { children: React.ReactNode }) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <NinetailedProvider
      clientId={process.env.NEXT_PUBLIC_NINETAILED_API_KEY!}
      environment={process.env.NEXT_PUBLIC_NINETAILED_ENVIRONMENT as 'main' | 'development'}
      plugins={[
        new NinetailedInsightsPlugin(),
        ...(isDev ? [new NinetailedPreviewPlugin()] : []),
      ]}
    >
      {children}
    </NinetailedProvider>
  );
}
```

### 3. Identify Users

```typescript
'use client';
import { useNinetailed } from '@ninetailed/experience.js-next';

export function UserIdentifier() {
  const { identify } = useNinetailed();

  useEffect(() => {
    // MUST defer — React useEffect fires bottom-up
    setTimeout(() => {
      identify({
        // Traits that audiences evaluate
        plan: 'enterprise',
        industry: 'media',
        company: 'Acme Corp',
      });
    }, 0);
  }, []);

  return null;
}
```

### 4. Experience Component

```typescript
'use client';
import { Experience } from '@ninetailed/experience.js-next';

// The block component (baseline)
function HeroBlock({ data }: { data: HeroFields }) {
  // standard component code
}

// The personalized wrapper
export function PersonalizedHero({ data }: HeroWithNTProps) {
  const { data: liveData } = useLiveUpdates(data);
  const experiences = liveData.ntExperiencesCollection?.items ?? [];

  return (
    <Experience
      {...liveData}
      id={liveData.sys.id}
      experiences={experiences}
      component={HeroBlock}
    />
  );
}
```

## Key Next.js-Specific Features

### Automatic `page()` tracking

`@ninetailed/experience.js-next` uses Next.js `usePathname` internally to fire `page()` events on every navigation automatically. This does NOT happen with `-react`.

### Server Component compatibility

Use the `NinetailedWrapper` pattern (client component wrapping server layout) to avoid forcing the root layout to be a client component.

### ISR / Static rendering

For statically generated pages, personalization is client-side only (after hydration). For fully SSR personalization, see `references/ssr-guide.md` for the preflight cookie pattern.

## Migration from `-react` to `-next`

1. `bun remove @ninetailed/experience.js-react`
2. `bun add @ninetailed/experience.js-next`
3. Find all imports: `grep -r "experience.js-react" src/`
4. Replace: `@ninetailed/experience.js-react` → `@ninetailed/experience.js-next`
5. The API is identical — no component changes needed
6. Verify: automatic `page()` events now appear in NT analytics
