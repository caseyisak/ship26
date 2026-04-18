import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDashboardPageBySlug } from '@/services/contentful/dashboard-page';
import { getDashboardSettings } from '@/services/contentful/dashboard-settings';
import { PERSONA_COOKIE } from '@/lib/persona-session';
import { GenericDashboard } from './_layouts/generic-dashboard';

export const revalidate = 0;

export default async function DashboardPage() {
  // Server-side auth guard: read cookie set by setPersona() on login
  const cookieStore = await cookies();
  const personaCookie = cookieStore.get(PERSONA_COOKIE);
  if (!personaCookie?.value) {
    redirect('/login');
  }

  const [page, settings] = await Promise.all([
    getDashboardPageBySlug({ slug: 'dashboard-home' }),
    getDashboardSettings(),
  ]);
  return <GenericDashboard page={page} settings={settings} />;
}
