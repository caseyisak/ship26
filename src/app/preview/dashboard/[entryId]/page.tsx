import { notFound } from 'next/navigation';

import { getDashboardPageRawByEntryId } from '@/services/contentful/dashboard-page';
import { DashboardPreviewClient } from './preview-client';

type Props = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ locale?: string }>;
};

/**
 * ID-based live preview for DashboardPage entries.
 * Server fetches RAW (untransformed) data; DashboardPreviewClient applies useLiveUpdates
 * then transforms slots — this allows the SDK to update reference fields when new
 * entries are linked in the editor.
 *
 * Contentful preview URL:
 *   http://localhost:3000/preview/dashboard/{{entry.sys.id}}?locale={{locale}}
 */
export default async function PreviewDashboardPage({ params, searchParams }: Props) {
  const { entryId } = await params;
  const { locale } = await searchParams;

  const page = await getDashboardPageRawByEntryId({
    entryId,
    locale: locale ?? 'en-US',
  });

  if (!page) notFound();

  return <DashboardPreviewClient page={page} />;
}
