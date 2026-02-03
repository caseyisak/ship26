import { notFound } from 'next/navigation';

import { BlockRenderer } from '@/block-renderer';
import { getPageBySlug, getPageSlugs } from '@/services/contentful/page';

export const revalidate = 0;

export async function generateStaticParams() {
  const slugs = await getPageSlugs({ locale: 'en-US' });
  return slugs.map((slug) => ({ slug }));
}

export default async function ContentfulPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPageBySlug({ slug, locale: 'en-US' });

  if (!page) {
    return notFound();
  }

  const sections = page.sectionsCollection?.items?.filter(Boolean) ?? [];

  return (
    <div className="container">
      {sections.map((section) => (
        <BlockRenderer key={section!.sys.id} data={section!} />
      ))}
    </div>
  );
}
