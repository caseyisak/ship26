# LL-023 — NT merge tag field stores `{{ profile.traits.x }}` but `selectValueFromProfile` needs lodash path syntax

## Symptom

Merge tag personalization resolves to `undefined` at runtime even though the Contentful field is populated with a valid merge tag value and `selectValueFromProfile` is called correctly.

## Root Cause

When editors set a merge tag value in Contentful they use handlebars-style syntax:

```
{{ profile.traits.market }}
```

The NT `selectValueFromProfile` utility uses lodash `get()` path syntax internally. It expects **flattened dot-notation** (or underscore-separated) path strings, not handlebars wrappers:

```
traits_market   # ← what selectValueFromProfile expects
```

Passing the raw Contentful field value directly silently resolves to `undefined` — no error thrown.

## Fix

Transform the stored value before passing it to `selectValueFromProfile`. Strip the `{{ profile. }}` wrapper and replace `.` with `_`:

```ts
function toNtPath(mergeTag: string): string {
  // "{{ profile.traits.market }}" → "traits_market"
  return mergeTag
    .replace(/^\{\{\s*profile\.\s*/, '')  // strip "{{ profile."
    .replace(/\s*\}\}$/, '')              // strip " }}"
    .replace(/\./g, '_')                  // dots → underscores
    .trim()
}

const value = selectValueFromProfile(profile, toNtPath(entry.mergeTagField))
```

## Why It Matters

This mismatch is silent — `selectValueFromProfile` returns `undefined` without throwing, so components render fallback/default content and the bug looks like a missing audience match rather than a data formatting issue.

## Seen In

- `demo/wow-personalization-2026-04` — FeatureItem NT merge tag fix
