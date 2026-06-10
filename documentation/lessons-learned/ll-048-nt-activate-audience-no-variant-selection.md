# LL-048: activateAudience() doesn't trigger SDK variant selection

## Symptom
`LocalAudienceEvaluator` calls `previewPlugin.activateAudience(audienceId)`. The audience appears in `preview.activeAudiences`. But the `<Experience>` component still renders baseline. `experienceVariantIndexes` shows `0` (baseline) for the experience.

## Root cause
With `useSDKEvaluation={true}`, the `<Experience>` component evaluates variants using the SDK's internal state, not the preview plugin's state. `activateAudience()` only updates the preview plugin's internal audience list — it does NOT trigger the SDK to re-evaluate which variant to show. The two systems (SDK evaluation and preview plugin state) are decoupled.

`profile.audiences` (from NT cloud) contains cloud-evaluated audience IDs which may differ from the Contentful `nt_audience` entry IDs used in experience configs. The local evaluator bridges this gap, but only if it also forces variant selection.

## Fix
After calling `activateAudience()`, also call `setExperienceVariant(experienceId, variantIndex)` for each experience whose audience matches:

```typescript
// In LocalAudienceEvaluator
allExperiences.forEach((exp) => {
  const audienceId = exp.audience?.id;
  if (matched.includes(audienceId)) {
    previewPlugin.setExperienceVariant(exp.id, 1); // variant index 1 = first variant
  } else {
    previewPlugin.resetExperience(exp.id);
  }
});
```

Both calls are required: `activateAudience` (for preview plugin UI) + `setExperienceVariant` (for actual variant rendering).

## Related files
- `src/personalization/local-audience-evaluator.tsx`
- `src/personalization/ninetailed-nextjs.tsx` — `useSDKEvaluation={true}`
- `src/block-renderer/block-renderer.tsx` — `<Experience>` component usage
