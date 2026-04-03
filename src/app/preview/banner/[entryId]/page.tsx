import { notFound } from 'next/navigation';

import { BlockRenderer } from '@/block-renderer';
import { getBannerByEntryId } from '@/services/contentful/banner';

import { DeviceFrame } from './device-frame';

type Props = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ locale?: string; view?: string }>;
};

/**
 * ID-based live preview for Banner entries.
 *
 * ?view=mobile  → mock mobile app phone frame (device selector)
 * default       → web: bare banner component, no chrome
 *
 * Contentful preview URLs:
 *   Web:    http://localhost:3000/preview/banner/{{entry.sys.id}}?locale={{locale}}
 *   Mobile: http://localhost:3000/preview/banner/{{entry.sys.id}}?view=mobile&locale={{locale}}
 */
export default async function PreviewBannerPage({
  params,
  searchParams,
}: Props) {
  const { entryId } = await params;
  const { locale, view } = await searchParams;

  const banner = await getBannerByEntryId({
    entryId,
    locale: locale ?? 'en-US',
  });

  if (!banner) notFound();

  if (view === 'mobile') {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center bg-gray-200 p-6"
        data-theme={process.env.NEXT_PUBLIC_BRAND}
      >
        <DeviceFrame banner={banner} />
      </div>
    );
  }

  // Web: just the banner, no wrapper chrome — preview layout already strips nav/footer
  return (
    <div data-theme={process.env.NEXT_PUBLIC_BRAND}>
      <BlockRenderer data={banner} />
    </div>
  );
}
