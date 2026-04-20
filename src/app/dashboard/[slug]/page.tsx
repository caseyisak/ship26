import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { getDashboardPageBySlug } from '@/services/contentful/dashboard-page';
import { getDashboardSettings } from '@/services/contentful/dashboard-settings';
import { PERSONA_COOKIE } from '@/lib/persona-session';
import { GenericDashboard } from '../_layouts/generic-dashboard';

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 0;

export default async function DashboardSlugPage({ params }: Props) {
  const cookieStore = await cookies();
  const personaCookie = cookieStore.get(PERSONA_COOKIE);
  if (!personaCookie?.value) {
    redirect('/login');
  }

  const { slug } = await params;
  const [page, settings] = await Promise.all([
    getDashboardPageBySlug({ slug }),
    getDashboardSettings(),
  ]);

  if (!page) notFound();

  return <GenericDashboard page={page} settings={settings} />;
}
