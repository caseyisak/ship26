import { getDashboardPageBySlug } from '@/services/contentful/dashboard-page';
import { GenericDashboard } from './_layouts/generic-dashboard';

export const revalidate = 0;

export default async function DashboardPage() {
  const page = await getDashboardPageBySlug({ slug: 'dashboard-home' });
  return <GenericDashboard page={page} />;
}
