---
name: contentful-personalization
description: Diagnose, implement, and audit Ninetailed personalization in this Next.js + Contentful project. Use for any NT-related work: debugging audience resolution, building experiences, auditing setup, or onboarding to the personalization stack. This is the correct skill for all Ninetailed work — Contentful's "Experiences" product IS Ninetailed (confusingly named the same as the deprecated Studio/Experiences SDK which is unrelated).
metadata:
  author: skills-upgrade
  version: 1.0.0
allowed-tools:
  - Read
  - Glob
  - Grep
  - mcp__contentful__get_content_type
  - mcp__contentful__list_content_types
  - mcp__contentful__get_entry
  - mcp__contentful__search_entries
  - mcp__contentful__list_environments
  - mcp__playwright__browser_navigate
  - mcp__playwright__browser_snapshot
  - mcp__playwright__browser_evaluate
  - mcp__playwright__browser_console_messages
---

# Contentful Personalization (Ninetailed)

You are a Ninetailed personalization expert for a **Next.js 15 App Router + Contentful GraphQL** project. The personalization product is sold as "Contentful Personalization" or "Contentful Experiences" but is entirely powered by Ninetailed SDK.

## CRITICAL: SDK Selection for This Project

**Current state (as of last audit):** `@ninetailed/experience.js-react` v7.22.0-alpha.2  
**Correct package:** `@ninetailed/experience.js-next`

This matters because `-next` automatically calls `page()` on every Next.js navigation. Without it, audience resolution degrades because page view events are not tracked. Check `package.json` before any NT work.

## Project Config

| Variable | Value |
|----------|-------|
| Space | `uumzxfocy3ef` |
| Main env | `master` → NT **Main** data bucket |
| Demo envs | `bears`, etc. → NT **Development** data bucket |
| NT API key var | `NEXT_PUBLIC_NINETAILED_API_KEY` |
| NT env var | `NEXT_PUBLIC_NINETAILED_ENVIRONMENT` (must be `"main"` or `"development"` only) |

## Sub-Skills — Route Here First

| When user wants to... | Use sub-skill |
|----------------------|--------------|
| Get up to speed on NT in this project | `onboard` |
| Debug audience resolution / experience not showing | `live-debug` |
| Full audit of current setup | `doctor` |
| Build a new personalized experience | `develop` |

---

## Sub-Skill: `onboard`

Orient a new session or new developer to the NT setup.

**Steps:**
1. Read `src/lib/ninetailed.tsx` or wherever NinetailedProvider is mounted
2. Read `src/services/contentful/queries.ts` — find `NT_AUDIENCE_FIELDS`, `NT_VARIANT_FIELDS`
3. Check `package.json` for NT packages and versions
4. Run `mcp__contentful__list_content_types` — confirm `nt_experience`, `nt_audience`, `nt_mergetag` exist
5. Report: SDK version, provider location, query patterns, content types found

**Common NT content types to verify exist:**
- `nt_experience` (has `nt_experience_id`, `nt_audience`, `nt_config`, `nt_variants`)
- `nt_audience` (has `nt_audience_id`, `nt_rules` — **ntRules required for LL-014 fix**)
- `nt_mergetag` (has `nt_mergetag_id`, `fallback`)

---

## Sub-Skill: `live-debug`

Debug personalization not working in real time.

**Checklist:**
1. Check browser console for NT SDK initialization messages
2. Verify `NEXT_PUBLIC_NINETAILED_API_KEY` is set and matches the correct bucket (Main vs Development)
3. Open NT Preview bar: `?ninetailed=true` query param or `NinetailedPreviewPlugin`
4. Check if `identify()` was called — look for `ninetailed:identify` events in console
5. Verify audience rules match user traits (use NT Preview bar to set traits)
6. Check `ntExperiencesCollection` is present in the page's GraphQL query

**Known bugs (check memory before debugging):**
- `identify()` must be deferred: `setTimeout(() => identify(traits), 0)` — React useEffect fires bottom-up, so parent NinetailedProvider subscription is not ready when child fires
- NT connections endpoint 409: orphaned record in NT backend — needs NT support if GET returns empty
- `nt_audience` entry: skip `nt_audience_id` field on creation — NT fills it from `sys.id` when entry is opened in UI

**Steps:**
1. Use Playwright MCP: navigate to `/page/home?preview=true`
2. Check console messages for NT errors
3. Take screenshot of page in default state
4. Add `?ninetailed=true` to URL, take screenshot of preview bar
5. Report audience name, experience name, variant being shown

---

## Sub-Skill: `doctor`

Full audit of the current NT setup. Produces a health report.

**Audit checklist:**

### Package audit
```bash
# Run in worktree
grep -E "ninetailed" package.json
```
- [ ] Using `@ninetailed/experience.js-next` (not `-react`)
- [ ] Version is pinned (not alpha unless intentional)
- [ ] `@ninetailed/experience.js-insights` present (for analytics)
- [ ] `@ninetailed/experience.js-preview` present (for preview bar)

### Provider audit
- [ ] `NinetailedProvider` wraps the full app (in root layout)
- [ ] Passes correct `clientId` (API key) and `environment` prop
- [ ] `NinetailedInsightsPlugin` registered if analytics needed
- [ ] `NinetailedPreviewPlugin` registered for demo use

### GraphQL audit
- [ ] `ntExperiencesCollection` is NOT in shared `*_PAGE_FIELDS` fragments (would inflate every query over 8192 bytes)
- [ ] `ntExperiencesCollection` is only in `*_BY_ID` queries
- [ ] `NT_AUDIENCE_FIELDS` includes `ntRules` (fixes LL-014)
- [ ] `NT_VARIANT_FIELDS` covers all personalizable block typenames

### Content type audit (via Contentful MCP)
- [ ] `nt_experience` CT exists
- [ ] `nt_audience` CT exists with `nt_rules` field
- [ ] `nt_mergetag` CT exists
- [ ] At least one published NT experience entry exists

### Data bucket audit
- [ ] `master` env uses `NEXT_PUBLIC_NINETAILED_ENVIRONMENT=main`
- [ ] Demo envs use `NEXT_PUBLIC_NINETAILED_ENVIRONMENT=development`
- [ ] Correct API keys for each bucket in each `.env.local`

**Report format:**
```
NT Doctor Report — [date]
Package: ✅/⚠️ [version] — [note]
Provider: ✅/⚠️ [location] — [note]
GraphQL: ✅/⚠️ [finding]
Content types: ✅/⚠️ [what exists]
Data bucket: ✅/⚠️ [config]
Critical issues: [list]
Recommended fixes: [ordered list]
```

---

## Sub-Skill: `develop`

Build a new personalized experience from scratch.

**Workflow:**
1. Confirm `nt_audience` entry exists (or create via Contentful MCP)
2. Create `nt_experience` entry linking baseline + variants
3. Add `ntExperiencesCollection` to the block's `*_BY_ID` query (NOT the shared fragment)
4. Add `NtExperiencesContext` or experience rendering logic in the component
5. Test with Playwright MCP + NT Preview bar

**Creating NT entries via MCP — CRITICAL rules:**
- When creating `nt_audience` entry: do NOT set `nt_audience_id` field — NT auto-fills it from `sys.id` when entry is opened in Contentful UI
- When creating `nt_experience` entry: do NOT set `nt_experience_id` field — same rule
- Publish child entries before parent (audiences before experience, variants before experience)

**GraphQL pattern for personalized block:**
```graphql
# In *_BY_ID query only, not shared fragment
fragment NtExperiencesFields on [BlockType] {
  ntExperiencesCollection(limit: 5) {
    items {
      ... on NtExperience {
        sys { id }
        ntConfig
        ntAudienceCollection {
          items {
            ... on NtAudience {
              sys { id }
              ntRules
            }
          }
        }
        ntVariantsCollection {
          items {
            ... on [BlockType] {
              ...BlockFields
            }
          }
        }
      }
    }
  }
}
```

**`identify()` deferred pattern (required):**
```typescript
// WRONG — fires before NT subscription is ready
useEffect(() => {
  identify({ plan: 'enterprise' });
}, []);

// CORRECT — defer to next event loop tick
useEffect(() => {
  setTimeout(() => {
    identify({ plan: 'enterprise' });
  }, 0);
}, []);
```

---

## Reference Files

| File | Topic |
|------|-------|
| `references/sdk-selection.md` | Which SDK package to use and why |
| `references/how-personalization-works.md` | Core concepts: audiences, experiences, variants |
| `references/common-errors.md` | Error patterns and fixes |
| `references/sdk-next-guide.md` | Next.js App Router specific guide |
| `references/component-patterns.md` | Experience component patterns |
| `references/rendering-pipeline.md` | How NT renders variants |
| `references/env-var-spec.md` | All environment variables |
| `references/analytics-and-preview.md` | Analytics plugin + preview bar |
| `references/readiness-criteria.md` | Definition of "personalization done" |
| `references/contentful-integration-guide.md` | Setting up NT in Contentful |
| `references/package-versions.md` | Compatible package versions |
| `references/provider-patterns.md` | NinetailedProvider placement |
| `references/ssr-guide.md` | Server-side rendering + preflight |
| `references/middleware-patterns.md` | Next.js middleware for NT |
| `references/implementation-examples.md` | Concrete code examples |
| `references/analytics-patterns.md` | Analytics event tracking |
| `references/contentful-app-setup.md` | NT app in Contentful UI |
| `references/framework-notes.md` | Next.js App Router vs Pages Router |
| `references/sdk-legacy-guide.md` | Migrating from old SDK |
