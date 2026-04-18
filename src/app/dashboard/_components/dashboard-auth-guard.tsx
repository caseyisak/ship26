'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * DashboardAuthGuard
 *
 * Client-side auth check for the dashboard. Reads the `metafi_session`
 * localStorage key set by the navbar LoginButton on successful login.
 * If missing, redirects to /login so unauthenticated visitors can't
 * land in the app shell.
 *
 * This is a demo-grade guard — it uses localStorage, not a real JWT/cookie
 * session. It prevents casual access and supports the demo story of
 * "log in → see the dashboard" without a real auth backend.
 */
export function DashboardAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    try {
      const session = localStorage.getItem('metafi_session');
      if (!session) {
        router.replace('/login');
      }
    } catch {
      // localStorage unavailable (SSR/iframe) — allow through
    }
  }, [router]);

  return <>{children}</>;
}
