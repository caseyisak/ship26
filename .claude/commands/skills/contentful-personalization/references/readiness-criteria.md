# Personalization Readiness Criteria

## "Done" Checklist for NT Personalization on a Block

### Code
- [ ] Block uses `@ninetailed/experience.js-next` (not `-react`)
- [ ] `NinetailedProvider` is in root layout with correct `clientId` and `environment`
- [ ] `ntExperiencesCollection` in the block's `*_BY_ID` query (NOT in shared page fragment)
- [ ] `ntRules` is in `NT_AUDIENCE_FIELDS` fragment
- [ ] `identify()` call is deferred with `setTimeout(fn, 0)`
- [ ] Variant entries are the same CT as baseline

### Contentful
- [ ] `nt_audience` CT exists with `ntRules` field
- [ ] `nt_experience` CT exists
- [ ] At least one published audience entry
- [ ] At least one published experience entry
- [ ] Variant entries are published
- [ ] Experience is linked to the correct baseline entry

### Environment
- [ ] `NEXT_PUBLIC_NINETAILED_API_KEY` = correct bucket key for this env
- [ ] `NEXT_PUBLIC_NINETAILED_ENVIRONMENT` = `"main"` or `"development"` (exact strings)

### Testing
- [ ] NT Preview bar shows correct experience name
- [ ] Switching audience in preview bar swaps variant
- [ ] Baseline shows when no audience matches
- [ ] `identify()` with matching traits → correct variant
- [ ] Playwright screenshot confirms correct variant rendered

## "Done" Checklist for Doctor Audit

- [ ] All packages audited (correct SDK, versions pinned)
- [ ] Provider in correct location (root layout)
- [ ] GraphQL fragments audited (no ntExperiencesCollection in shared fragments)
- [ ] All NT CTs present in target environment
- [ ] Env vars correct for target environment
- [ ] At least one end-to-end test (identify → variant shows)
