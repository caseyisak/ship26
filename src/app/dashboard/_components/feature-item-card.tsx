'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import type { Block, Inline } from '@contentful/rich-text-types';
import { MergeTag } from '@ninetailed/experience.js-react';
import React from 'react';

import type { FeatureItemFragment } from '@/block-renderer/types';
import { useContentfulInspectorModeProps, useLiveUpdates } from '@/lib/live-preview';

type Props = { data: FeatureItemFragment };

/**
 * Converts NT merge tag ID from Contentful template syntax to the selector format
 * expected by the NT MergeTag component's selectValueFromProfile:
 *   "{{ profile.traits.market }}" → "traits_market"
 */
function toNtSelectId(raw: string): string {
  return raw
    .replace(/^\{\{\s*/, '')   // strip leading {{
    .replace(/\s*\}\}$/, '')   // strip trailing }}
    .replace(/^profile\./, '') // drop "profile." prefix (profile is the root)
    .replace(/\./g, '_');      // dots → underscores for generateSelectors
}

function buildLinksMap(titleRt: FeatureItemFragment['titleRt']) {
  const map = new Map<string, { ntMergetagId: string; ntFallback: string }>();
  for (const entry of titleRt?.links?.entries?.inline ?? []) {
    if (entry?.ntMergetagId) {
      map.set(entry.sys.id, {
        ntMergetagId: toNtSelectId(entry.ntMergetagId),
        ntFallback: entry.ntFallback ?? '',
      });
    }
  }
  return map;
}

const makeRenderOptions = (linksMap: ReturnType<typeof buildLinksMap>) => ({
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node: Block | Inline, children: React.ReactNode) => (
      <p className="text-sm font-semibold text-foreground leading-snug">{children}</p>
    ),
    [BLOCKS.HEADING_1]: (_node: Block | Inline, children: React.ReactNode) => (
      <h1 className="text-2xl font-bold text-foreground">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (_node: Block | Inline, children: React.ReactNode) => (
      <h2 className="text-xl font-bold text-foreground">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (_node: Block | Inline, children: React.ReactNode) => (
      <h3 className="text-lg font-semibold text-foreground">{children}</h3>
    ),
    [INLINES.EMBEDDED_ENTRY]: (node: Block | Inline) => {
      const id = (node as Inline).data?.target?.sys?.id as string | undefined;
      if (!id) return null;
      const mt = linksMap.get(id);
      if (!mt) return null;
      return <MergeTag id={mt.ntMergetagId} fallback={mt.ntFallback} />;
    },
    [INLINES.HYPERLINK]: (node: Block | Inline, children: React.ReactNode) => (
      <a
        href={(node as Inline).data?.uri as string}
        className="text-secondary underline underline-offset-2 hover:text-secondary/80"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  },
  renderMark: {
    [MARKS.BOLD]: (text: React.ReactNode) => <strong className="font-bold">{text}</strong>,
    [MARKS.ITALIC]: (text: React.ReactNode) => <em className="italic">{text}</em>,
    [MARKS.UNDERLINE]: (text: React.ReactNode) => <span className="underline">{text}</span>,
  },
});

/** Dashboard promo card: renders FeatureItem with styled rich-text title, NT merge tags, and live preview support. */
export function FeatureItemCard({ data }: Props) {
  const liveData = useLiveUpdates(data);
  const getProps = useContentfulInspectorModeProps(liveData.sys.id);

  const { titleRt, descriptionRt, media, mediaPlacement } = liveData;
  const linksMap = buildLinksMap(titleRt);

  const descriptionNode = descriptionRt?.json
    ? documentToReactComponents(
        descriptionRt.json as unknown as Parameters<typeof documentToReactComponents>[0],
        {
          renderNode: {
            [BLOCKS.PARAGRAPH]: (_node: unknown, children: React.ReactNode) => <>{children}</>,
          },
        },
      )
    : null;

  const isHorizontal = mediaPlacement === 'left' || mediaPlacement === 'right';
  const mediaFirst = !mediaPlacement || mediaPlacement === 'top' || mediaPlacement === 'left';

  const mediaEl = media?.url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={media.url}
      alt=""
      className={isHorizontal ? 'w-1/3 shrink-0 rounded-md object-cover' : 'w-full rounded-md object-cover max-h-40'}
      {...getProps({ fieldId: 'media' })}
    />
  ) : null;

  const textEl = (
    <div className="flex flex-col gap-2 flex-1">
      {titleRt?.json && (
        <div {...getProps({ fieldId: 'titleRt' })}>
          {documentToReactComponents(
            titleRt.json as unknown as Parameters<typeof documentToReactComponents>[0],
            makeRenderOptions(linksMap),
          )}
        </div>
      )}
      {descriptionNode && (
        <p
          className="text-xs text-muted-foreground leading-relaxed"
          {...getProps({ fieldId: 'descriptionRt' })}
        >
          {descriptionNode}
        </p>
      )}
    </div>
  );

  return (
    <div className={`bg-card rounded-lg p-6 flex gap-4 ${isHorizontal ? 'flex-row items-start' : 'flex-col'}`}>
      {mediaFirst ? <>{mediaEl}{textEl}</> : <>{textEl}{mediaEl}</>}
    </div>
  );
}
