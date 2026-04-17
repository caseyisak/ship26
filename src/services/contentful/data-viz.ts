import type { DataVizFragment } from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import { DATA_VIZ_BY_ID } from './queries';

type RawDataViz = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  titleRt?: { json: Record<string, unknown> } | null;
  descriptionRt?: { json: Record<string, unknown> } | null;
  chartType?: string | null;
  csvData?: { url?: string } | null;
  colorScheme?: string | null;
  showLegend?: boolean | null;
};

type DataVizByIdResponse = {
  dataVizCollection: {
    items: Array<RawDataViz | null>;
  };
};

function mapDataViz(item: RawDataViz | null): DataVizFragment | null {
  if (!item || item.__typename !== 'DataViz') return null;
  return {
    __typename: 'DataViz',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    titleRt: item.titleRt ?? null,
    descriptionRt: item.descriptionRt ?? null,
    chartType: item.chartType ?? null,
    csvData: item.csvData ?? null,
    colorScheme: item.colorScheme ?? null,
    showLegend: item.showLegend ?? null,
  };
}

/** Fetch a single DataViz entry by ID for ID-based live preview. */
export async function getDataVizByEntryId({
  entryId,
  locale = 'en-US',
}: {
  entryId: string;
  locale?: string;
}): Promise<DataVizFragment | null> {
  try {
    const data = await fetchGraphQL<DataVizByIdResponse>({
      query: DATA_VIZ_BY_ID,
      variables: { id: entryId, locale, preview: true },
      preview: true,
    });
    const item = data.dataVizCollection?.items?.[0] ?? null;
    return mapDataViz(item);
  } catch {
    return null;
  }
}
