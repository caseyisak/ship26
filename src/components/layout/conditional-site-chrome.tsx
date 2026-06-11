'use client';

import { usePathname } from 'next/navigation';

import { Footer } from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import { useSettings } from '@/personalization/settings-context';

/**
 * Renders site chrome (Banner, Navbar, main, Footer) only when not on the Contentful app route.
 * The Section Style Editor at /contentful-app is shown without header/footer so it fits in the iframe.
 */
export function ConditionalSiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const settings = useSettings();
  const isContentfulApp = pathname?.startsWith('/contentful-app') ?? false;
  const isPreview = pathname?.startsWith('/preview') ?? false;
  const isDashboard = pathname?.startsWith('/dashboard') ?? false;
  const isDemo = pathname?.startsWith('/demo') ?? false;

  if (isContentfulApp || isPreview || isDashboard || isDemo) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer
        footerForm={settings?.footerForm}
        colorVariant={settings?.footer?.colorVariant}
        logo={settings?.footer?.logo}
        col1={settings?.footer?.col1}
        col2={settings?.footer?.col2}
        col3={settings?.footer?.col3}
      />
    </>
  );
}
