import { i18nRouter } from 'next-i18n-router';
import { NextRequest } from 'next/server';

import { defaultLocale, locales } from '@/i18n/config';

export function middleware(request: NextRequest) {
  return i18nRouter(request, { locales: [...locales], defaultLocale });
}

export const config = {
  matcher: '/((?!api|static|contentful-app|.*\\..*|_next|favicon.ico).*)',
};
