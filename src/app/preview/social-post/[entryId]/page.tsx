import { notFound } from 'next/navigation';

import { SocialCardPreview } from '@/cms-components/social-card-preview';
import { getSocialPostByEntryId } from '@/services/contentful/social-post';

type Props = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ locale?: string }>;
};

/**
 * ID-based live preview for SocialPost entries.
 * Renders a channel-specific social card (X, Instagram, or Facebook).
 * Editors see live updates to copy and image as they type.
 *
 * Contentful preview URL: /api/enable-draft?secret=kaz&entryId={{entry.sys.id}}&type=socialPost
 */
export default async function PreviewSocialPostPage({
  params,
  searchParams,
}: Props) {
  const { entryId } = await params;
  const { locale } = await searchParams;

  const post = await getSocialPostByEntryId({
    entryId,
    locale: locale ?? 'en-US',
  });

  if (!post) notFound();

  return <SocialCardPreview data={post} />;
}
