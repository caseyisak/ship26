# Common NT Errors

## Audience not evaluating / experience not showing

**Symptom:** NT Preview bar shows no experience, or always shows baseline variant.

**Checklist:**
1. Is `NEXT_PUBLIC_NINETAILED_API_KEY` set to the correct bucket?
   - `master` env → Main bucket key
   - Demo env → Development bucket key
2. Is `NEXT_PUBLIC_NINETAILED_ENVIRONMENT` set to `"main"` or `"development"` (lowercase, those exact strings)?
3. Is `identify()` being called? Check for `ninetailed:identify` in browser events.
4. Is `identify()` deferred? (see deferred pattern below)
5. Does the audience entry have `ntRules` field populated? (LL-014 fix)
6. Is the experience entry published in Contentful?
7. Is `ntExperiencesCollection` in the block's `*_BY_ID` query?

## `identify()` fires but audience doesn't match

**Symptom:** NT SDK receives traits but audience still shows baseline.

**Root cause:** `identify()` fires before NT's `onProfileChange` subscription is set up in parent components (React useEffect fires bottom-up — children before parents).

**Fix:**
```typescript
// WRONG
useEffect(() => {
  identify({ plan: 'enterprise', industry: 'media' });
}, []);

// CORRECT — defer to next event loop tick
useEffect(() => {
  setTimeout(() => {
    identify({ plan: 'enterprise', industry: 'media' });
  }, 0);
}, []);
```

## NT connections 409 ConflictError

**Symptom:** POST to `integration.ninetailed.co/v2/organizations/.../connections/` returns 409, but GET returns empty list.

**Root cause:** Orphaned record in NT backend that's invisible in the UI but blocks creation.

**Fix:** Email `support@ninetailed.io` with your organization ID and the connection details. This requires NT backend cleanup — cannot be fixed from the Contentful UI or MCP.

## `nt_audience_id` field empty after MCP creation

**Symptom:** Created `nt_audience` entry via MCP, but `nt_audience_id` field is empty.

**Fix:** Do not set `nt_audience_id` on creation. Open the entry in Contentful UI — NT automatically sets this field to `sys.id` when the entry is viewed. Same for `nt_experience_id`.

## ntRules not evaluating (LL-014)

**Symptom:** Audience entry exists, experience is published, but NT never matches users to the audience.

**Root cause:** The `ntRules` field was missing from the GraphQL fragment — the rule JSON was not being passed to NT SDK.

**Fix:** Ensure `ntRules` is in `NT_AUDIENCE_FIELDS` fragment in `queries.ts`:
```graphql
fragment NtAudienceFields on NtAudience {
  sys { id }
  ntAudienceId
  ntRules  # ← REQUIRED
}
```

## Preview bar not showing

**Symptom:** `?ninetailed=true` URL param doesn't show the preview bar.

**Checklist:**
1. Is `NinetailedPreviewPlugin` registered in `NinetailedProvider`?
2. Is the Preview API key (`NEXT_PUBLIC_NINETAILED_PREVIEW_API_KEY`) set?
3. Are you on `localhost` or a preview deployment (not production)?

## `ntExperiencesCollection` causing query size error

**Symptom:** 400 MAX_COMPLEXITY_EXCEEDED on a page with many blocks.

**Root cause:** `ntExperiencesCollection` was added to a shared `*_PAGE_FIELDS` fragment — now inflates every block in every page query.

**Fix:** Move `ntExperiencesCollection` to the `*_BY_ID` query only. Never in shared fragments.

## Experience renders wrong variant

**Symptom:** Wrong variant showing in production, but preview bar shows correct one.

**Checklist:**
1. Is the correct experience published (not just saved)?
2. Are all variant entries published?
3. Is audience rule JSON valid? (check with NT support if unsure of rule format)
4. Is the user's `identify()` payload matching the audience rules?
