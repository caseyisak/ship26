# SSR / Preflight Guide

## When to Use SSR Personalization

By default, NT personalization is client-side: the baseline renders on the server, then NT swaps in the variant on the client after hydration. This causes a brief "flash" where baseline is visible before the variant appears.

For demos, client-side is usually acceptable (the flash is fast). For production:
- Use SSR preflight if you need the correct variant on first paint
- Especially important for above-the-fold hero sections

## Preflight Pattern (Next.js App Router)

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Forward NT profile cookie to pages
  // NT uses '__nt_id' cookie to track profile across requests
  const ntProfileId = request.cookies.get('__nt_id')?.value;

  if (ntProfileId) {
    // Can be passed to server components via headers
    response.headers.set('x-nt-profile-id', ntProfileId);
  }

  return response;
}

export const config = {
  // Match all pages that use personalization
  matcher: ['/page/:path*'],
};
```

```typescript
// In a Server Component page
import { getNinetailedProfile } from '@ninetailed/experience.js-next/server';
import { headers } from 'next/headers';

export default async function Page() {
  const profileId = headers().get('x-nt-profile-id') ?? undefined;

  const profile = await getNinetailedProfile({
    clientId: process.env.NEXT_PUBLIC_NINETAILED_API_KEY!,
    environment: process.env.NEXT_PUBLIC_NINETAILED_ENVIRONMENT as 'main' | 'development',
    profileId,
  });

  return (
    <NinetailedWrapper profile={profile}>
      <PageContent />
    </NinetailedWrapper>
  );
}
```

When `profile` is passed to `NinetailedProvider`, it hydrates immediately with the server-fetched profile — no flash.

## Hybrid Pattern

For ISR pages where you can't prefetch the profile server-side:
1. Render baseline statically
2. NT hydrates client-side after interaction
3. Use `suppressHydrationWarning` on elements that will swap

This is the current default in this project.

## Caveats

- Preflight adds ~50-100ms to TTFB (NT API call)
- Cookie-based profile IDs work for returning users; new users always get a fresh profile
- For CDN-cached pages, preflight must be done at the edge (middleware) not in `page.tsx`
