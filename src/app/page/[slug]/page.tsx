import { notFound } from 'next/navigation';

import { PageContentLive } from '@/app/page/[slug]/page-content-live';
import { getPageBySlug, getPageSlugs } from '@/services/contentful/page';

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

  if (!page) {
    return notFound();
  }

  return <PageContentLive page={page} />;
}
