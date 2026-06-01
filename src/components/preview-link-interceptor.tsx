'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

/**
 * When the page is loaded with ?preview=true, intercepts clicks on internal
 * links and appends ?preview=true so draft mode persists across navigation.
 * Uses capture phase to fire before Next.js <Link> handlers.
 * Uses router.push for client-side nav to preserve NT profile state.
 */
function PreviewLinkInterceptorInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';

  useEffect(() => {
    if (!isPreview) return;

    const handler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;
      // Only internal links
      if (!href.startsWith('/')) return;
      // Skip if already has preview, or is an API/asset route
      if (href.includes('preview=true')) return;
      if (href.startsWith('/api/') || href.startsWith('/_next/')) return;

      e.preventDefault();
      e.stopPropagation();
      const separator = href.includes('?') ? '&' : '?';
      router.push(`${href}${separator}preview=true`);
    };

    // Capture phase — fires before Next.js Link's own click handler
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [isPreview, router]);

  return null;
}

export function PreviewLinkInterceptor() {
  return (
    <Suspense>
      <PreviewLinkInterceptorInner />
    </Suspense>
  );
}
