import { notFound } from 'next/navigation';

import { BlockRenderer } from '@/block-renderer';
import { getBannerByEntryId } from '@/services/contentful/banner';

type Props = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ locale?: string }>;
};

/**
 * ID-based live preview for Banner entries.
 * Shows the banner in a web view alongside a mocked mobile app phone frame —
 * so editors can see how the same content renders on both surfaces.
 *
 * Contentful preview URL: /api/enable-draft?secret=kaz&entryId={{entry.sys.id}}&type=banner
 */
export default async function PreviewBannerPage({
  params,
  searchParams,
}: Props) {
  const { entryId } = await params;
  const { locale } = await searchParams;

  const banner = await getBannerByEntryId({
    entryId,
    locale: locale ?? 'en-US',
  });

  if (!banner) notFound();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded bg-[#0B1F41] px-3 py-1 text-xs font-bold tracking-widest text-white uppercase">
            Live Preview
          </span>
          <h1 className="text-sm font-semibold text-gray-600">
            Banner · {banner.internalName}
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Web surface */}
          <div>
            <p className="mb-3 text-xs font-bold tracking-widest text-gray-500 uppercase">
              🌐 Website
            </p>
            <div className="overflow-hidden rounded-xl shadow-lg">
              <BlockRenderer data={banner} />
            </div>
          </div>

          {/* Mock mobile app surface */}
          <div>
            <p className="mb-3 text-xs font-bold tracking-widest text-gray-500 uppercase">
              📱 Mobile App
            </p>
            <div className="flex justify-center">
              <div
                className="relative overflow-hidden rounded-[2.5rem] shadow-2xl"
                style={{
                  width: 320,
                  height: 640,
                  border: '10px solid #1a1a1a',
                  backgroundColor: '#f5f5f5',
                }}
              >
                {/* Phone notch */}
                <div className="absolute top-0 left-1/2 z-20 h-6 w-24 -translate-x-1/2 rounded-b-xl bg-[#1a1a1a]" />

                {/* Bears App chrome */}
                <div
                  className="flex items-center justify-between px-4 pt-8 pb-3"
                  style={{ backgroundColor: '#0B1F41' }}
                >
                  <div className="flex items-center gap-2">
                    {/* Logo placeholder */}
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white"
                      style={{ backgroundColor: '#C83803' }}
                    >
                      C
                    </div>
                    <span className="text-sm font-bold text-white">
                      Chicago Bears
                    </span>
                  </div>
                  <div className="h-5 w-5 text-white/60">≡</div>
                </div>

                {/* App content */}
                <div
                  className="overflow-y-auto"
                  style={{ height: 'calc(100% - 90px)' }}
                >
                  {/* Banner in app */}
                  <div className="-mb-12 origin-top scale-[0.85]">
                    <BlockRenderer data={banner} />
                  </div>

                  {/* Mock app feed items */}
                  <div className="space-y-3 px-3 pt-2 pb-4">
                    {['Latest News', 'Game Highlights', 'Depth Chart'].map(
                      (item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm"
                        >
                          <div
                            className="h-10 w-10 flex-shrink-0 rounded"
                            style={{
                              backgroundColor: '#0B1F41',
                              opacity: 0.15,
                            }}
                          />
                          <div>
                            <div className="h-2.5 w-24 rounded bg-gray-200" />
                            <div className="mt-1.5 h-2 w-16 rounded bg-gray-100" />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Bottom nav */}
                <div
                  className="absolute right-0 bottom-0 left-0 flex justify-around border-t border-gray-200 bg-white py-2"
                  style={{ borderTop: '1px solid #e5e7eb' }}
                >
                  {['🏠', '📅', '📰', '🛒'].map((icon, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="text-lg">{icon}</span>
                      <span className="text-[8px] text-gray-400">
                        {['Home', 'Schedule', 'News', 'Shop'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
