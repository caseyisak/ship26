# 8192-Byte Query Limit

## What It Is

Contentful's GraphQL API enforces a complexity limit that corresponds roughly to **8192 transmitted bytes** per query. This counts:
- Field selections
- Fragment spreads
- Variable declarations
- Whitespace (before minification)

## Why Whitespace Matters

`fetchGraphQL` minifies queries with `query.replace(/\s+/g, ' ').trim()`. Without this:
- A query written with normal indentation can be 30-40% larger in bytes
- Formatted queries with many fragments easily exceed 8192 bytes
- The minification is applied before transmission — write queries for readability, minification handles size

## How to Measure

```typescript
// Rough estimate before sending
const minified = query.replace(/\s+/g, ' ').trim();
console.log(`Query size: ${new TextEncoder().encode(minified).byteLength} bytes`);
```

## Warning Signs

- 400 error with message: "Query complexity limit exceeded" or `MAX_COMPLEXITY_EXCEEDED`
- Works in small tests but fails with full page + all blocks

## Reduction Strategies

### 1. Keep NT out of shared fragments
**Biggest single win.** `ntExperiencesCollection` with nested audience + variant fields adds ~400-600 bytes per block. If every block in the page query included it, you'd be over the limit with 4-5 blocks.

```typescript
// ❌ In PAGE fragment — inflates every page query
export const HERO_PAGE_FIELDS = `
  fragment HeroPageFields on Hero {
    ...
    ntExperiencesCollection(limit: 5) { ... }  // +500 bytes
  }
`;

// ✅ Only in BY_ID query
export const HERO_BY_ID = `
  query HeroById(...) {
    hero(...) {
      ...HeroPageFields
      ntExperiencesCollection(limit: 5) { ... }  // Fine, only this query
    }
  }
`;
```

### 2. Limit collection items
```typescript
ctaCollection(limit: 4)      // Don't use limit: 10 if you only show 4
subItemsCollection(limit: 6)
```

### 3. Select only needed fields
```typescript
// ❌ Too many fields
asset {
  url title description width height size contentType
}

// ✅ Only what's rendered
asset {
  url title width height
}
```

### 4. Split the page query
If a page has very many blocks, split into two queries: above-the-fold blocks in the first query, below-the-fold in a second (fetched lazily or in parallel).

## Monitoring

Check query size during development:
```typescript
// Add to fetchGraphQL temporarily
const minified = query.replace(/\s+/g, ' ').trim();
const bytes = new TextEncoder().encode(minified).byteLength;
if (bytes > 7000) {
  console.warn(`[fetchGraphQL] Large query: ${bytes} bytes (limit: 8192)`);
}
```
