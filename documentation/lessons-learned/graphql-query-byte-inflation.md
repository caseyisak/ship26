## LL-018 — GraphQL query byte count exceeds 8192 limit despite character count appearing safe

- **Exact error / symptom:** `Contentful GraphQL error 400: The maximum allowed size for a query is 8192 bytes but it was 8743 bytes` — even though local character count estimated under limit.
- **Root cause:** Contentful counts actual transmitted bytes. Template literal whitespace/indentation inflates wire size by 30–40% beyond raw character count.
- **Solution:** Minify query strings before sending in `fetchGraphQL`:
  ```ts
  query: query.replace(/\s+/g, ' ').trim()
  ```
- **Prevention:** Always measure minified byte size, not raw character count. This fix is already shipped in bears and tracked in GH issue #12 for promotion to main.
- **Related files:** `src/services/contentful/client.ts`
