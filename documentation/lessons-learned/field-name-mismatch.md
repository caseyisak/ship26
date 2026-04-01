# Field Name Mismatch

**Symptom:** `GET /preview/hero/<id>` returns 404; service returns null even though the entry exists in Contentful.

**Root cause:** GraphQL query uses a field name that doesn't exist on the content type (e.g. `image { url }` when the Hero type has an asset field named `media`). The API returns null for the unknown field — the entry appears missing.

**Fix:** Use the exact Contentful field name in `queries.ts`. Map to component props in the service layer (`hero.ts`, `page.ts`), not in the query.

```graphql
# ❌ Wrong — 'image' doesn't exist on Hero in Contentful
fragment HeroFragment on Hero {
  image { url }
}

# ✅ Correct — use the actual Contentful field name
fragment HeroFragment on Hero {
  media { url width height }
}
```

Then map in the service layer:
```typescript
// src/services/contentful/hero.ts
export function mapHero(data: HeroFragment) {
  return {
    image: data.media,  // map media → image for component props
    ...
  };
}
```

**Prevention:** Confirm field names in Contentful (or via MCP `get_content_type`) before writing queries. This repo has no codegen — `queries.ts` and block-renderer types are the source of truth.

**Related files:** `src/services/contentful/queries.ts`, `src/services/contentful/hero.ts`, `src/services/contentful/page.ts`
