/**
 * GraphQL Fragment Validation Tests
 *
 * Catches two recurring issues:
 * 1. Union type fields missing inline fragments (causes "Cannot query field on type X" errors)
 * 2. Inline fragments missing __typename or sys { id } (causes silent data loss or broken edit buttons)
 *
 * Run after any change to queries.ts, content type field validations, or components
 * that reference multi-CT collections (sectionsCollection, calloutCardsCollection, etc.)
 */
import { describe, expect, it } from 'vitest';

import * as queries from './queries';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Extract the raw query string from an exported template literal constant. */
function getQuery(name: string): string {
  const q = (queries as Record<string, unknown>)[name];
  if (typeof q !== 'string') throw new Error(`Query "${name}" not found or not a string`);
  return q;
}

/** All exported query strings from queries.ts */
function getAllExportedQueries(): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(queries)) {
    if (typeof value === 'string' && value.includes('{')) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Check that a collection field uses inline fragments (... on TypeName)
 * rather than bare top-level fields. Bare fields on union types cause
 * "Cannot query field X on type Y" GraphQL errors.
 */
function extractCollectionBlock(query: string, collectionName: string): string | null {
  // Find the collection and its items { ... } block
  const regex = new RegExp(`${collectionName}\\s*\\([^)]*\\)\\s*\\{\\s*items\\s*\\{([\\s\\S]*?)\\}\\s*\\}`, 'g');
  const match = regex.exec(query);
  return match ? match[1] : null;
}

/**
 * Check if a block of GraphQL uses only inline fragments at the top level.
 * Parses brace depth to only look at depth-0 tokens (not inside fragments).
 * Returns any bare field names found at the top level outside of inline fragments.
 */
function findBareFields(itemsBlock: string): string[] {
  const bareFields: string[] = [];
  let depth = 0;
  let i = 0;
  const len = itemsBlock.length;

  while (i < len) {
    if (itemsBlock[i] === '{') {
      depth++;
      i++;
    } else if (itemsBlock[i] === '}') {
      depth--;
      i++;
    } else if (depth === 0) {
      // At top level: only "... on TypeName" should appear
      // Check for "... on" (which is valid)
      const remaining = itemsBlock.slice(i);
      const spreadMatch = remaining.match(/^\.\.\.\s+on\s+\w+/);
      if (spreadMatch) {
        i += spreadMatch[0].length;
        continue;
      }
      // Check for a bare field name (NOT valid in a union type)
      const fieldMatch = remaining.match(/^([a-zA-Z_]\w*)/);
      if (fieldMatch) {
        bareFields.push(fieldMatch[1]);
        i += fieldMatch[0].length;
        continue;
      }
      i++;
    } else {
      i++;
    }
  }
  return bareFields;
}

/**
 * Extract the full body of an inline fragment, handling nested braces.
 */
function extractFragmentBody(text: string, startIdx: number): string {
  let depth = 0;
  let start = -1;
  for (let i = startIdx; i < text.length; i++) {
    if (text[i] === '{') {
      if (depth === 0) start = i + 1;
      depth++;
    } else if (text[i] === '}') {
      depth--;
      if (depth === 0) return text.slice(start, i);
    }
  }
  return '';
}

/**
 * Check that every inline fragment in a block includes __typename and sys { id }.
 * Missing __typename breaks BlockRenderer dispatch. Missing sys.id breaks edit buttons.
 */
function validateInlineFragments(itemsBlock: string): { type: string; missing: string[] }[] {
  const fragmentStarts = [...itemsBlock.matchAll(/\.\.\.\s+on\s+(\w+)\s*\{/g)];
  const issues: { type: string; missing: string[] }[] = [];

  for (const match of fragmentStarts) {
    const typeName = match[1];
    if (typeName === 'Entry') continue; // Entry is a catch-all, doesn't need __typename
    const body = extractFragmentBody(itemsBlock, match.index!);
    const missing: string[] = [];
    if (!body.includes('__typename')) missing.push('__typename');
    if (!body.includes('sys')) missing.push('sys { id }');
    if (missing.length > 0) {
      issues.push({ type: typeName, missing });
    }
  }
  return issues;
}

// ─── Known union-type collections that MUST use inline fragments ────────────

// Only include collections where the items block has ONLY inline fragments
// (no shared top-level __typename/sys). sectionsCollection in PAGE_BY_SLUG
// uses the lean/full fragment split where __typename+sys are at items level,
// so it's excluded from strict inline-only checks.
// Use the exported query names (which interpolate the internal fragment constants)
// productListing CT accepts Card|Banner in calloutCards (union type).
// dynamicListing CT only accepts Card (single type, no union fragment needed).
const UNION_COLLECTIONS = [
  {
    name: 'calloutCardsCollection',
    queries: ['PRODUCT_LISTING_BY_ID', 'PRODUCT_LISTING_BY_SLUG'],
    expectedTypes: ['Card', 'Banner'],
  },
];

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('GraphQL Fragment Validation', () => {
  describe('Union type collections use inline fragments (no bare fields)', () => {
    const allQueries = getAllExportedQueries();

    for (const { name, queries: queryNames, expectedTypes } of UNION_COLLECTIONS) {
      for (const queryName of queryNames) {
        const query = allQueries[queryName];
        if (!query) continue;

        it(`${queryName} > ${name}: no bare fields outside inline fragments`, () => {
          const itemsBlock = extractCollectionBlock(query, name);
          if (!itemsBlock) {
            if (!query.includes(name)) return;
            throw new Error(`Found ${name} in ${queryName} but couldn't extract items block`);
          }

          const bareFields = findBareFields(itemsBlock);
          expect(
            bareFields,
            `${queryName} > ${name} has bare fields outside inline fragments: ${bareFields.join(', ')}. ` +
              `Union types require all fields inside "... on TypeName { }" blocks.`,
          ).toEqual([]);
        });

        it(`${queryName} > ${name}: has inline fragments for expected types`, () => {
          const itemsBlock = extractCollectionBlock(query, name);
          if (!itemsBlock) return;

          for (const typeName of expectedTypes) {
            expect(
              itemsBlock,
              `${queryName} > ${name} missing "... on ${typeName}" inline fragment`,
            ).toContain(`... on ${typeName}`);
          }
        });

        it(`${queryName} > ${name}: every expected type has __typename + sys in its fragment`, () => {
          // Instead of parsing the items block (regex truncation issues with nested braces),
          // verify each expected type's fragment in the full query includes __typename and sys.
          for (const typeName of expectedTypes) {
            const fragmentRegex = new RegExp(
              `\\.\\.\\.\\s+on\\s+${typeName}\\s*\\{([\\s\\S]*?)(?=\\.\\.\\.\\s+on\\s+\\w|$)`,
            );
            const match = query.match(fragmentRegex);
            if (!match) continue; // Fragment existence checked in another test
            const body = match[1];
            expect(body, `... on ${typeName} missing __typename`).toContain('__typename');
            expect(body, `... on ${typeName} missing sys { id }`).toMatch(/sys\s*\{\s*id/);
          }
        });
      }
    }
  });

  describe('Fragment constants have required base fields', () => {
    const fragmentConstants = [
      'HERO_FIELDS',
      'HERO_PAGE_FIELDS',
      'BANNER_FIELDS',
      'CARD_FIELDS',
      'FAQ_FIELDS',
      'FAQ_PAGE_FIELDS',
      'CALLOUT_CARD_UNION_FIELDS',
    ];

    for (const name of fragmentConstants) {
      it(`${name} includes __typename and sys { id }`, () => {
        const fragment = (queries as Record<string, unknown>)[name];
        if (typeof fragment !== 'string') return; // Not exported or not a string

        expect(fragment, `${name} missing __typename`).toContain('__typename');
        expect(fragment, `${name} missing sys { id }`).toMatch(/sys\s*\{\s*id\s*\}/);
      });
    }
  });

  describe('ProductListing calloutCards must support both Card and Banner', () => {
    // productListing CT accepts Card|Banner. dynamicListing only accepts Card.
    // This test only checks productListing queries.
    const productListingQueries = ['PRODUCT_LISTING_BY_ID', 'PRODUCT_LISTING_BY_SLUG'];

    for (const queryName of productListingQueries) {
      it(`${queryName}: calloutCardsCollection has both Card and Banner fragments`, () => {
        const query = getQuery(queryName);
        expect(query).toContain('... on Card');
        expect(query).toContain('... on Banner');
      });
    }
  });
});
