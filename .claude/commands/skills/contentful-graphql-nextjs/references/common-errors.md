# Common GraphQL Errors

## UNRESOLVABLE_LINK

**What:** A linked entry or asset in the response is not published or has been deleted.

**fetchGraphQL behavior:** Soft error — classified as non-fatal. The query succeeds with partial data. The link field returns `null` instead of the entry.

**Fix:** Publish the linked entry, or handle `null` in the component.

**Dev signal:** `[fetchGraphQL] GraphQL errors: ...UNRESOLVABLE_LINK` in the terminal.

---

## MAX_COMPLEXITY_EXCEEDED / 400 Query Too Large

**What:** The query exceeds Contentful's 8192-byte complexity limit.

**Signs:**
- 400 HTTP status
- Error message includes "complexity" or "MAX_COMPLEXITY_EXCEEDED"

**Fix:** See `references/query-limit.md`. Usually caused by `ntExperiencesCollection` in shared fragments.

---

## Field Name Mismatch (Silent Failure)

**What:** Query uses field name `headline` but CT was migrated to `headlineRt`. No 400 error — GraphQL just returns `null` for the mismatched field.

**Signs:**
- Block renders with empty/missing fields
- No visible error in browser
- Dev server terminal shows `[fetchGraphQL] GraphQL errors:` with field-not-found errors

**Fix:** Check `queries.ts` field names against actual CT field IDs in Contentful. This is the most common cause of "live preview not working" — often it's actually a field name mismatch causing null data.

---

## Preview Token Used for Delivery (or Vice Versa)

**What:** Wrong token selected for the request type.

**Signs:**
- Published content returns null in preview mode (delivery token used)
- Draft content not showing (preview token not used)

**fetchGraphQL behavior:** Token selection based on `preview` boolean parameter. If caller passes wrong value, wrong token is used.

**Fix:** Ensure `preview: true` is passed when you want draft content. Check `draftMode().isEnabled` in page components.

---

## `__typename` Missing from Response

**What:** The `__typename` meta-field was not requested in the fragment.

**Signs:**
- `BlockRenderer` can't dispatch to correct component
- `transformSection` returns undefined or hits default case
- Live preview doesn't update (SDK can't identify entry type)

**Fix:** Always include `sys { id __typename }` in every block fragment:
```graphql
fragment HeroPageFields on Hero {
  sys { id __typename }  # REQUIRED
  # ... other fields
}
```

---

## Query Returns Empty `items` Array

**What:** The query ran successfully but found no results.

**Common causes:**
1. Wrong `slug` value in variables
2. Entry not published (using delivery token)
3. Entry in wrong environment
4. `where` filter too restrictive

**Debug:**
```typescript
console.log('Query variables:', variables);
console.log('Response:', JSON.stringify(data, null, 2));
```

Check the entry in Contentful UI: is it published? Is it in the correct environment? Does the slug/ID match?

---

## Circular Fragment Reference

**What:** Fragment A includes Fragment B which includes Fragment A.

**Signs:** GraphQL parse error at build/request time.

**Common cause:** Putting `ntExperiencesCollection` in a shared fragment that's then referenced in NT variant queries.

**Fix:** NT variant fragments must NOT include `ntExperiencesCollection`. Use `...BlockPageFields` in variant fragments, never `...BlockNtFields`.
