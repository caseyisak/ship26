import { notFound } from 'next/navigation';

import { BlockRenderer } from '@/block-renderer';
import { getCtaSectionByEntryId } from '@/services/contentful/cta-section';

type Props = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ locale?: string }>;
};

/**
 * ID-based live preview for CtaSection entries (no page/slug).
 * Use in Contentful: set preview URL to your enable-draft URL with entryId and type=ctaSection,
 * which redirects here with draft mode enabled so draft content and live updates work.
 *
 * Example Contentful preview URL:
 *   http://localhost:3000/api/enable-draft?secret=<secret>&type=ctaSection&entryId={{entry.sys.id}}
 */
export default async function PreviewCtaSectionPage({
  params,
  searchParams,
}: Props) {
  const { entryId } = await params;
  const { locale } = await searchParams;

  const ctaSection = await getCtaSectionByEntryId({
    entryId,
    locale: locale ?? 'en-US',
  });

  if (!ctaSection) {
    notFound();
  }

  return (
    <div data-theme={process.env.NEXT_PUBLIC_BRAND}>
      <BlockRenderer data={ctaSection} />
    </div>
  );
}
