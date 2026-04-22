import { NextRequest, NextResponse } from 'next/server';

import { SEED_ASSETS, SEED_PRODUCTS } from '@/lib/integration-adapters/seed-data';
import { getSettings } from '@/services/contentful/settings';

/**
 * GET /api/catalog?type=products|assets&q=searchterm
 *
 * Returns the integration simulator catalog filtered by optional search query.
 * Data source: Settings CT → productCatalog / assetCatalog JSON fields.
 * Falls back to seed-data.ts if the Settings entry has no catalog data.
 *
 * Responds with CORS headers so the Contentful app iframe can fetch it.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get('type');
  const q = (searchParams.get('q') ?? '').toLowerCase().trim();

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': 'no-store',
  };

  const settings = await getSettings();

  if (type === 'products') {
    const catalog = settings?.productCatalog ?? SEED_PRODUCTS;
    const results = q
      ? catalog.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q)),
        )
      : catalog;
    return NextResponse.json(results, { headers: corsHeaders });
  }

  if (type === 'assets') {
    const catalog = settings?.assetCatalog ?? SEED_ASSETS;
    const results = q
      ? catalog.filter(
          (a) =>
            a.filename.toLowerCase().includes(q) ||
            a.title.toLowerCase().includes(q) ||
            a.fileType.toLowerCase().includes(q) ||
            a.folder.toLowerCase().includes(q) ||
            a.tags.some((t) => t.toLowerCase().includes(q)),
        )
      : catalog;
    return NextResponse.json(results, { headers: corsHeaders });
  }

  return NextResponse.json(
    { error: 'type must be "products" or "assets"' },
    { status: 400, headers: corsHeaders },
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
}
