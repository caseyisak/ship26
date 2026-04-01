import { notFound } from 'next/navigation';

import { BlockRenderer } from '@/block-renderer';
import { getBannerByEntryId } from '@/services/contentful/banner';

import { DeviceFrame } from './device-frame';

type Props = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ locale?: string }>;
};

/**
 * ID-based live preview for Banner entries.
 * Left: web surface via BlockRenderer. Right: mock mobile app phone frame with device selector.
 *
 * Contentful preview URL: /api/enable-draft?secret=kaz&entryId={{entry.sys.id}}&type=banner
 */
export default async function PreviewBannerPage({ params, searchParams }: Props) {
  const { entryId } = await params;
  const { locale } = await searchParams;

  const banner = await getBannerByEntryId({ entryId, locale: locale ?? 'en-US' });

  if (!banner) notFound();

  return (
    <div className="min-h-screen bg-gray-100 p-6" data-theme={process.env.NEXT_PUBLIC_BRAND}>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded bg-gray-800 px-3 py-1 text-xs font-bold tracking-widest text-white uppercase">
            Live Preview
          </span>
          <h1 className="text-sm font-semibold text-gray-600">
            Banner · {banner.internalName}
          </h1>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Web surface */}
          <div>
            <p className="mb-3 text-xs font-bold tracking-widest text-gray-500 uppercase">
              🌐 Web
            </p>
            <div className="overflow-hidden rounded-xl shadow-lg">
              <BlockRenderer data={banner} />
            </div>
          </div>

          {/* Mobile app surface */}
          <div>
            <p className="mb-3 text-xs font-bold tracking-widest text-gray-500 uppercase">
              📱 Mobile App
            </p>
            <DeviceFrame banner={banner} />
          </div>
        </div>
      </div>
    </div>
  );
}
