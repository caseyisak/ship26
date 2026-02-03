import { notFound } from 'next/navigation';

import { BlockRenderer } from '@/block-renderer';
import { getHeroByEntryId } from '@/services/contentful/hero';

type Props = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ locale?: string }>;
};

/**
 * ID-based live preview for Hero entries (no page/slug).
 * Use in Contentful: set preview URL to your enable-draft URL with entryId and type=hero,
 * which redirects here with draft mode enabled so draft content and live updates work.
 */
export default async function PreviewHeroPage({ params, searchParams }: Props) {
  const { entryId } = await params;
  const { locale } = await searchParams;

  const hero = await getHeroByEntryId({
    entryId,
    locale: locale ?? 'en-US',
  });

  if (!hero) {
    notFound();
  }

  return <BlockRenderer data={hero} />;
}
