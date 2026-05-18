# NT Component Patterns

## Basic Experience Pattern

The simplest way to render a personalized block — use the `Experience` component from the NT SDK:

```typescript
'use client';
import { Experience } from '@ninetailed/experience.js-next';
import type { HeroFields } from '@/block-renderer/types';

interface HeroWithNTProps {
  data: HeroFields & {
    ntExperiencesCollection?: {
      items: NtExperience[];
    };
  };
}

export function HeroWithNT({ data }: HeroWithNTProps) {
  const { data: liveData } = useLiveUpdates(data);

  const experiences = liveData.ntExperiencesCollection?.items ?? [];

  return (
    <Experience
      {...liveData}
      id={liveData.sys.id}
      experiences={experiences}
      component={Hero}  // The baseline component
      passthroughProps={{ /* any extra props */ }}
    />
  );
}
```

## Manual Variant Rendering Pattern

When you need full control over rendering (e.g., for complex blocks or server-side optimization):

```typescript
'use client';
import { useExperience } from '@ninetailed/experience.js-next';

export function ManualPersonalizedHero({ data, experiences }) {
  const { variant, isPersonalized } = useExperience({
    baseline: data,
    experiences,
  });

  return <Hero data={variant} />;
}
```

## Server-Side Preflight Pattern

For SSR-first personalization where you want the correct variant on first render (no flash):

```typescript
// In a Server Component (page.tsx)
import { getNinetailedProfile } from '@ninetailed/experience.js-next/server';

export default async function Page({ params }) {
  const profile = await getNinetailedProfile({
    clientId: process.env.NEXT_PUBLIC_NINETAILED_API_KEY!,
    environment: process.env.NEXT_PUBLIC_NINETAILED_ENVIRONMENT as 'main' | 'development',
    request: /* incoming request for cookie-based profile ID */,
  });

  // Pass profile to NinetailedProvider for hydration
  return (
    <NinetailedWrapper profile={profile}>
      <PageContent />
    </NinetailedWrapper>
  );
}
```

See `references/ssr-guide.md` for full preflight setup.

## NtExperiencesContext Pattern

When many blocks on a page share the same experience, you can read from context rather than per-block queries. This pattern reduces query size by fetching experiences once at the page level and distributing via context.

```typescript
// Not implemented in this project yet — add if per-block NT queries push over 8192 bytes
```

## Merge Tag Pattern

For NT merge tags in Rich Text fields:

```typescript
// In the rich text renderer
import { NtMergetagInline } from '@/components/nt-mergetag-inline';

// Register as inline embedded entry renderer
renderNode: {
  [INLINES.EMBEDDED_ENTRY]: (node, children) => {
    const entry = node.data.target;
    if (entry.__typename === 'NtMergetag') {
      return <NtMergetagInline mergetag={entry} />;
    }
    return null;
  }
}
```

The `NtMergetagInline` component reads the user's profile and substitutes the relevant trait value, falling back to the `fallback` field if no match.
