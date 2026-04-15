import { getDashboardPageByType } from '@/services/contentful/dashboard-page';
import { HomeLayout } from './_layouts/home-layout';

export const revalidate = 0;

export default async function DashboardPage() {
  const page = await getDashboardPageByType({ pageType: 'dashboard-home' });
  return <HomeLayout page={page} />;
}
