import { notFound } from 'next/navigation';

import { BlockRenderer } from '@/block-renderer';
import { PageContentLive } from '@/app/page/[slug]/page-content-live';
import { getPageBySlug, getPageSlugs } from '@/services/contentful/page';
import { getPdpBySlug } from '@/services/contentful/pdp';
import { getNewsWrapperForPage } from '@/services/contentful/news-wrapper';

export const revalidate = 0;

export async function generateStaticParams() {
  const slugs = await getPageSlugs({ locale: 'en-US' });
  return slugs.map((slug) => ({ slug }));
}

export default async function ContentfulPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  // Use preview query param as override (for cross-site iframe context where cookies may not work)
  const previewEnabled = preview === 'true';
  const page = await getPageBySlug({
    slug,
    locale: 'en-US',
    preview: previewEnabled || undefined,
  });

  // Fall back to ProductDetailPage if no Page entry matches this slug
  if (!page) {
    const pdp = await getPdpBySlug({ slug, locale: 'en-US', preview: previewEnabled || undefined });
    if (!pdp) return notFound();
    return <BlockRenderer data={pdp} />;
  }

  // Enrich any NewsWrapper sections with merged articles server-side
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawSections = (page.sectionsCollection?.items ?? []) as any[];
  const enrichedSections = await Promise.all(
    rawSections.map(async (section) => {
      if (section?.__typename === 'NewsWrapper') {
        const enriched = await getNewsWrapperForPage({ entryId: section.sys.id });
        return enriched ?? section;
      }
      return section;
    }),
  );
  const enrichedPage = page.sectionsCollection
    ? { ...page, sectionsCollection: { ...page.sectionsCollection, items: enrichedSections } }
    : page;

  return <PageContentLive page={enrichedPage} />;
}
