'use client';

import { usePathname } from 'next/navigation';

import Banner from '@/components/layout/banner';
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

  if (isContentfulApp || isPreview || isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Banner url="https://www.shadcnblocks.com/template/metafi" />
      <Navbar />
      <main>{children}</main>
      <Footer footerForm={settings?.footerForm} />
    </>
  );
}
