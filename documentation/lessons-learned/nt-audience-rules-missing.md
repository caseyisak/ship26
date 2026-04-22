## LL-014 — NT `identify()` fires but banner doesn't swap — audience rules not fetched

- **Exact error / symptom:** NT preview toggle works (manual override), but clicking Login → `identify({ isLoggedIn: true })` has no effect on rendered content.
- **Root cause:** `NT_AUDIENCE_FIELDS` GraphQL fragment did not include `ntRules`. Audiences were passed to `NinetailedProvider` as `{ id, name, description }` only — no rule definitions. The SDK has nothing to evaluate when profile traits change.
- **Solution:** Add `ntRules` to `NT_AUDIENCE_FIELDS` in `queries.ts`. Pass `rules: a.ntRules` in `mapAudiences` in `src/personalization/utils.ts`.
- **Diagnostic:** If the preview toggle works but `identify()` doesn't → audience rules are missing. The preview plugin bypasses audience evaluation entirely (manual override), so toggle working is not confirmation that rules are wired.
- **Related files:** `src/services/contentful/queries.ts` (`NT_AUDIENCE_FIELDS`), `src/personalization/utils.ts` (`mapAudiences`)
