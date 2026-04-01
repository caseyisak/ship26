# __typename Case Sensitivity

**Symptom:** Block renderer shows wrong component or "unknown type"; config lookup fails silently.

**Root cause:** Block resolution matches `config.typename === data.__typename`. Contentful GraphQL returns `__typename: "Hero"` (capital H). Any case mismatch (e.g. `"hero"`) causes a silent miss — the block is skipped entirely.

**Fix:** Use the exact string Contentful returns. Request `__typename` in queries; use it as-is in types, configs, and tests.

```typescript
// src/block-renderer/types.ts
export type HeroFragment = {
  __typename: 'Hero';  // must match exactly what Contentful returns
  ...
};

// In tests
{ __typename: 'Hero' as const, ... }
```

**Prevention:** Copy `__typename` from a real GraphQL response or Contentful UI when adding a new block — never guess the casing. The safest check: query the type via GraphQL playground or MCP and read the `__typename` from the response.

**Related files:** `src/block-renderer/types.ts`, `src/block-renderer/utils.ts`, `src/services/contentful/page.ts`
