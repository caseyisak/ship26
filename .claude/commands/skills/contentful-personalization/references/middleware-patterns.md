# Middleware Patterns

## NT Middleware for Profile Continuity

Next.js middleware can forward the NT profile cookie to Server Components, enabling SSR personalization.

```typescript
// middleware.ts (project root)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // NT stores profile ID in this cookie
  const ntProfileId = request.cookies.get('__nt_id')?.value;

  if (ntProfileId) {
    response.headers.set('x-nt-profile-id', ntProfileId);
  }

  // Forward geo data if needed for geo-based audiences
  const country = request.geo?.country;
  if (country) {
    response.headers.set('x-nt-geo-country', country);
  }

  return response;
}

// Only run on routes that use personalization
export const config = {
  matcher: [
    '/page/:path*',
    // Add other personalized routes
  ],
};
```

## Matcher Configuration

Be surgical with the matcher — middleware runs on every matched request, adding latency.

```typescript
// Match all except static files and API routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
```

For this project, only page routes use NT, so restrict to `/page/:path*` and the home route.

## Geo-Based Audiences

NT can evaluate audiences based on user geography. To use geo:

1. Vercel automatically populates `request.geo` in edge middleware
2. Forward the country code via header (as above)
3. In your Server Component, pass geo data to NT profile initialization
4. Create NT audience rules that reference the `country` trait

```typescript
// In page.tsx (Server Component)
const profile = await getNinetailedProfile({
  clientId: ...,
  environment: ...,
  profileId: headers().get('x-nt-profile-id') ?? undefined,
  traits: {
    country: headers().get('x-nt-geo-country') ?? undefined,
  },
});
```

## Cookie Details

| Cookie | Set by | Purpose |
|--------|--------|---------|
| `__nt_id` | NT SDK | Persistent anonymous profile ID |
| `__nt_session` | NT SDK | Session-level tracking |

These cookies are set on first page load and persist across sessions (unless cleared). They're what enable NT to recognize returning users and evaluate audiences consistently.
