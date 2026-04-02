import { notFound } from 'next/navigation';

import { NewsletterPage } from '@/cms-components/newsletter/newsletter-page';
import { getNewsletterById } from '@/services/contentful/newsletter';

type Props = {
  params: Promise<{ entryId: string }>;
};

/**
 * ID-based live preview for Newsletter entries.
 * Renders the full newsletter page with Gmail-style header + rich text body.
 *
 * Set preview URL in Contentful to:
 *   /api/enable-draft?secret=<PREVIEW_SECRET>&entryId={{entry.sys.id}}&type=newsletterIssue
 */
export default async function PreviewNewsletterPage({ params }: Props) {
  const { entryId } = await params;

  const newsletter = await getNewsletterById(entryId, true);

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
