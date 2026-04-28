# LL-029 — NT preview plugin `getExperienceSelectionMiddleware` uses `find()`: only the first matching experience wins

## Symptom

With `useSDKEvaluation={true}` and `LocalAudienceEvaluator` correctly activating audiences via `activateAudience()`, the `<Experience>` component still showed baseline. Specifically:

- Banner experience swapped correctly (banner variant visible)
- Hero experience on the same page did NOT swap (showed "Hero Title" baseline)
- `nt.plugins.preview.activeAudiences` showed both audience IDs as active
- `nt.plugins.preview.experienceVariantIndexes` showed variant index 1 for both experiences
- Yet `<Experience>` rendered baseline for the hero

## Root Cause

The NT preview plugin's `getExperienceSelectionMiddleware` does:

```js
const experience = experiences.find(exp => experienceIds.includes(exp.id));
```

This picks the **first** experience in the `experiences` array that appears in `experienceVariantIndexes` — regardless of which baseline entry it targets. If two or more experiences are simultaneously active (different audiences, different baseline targets), the one that comes first in the global experiences array wins for EVERY `<Experience>` component. The second one's `<Experience>` component checks `baselineComponent.baseline.id === data.sys.id`, finds no match, and falls back to baseline.

### The sequence when it breaks

1. Page has Hero (entry A) and Banner (entry B), each with their own NT experience
2. Both audiences are active → both experiences in `experienceVariantIndexes`
3. Global `mappedExperiences` order: `[bannerExp, heroExp, ...]`
4. Banner `<Experience id="B">`: middleware finds `bannerExp` first → correct `baselineComponent` for B → returns variant ✅
5. Hero `<Experience id="A">`: middleware also finds `bannerExp` first → no `baselineComponent` for A → returns baseline ❌

### Additional trigger: "Logged In Hero" experience conflict

The old `7BPYMahwIjywrCk6RIA4Y6` experience (`is_logged_in` audience) targeted the same hero baseline as the new returning-visitor experience. When both audiences match simultaneously, the first experience found by `find()` has no matching baseline component for the correct variant → baseline is returned even for the solo hero.

## Fix

Filter `allNtExperiences` in `BlockRenderer` before passing to `<Experience>` so each component only receives experiences that target **its own** `data.sys.id` as baseline:

```tsx
// In block-renderer.tsx
const blockExperiences = allNtExperiences.length > 0
  ? allNtExperiences.filter((exp) =>
      (exp.components ?? []).some(
        (comp) =>
          (comp as { type?: string; baseline?: { id?: string } }).type === 'EntryReplacement' &&
          (comp as { type?: string; baseline?: { id?: string } }).baseline?.id === data.sys.id,
      ),
    )
  : isPersonalized(data)
    ? mapExperiences(data.ntExperiencesCollection?.items)
    : [];
```

This mirrors the intent of the original per-block `ntExperiencesCollection` approach (LL-011 workaround) while keeping the global context fetch to avoid the 8192-byte query limit.

## Related Files

- `src/block-renderer/block-renderer.tsx` — fix applied here (filter before passing to `<Experience>`)
- `src/personalization/ninetailed-nextjs.tsx` — `NtExperiencesContext` provides all experiences globally
- `src/personalization/local-audience-evaluator.tsx` — activates audiences via preview plugin
- `node_modules/@ninetailed/experience.js-plugin-preview/index.cjs.js` — `getExperienceSelectionMiddleware` line ~206

## Also fixed in same session

- `7BPYMahwIjywrCk6RIA4Y6` ("Logged In Hero" experience): removed home hero baseline from `nt_config.components` so it no longer conflicts with persona-specific hero experiences
- `6yUhVoaCfb1sBoHCKgBlrY` (home hero): removed `7BPYMahwIjywrCk6RIA4Y6` from `nt_experiences` field
