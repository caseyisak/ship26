import { notFound } from 'next/navigation';

import { NewsletterPage } from '@/cms-components/newsletter/newsletter-page';
import { getNewsletterById } from '@/services/contentful/newsletter';

export const dynamic = 'force-dynamic';

export default async function NewsletterIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const newsletter = await getNewsletterById(id, false);

  if (!newsletter) {
    notFound();
  }

  return (
    <NewsletterPage
      data={newsletter}
      space={process.env.CONTENTFUL_SPACE_ID}
      environment={process.env.CONTENTFUL_LIVE_PREVIEW_ENVIRONMENT ?? process.env.CONTENTFUL_ENVIRONMENT ?? 'master'}
    />
  );
}
