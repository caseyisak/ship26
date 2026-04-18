import { NextResponse } from 'next/server';
import { getDashboardSettings } from '@/services/contentful/dashboard-settings';

/**
 * GET /api/dashboard-settings
 *
 * Returns the first dashboardSettings entry — used by client components
 * (e.g. site nav persona dropdown) that need persona data without a full
 * server component fetch.
 */
export async function GET() {
  const settings = await getDashboardSettings();
  if (!settings) {
    return NextResponse.json(null, { status: 404 });
  }
  return NextResponse.json(settings);
}
