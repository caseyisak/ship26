'use client';

import { useEffect } from 'react';

/**
 * When the app is loaded in an iframe (e.g. Contentful) at the root path,
 * redirect to /contentful-app so the Section Style Editor loads instead of the homepage.
 * Contentful may load "localhost:3000" without the path; this fixes that.
 */
export function ContentfulAppRedirect() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const inIframe = window.self !== window.top;
      const atRoot =
        window.location.pathname === '/' || window.location.pathname === '';
      if (inIframe && atRoot) {
        window.location.replace('/contentful-app');
      }
    } catch {
      // Cross-origin access can throw; ignore
    }
  }, []);

  return null;
}
