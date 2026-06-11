/**
 * use-discounted-catalog.ts — Applies persona-based discounts to product prices.
 *
 * Reads the current persona's loyalty_tier and maps:
 *   platinum → 15% off
 *   explorer → 10% off
 *
 * Only applies discount if product doesn't already have a salePrice.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';

import type { ProductRecord } from '@/lib/integration-adapters/types';
import { getPersona } from '@/lib/persona-session';

const TIER_DISCOUNTS: Record<string, number> = {
  platinum: 0.15,
  explorer: 0.10,
};

function getDiscount(): number {
  if (typeof window === 'undefined') return 0;
  const persona = getPersona();
  if (!persona?.loyalty_tier) return 0;
  return TIER_DISCOUNTS[persona.loyalty_tier.toLowerCase()] ?? 0;
}

/**
 * Returns a copy of the product catalog with persona-based discounts applied.
 * Products that already have a salePrice are left unchanged.
 *
 * Returns the unmodified catalog on the initial render (server + hydration)
 * to avoid React hydration mismatches, then applies discounts after mount.
 */
export function useDiscountedCatalog(products: ProductRecord[]): ProductRecord[] {
  const [mounted, setMounted] = useState(false);
  const [personaVersion, setPersonaVersion] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = () => setPersonaVersion((v) => v + 1);
    window.addEventListener('persona-changed', handler);
    return () => window.removeEventListener('persona-changed', handler);
  }, []);

  return useMemo(() => {
    if (!mounted) return products;
    const discount = getDiscount();
    if (discount === 0) return products;

    return products.map((p) => {
      if (p.salePrice != null) return p;
      return {
        ...p,
        salePrice: Math.round(p.price * (1 - discount) * 100) / 100,
      };
    });
  }, [products, mounted, personaVersion]);
}

/**
 * Apply discount to a single product. For use in PDP and other single-product contexts.
 */
export function applyPersonaDiscount(product: ProductRecord): ProductRecord {
  if (product.salePrice != null) return product;
  const discount = getDiscount();
  if (discount === 0) return product;
  return {
    ...product,
    salePrice: Math.round(product.price * (1 - discount) * 100) / 100,
  };
}
