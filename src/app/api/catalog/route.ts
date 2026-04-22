import { NextRequest, NextResponse } from 'next/server';

import { SEED_ASSETS, SEED_PRODUCTS } from '@/lib/integration-adapters/seed-data';

/**
 * GET /api/catalog?type=products|assets&q=searchterm
 *
 * Returns the integration simulator catalog filtered by optional search query.
 * Data is seeded in src/lib/integration-adapters/seed-data.ts.
 * A real implementation would swap the seed for a Shopify/DAM API call.
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

  if (type === 'products') {
    const results = q
      ? SEED_PRODUCTS.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q)),
        )
      : SEED_PRODUCTS;
    return NextResponse.json(results, { headers: corsHeaders });
  }

  if (type === 'assets') {
    const results = q
      ? SEED_ASSETS.filter(
          (a) =>
            a.filename.toLowerCase().includes(q) ||
            a.title.toLowerCase().includes(q) ||
            a.fileType.toLowerCase().includes(q) ||
            a.folder.toLowerCase().includes(q) ||
            a.tags.some((t) => t.toLowerCase().includes(q)),
        )
      : SEED_ASSETS;
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
