# How NT Personalization Works

## Core Concepts

### Audience
A rule that evaluates to true/false for a given user profile. Rules are JSON (ANDs and ORs of trait comparisons). A user is in an audience if their `identify()` traits match.

### Experience
An A/B test or personalization rule. Links:
- One baseline (the default content)
- One or more variants (personalized versions)
- One audience (who sees which variant)

### Variant
A content entry of the same type as the baseline but with different field values. The variant swaps in when the user matches the audience.

### Profile
The NT SDK's per-user state object. Built from:
1. `page()` events — page views (auto-fired by `-next` package)
2. `identify()` calls — traits you explicitly set
3. NT's own segmentation models

## Data Flow

```
User visits page
  → NinetailedProvider initializes with API key + environment
  → NT SDK fetches user profile (or creates new anonymous one)
  → page() event fired (auto, via -next package)
  → identify() called with user traits (plan, industry, etc.)
  → NT evaluates all audiences against profile
  → For each Experience in page: selects baseline or variant
  → React re-renders with selected variant
```

## GraphQL Side

For each personalizable block, the page query must include `ntExperiencesCollection`:

```
Page entry
  → sectionsCollection
    → [Block] entry
      → ntExperiencesCollection
        → NtExperience entry
          → nt_audience → NtAudience (with ntRules)
          → nt_variants → [Block] variant entries
```

All this data is passed raw to `useLiveUpdates()`, then to the NT rendering component.

## NT vs Live Preview

NT personalization and Contentful Live Preview coexist:
- Live Preview updates the raw GraphQL data in real time
- NT reads the updated data and re-evaluates which variant to show
- The two systems don't conflict — NT just sees the latest content

## NT Preview Bar

For demos: enables selecting specific experiences and audiences manually in the browser:
- Add `?ninetailed=true` to any page URL
- Or register `NinetailedPreviewPlugin` so it always shows

The preview bar is the primary tool for demo presentations — it lets you say "this user is an enterprise buyer in finance" and show the personalized content live.
commit 