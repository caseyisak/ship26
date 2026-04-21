import { notFound } from 'next/navigation';

import { BlockRenderer } from '@/block-renderer';
import { getFormByEntryId } from '@/services/contentful/form';

type Props = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ locale?: string }>;
};

/**
 * ID-based live preview for Form entries.
 * Contentful: set preview URL to enable-draft with entryId and type=form.
 */
export default async function PreviewFormPage({ params, searchParams }: Props) {
  const { entryId } = await params;
  const { locale } = await searchParams;

  const form = await getFormByEntryId({
    entryId,
    locale: locale ?? 'en-US',
  });

  if (!form) {
    notFound();
  }

  return <BlockRenderer data={form} />;
}
