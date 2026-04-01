import { notFound } from 'next/navigation';

import { getBannerByEntryId } from '@/services/contentful/banner';

import { DeviceFrame } from './device-frame';

type Props = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ locale?: string }>;
};

/**
 * ID-based live preview for Banner entries — mobile device frame only.
 * Device selector lets editors preview across 5 screen sizes.
 *
 * Contentful preview URL: /api/enable-draft?secret=kaz&entryId={{entry.sys.id}}&type=banner
 */
export default async function PreviewBannerPage({ params, searchParams }: Props) {
  const { entryId } = await params;
  const { locale } = await searchParams;

  const banner = await getBannerByEntryId({ entryId, locale: locale ?? 'en-US' });

  if (!banner) notFound();

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-200 p-6"
      data-theme={process.env.NEXT_PUBLIC_BRAND}
    >
      <DeviceFrame banner={banner} />
    </div>
  );
}
