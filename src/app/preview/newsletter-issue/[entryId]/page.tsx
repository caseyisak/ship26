import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import type { Document } from '@contentful/rich-text-types';
import { notFound } from 'next/navigation';

import { fetchGraphQL } from '@/services/contentful/client';

type Props = { params: Promise<{ entryId: string }> };

const QUERY = `
  query NewsletterIssuePreview($id: String!, $preview: Boolean) {
    newsletterIssueCollection(where: { sys: { id: $id } }, limit: 1, preview: $preview) {
      items {
        sys { id }
        internalName
        edition
        subjectLine
        publishDate
        slug
        leadStory {
          ... on Entry { sys { id } __typename }
          ... on BlogPost {
            title
            excerpt
            publishDate
            heroImage { url }
            body { json }
            author { name }
          }
        }
      }
    }
  }
`;

export default async function PreviewNewsletterIssuePage({ params }: Props) {
  const { entryId } = await params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any;
  try {
    data = await fetchGraphQL({
      query: QUERY,
      variables: { id: entryId, preview: true },
      preview: true,
    });
  } catch {
    notFound();
  }

  const issue = data?.newsletterIssueCollection?.items?.[0];
  if (!issue) notFound();

  const article = issue.leadStory;
  const imgUrl = article?.heroImage?.url?.startsWith('//')
    ? `https:${article.heroImage.url}`
    : article?.heroImage?.url;

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      {/* Comparison banner */}
      <div className="border-b border-amber-300 bg-amber-100 px-6 py-3 text-sm text-amber-900">
        <strong>Static preview — old newsletterIssue CT</strong> · This is the
        previous model: no inline body, just a lead story reference. Compare
        with the{' '}
        <a
          href={`/preview/newsletter/37WN7tUtlOtfWsYRx1RrFo`}
          className="font-semibold underline"
        >
          new Newsletter entry
        </a>
        .
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          {/* Issue header */}
          <div className="border-b border-gray-200 px-8 py-6">
            <div className="mb-1 flex items-center gap-3">
              <span className="text-[10px] font-bold tracking-widest text-[#CB4697] uppercase">
                Punchbowl {issue.edition}
              </span>
              {issue.publishDate && (
                <span className="text-xs text-gray-400">
                  {new Date(issue.publishDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
            <h1 className="text-2xl leading-tight font-bold text-[#282C71]">
              {issue.subjectLine}
            </h1>
          </div>

          {/* Lead story */}
          {article ? (
            <div className="px-8 py-6">
              <div className="mb-4 text-[10px] font-bold tracking-widest text-[#282C71] uppercase">
                Lead Story
              </div>
              {imgUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imgUrl}
                  alt={article.title ?? ''}
                  className="mb-4 h-56 w-full rounded object-cover"
                />
              )}
              <h2 className="mb-2 text-xl font-bold text-[#282C71]">
                {article.title}
              </h2>
              {article.excerpt && (
                <p className="mb-4 text-sm leading-relaxed text-gray-600">
                  {article.excerpt}
                </p>
              )}
              {article.body?.json && (
                <div className="prose prose-sm max-w-none text-gray-700">
                  {documentToReactComponents(article.body.json as Document)}
                </div>
              )}
            </div>
          ) : (
            <div className="px-8 py-6 text-sm text-gray-400 italic">
              No lead story linked.
            </div>
          )}

          {/* Diff callout */}
          <div className="mx-8 mb-8 rounded border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
            <strong>Why the new model is better:</strong> This entry has no
            inline content — everything depends on the linked article. The new{' '}
            <code>newsletter</code> CT has a RichText body you write directly,
            plus optional leadStory + promoSlot reference slots. Editors control
            the full newsletter in one entry.
          </div>
        </div>
      </div>
    </div>
  );
}
