import { notFound } from 'next/navigation';

import { NewsletterPage } from '@/cms-components/newsletter/newsletter-page';
import { getNewsletterBySlug } from '@/services/contentful/newsletter';

export const dynamic = 'force-dynamic';

export default async function NewsletterSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const newsletter = await getNewsletterBySlug(slug);

  if (!newsletter) {
    notFound();
  }

  return (
    <NewsletterPage
      data={newsletter}
      space={process.env.CONTENTFUL_SPACE_ID}
      environment={process.env.CONTENTFUL_ENVIRONMENT ?? 'master'}
    />
  );
}
