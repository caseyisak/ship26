import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDashboardPageBySlug } from '@/services/contentful/dashboard-page';
import { getDashboardSettings } from '@/services/contentful/dashboard-settings';
import { getSettings } from '@/services/contentful/settings';
import { PERSONA_COOKIE } from '@/lib/persona-session';
import { GenericDashboard } from './_layouts/generic-dashboard';

export const revalidate = 0;

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const personaCookie = cookieStore.get(PERSONA_COOKIE);
  if (!personaCookie?.value) {
    redirect('/login');
  }

  const [page, dashboardSettings, siteSettings] = await Promise.all([
    getDashboardPageBySlug({ slug: 'dashboard-home' }),
    getDashboardSettings(),
    getSettings(),
  ]);

  return (
    <GenericDashboard
      page={page}
      settings={dashboardSettings}
      loggedInMetadata={siteSettings?.loggedInMetadata ?? null}
    />
  );
}
