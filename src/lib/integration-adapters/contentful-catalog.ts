import type { AssetRecord, CatalogAdapter, ProductRecord } from './types';

const CATALOG_API_BASE =
  typeof window !== 'undefined'
    ? window.location.origin // absolute so new URL() doesn't throw; works in dialog iframes too
    : (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000');

/**
 * Concrete CatalogAdapter that fetches from /api/catalog.
 * The app iframe uses an absolute URL so it works cross-origin inside Contentful.
 */
export const contentfulCatalogAdapter: CatalogAdapter = {
  async getProducts(query?: string): Promise<ProductRecord[]> {
    const url = new URL(`${CATALOG_API_BASE}/api/catalog`);
    url.searchParams.set('type', 'products');
    if (query) url.searchParams.set('q', query);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch product catalog');
    return res.json() as Promise<ProductRecord[]>;
  },

  async getAssets(query?: string): Promise<AssetRecord[]> {
    const url = new URL(`${CATALOG_API_BASE}/api/catalog`);
    url.searchParams.set('type', 'assets');
    if (query) url.searchParams.set('q', query);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch asset catalog');
    return res.json() as Promise<AssetRecord[]>;
  },
};
