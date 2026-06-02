/**
 * Shared record types and adapter interface for the Integration Simulator.
 *
 * ProductRecord mirrors a Shopify product shape (subset).
 * AssetRecord mirrors a DAM asset shape.
 * CatalogAdapter lets a real Shopify/DAM adapter swap in later.
 */

export interface ProductRecord {
  sku: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  currency: string;
  inStock: boolean;
  inventory: number;
  category: string;
  tags: string[];
  images: string[];
  variants?: {
    colors?: string[];
    sizes?: string[];
  };
  /** Platform label stamped on save (e.g. "BigCommerce", "Shopify"). */
  source?: string;
}

export interface AssetRecord {
  id: string;
  filename: string;
  title: string;
  fileType: string;
  fileSize: string;
  dimensions?: { width: number; height: number };
  tags: string[];
  url: string;
  thumbnailUrl: string;
  uploadedAt: string;
  uploadedBy: string;
  folder: string;
}

export interface CatalogAdapter {
  getProducts(query?: string): Promise<ProductRecord[]>;
  getAssets(query?: string): Promise<AssetRecord[]>;
}
