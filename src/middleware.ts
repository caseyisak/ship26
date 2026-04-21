import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Passthrough middleware — app router has no [locale] segment.
// Contentful locale is hardcoded to 'en-US' in all GraphQL queries.
// The i18n router was removed because it rewrites to /en-US/* paths that don't exist.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|static|contentful-app|.*\\..*|_next|favicon.ico).*)',
};

