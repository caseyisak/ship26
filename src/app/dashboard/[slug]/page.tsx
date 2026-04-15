import { notFound } from 'next/navigation';

import { getDashboardPageBySlug } from '@/services/contentful/dashboard-page';
import { CheckoutLayout } from '../_layouts/checkout-layout';
import { HomeLayout } from '../_layouts/home-layout';
import { UpgradeLayout } from '../_layouts/upgrade-layout';

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 0;

export default async function DashboardSlugPage({ params }: Props) {
  const { slug } = await params;
  const page = await getDashboardPageBySlug({ slug });

  if (!page) notFound();

  if (page.pageType === 'upgrades') return <UpgradeLayout page={page} />;
  if (page.pageType === 'checkout') return <CheckoutLayout page={page} />;
  return <HomeLayout page={page} />;
}
