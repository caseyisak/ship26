import { notFound } from 'next/navigation';

import { getDashboardPageBySlug } from '@/services/contentful/dashboard-page';
import { GenericDashboard } from '../_layouts/generic-dashboard';

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 0;

export default async function DashboardSlugPage({ params }: Props) {
  const { slug } = await params;
  const page = await getDashboardPageBySlug({ slug });

  if (!page) notFound();

  return <GenericDashboard page={page} />;
}
