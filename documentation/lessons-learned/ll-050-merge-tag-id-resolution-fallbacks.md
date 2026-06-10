# LL-050: Merge tag ID resolution needs fallback tiers

## Symptom
Merge tag shows literal `"for type: embedded-entry-inline id: E6Nxsw..."` instead of the resolved value ("Jordan"). The `ntMergetagId` is `"firstName"` but the NT profile has `traits.first_name` (snake_case, nested under `traits`).

## Root cause
NT merge tag docs say `ntMergetagId` uses dot-notation paths on the profile object (e.g. `traits.firstName`, `location.city`). But editors may create merge tags with shorthand IDs like `"firstName"` (no `traits.` prefix). And the actual profile trait key may be snake_case (`first_name`) while the merge tag uses camelCase (`firstName`).

The naive resolution (direct dot-path walk) fails for all three mismatches:
1. `"firstName"` → `profile.firstName` = undefined (no top-level `firstName`)
2. `"traits.firstName"` → `profile.traits.firstName` = undefined (snake_case key)
3. `"first_name"` → `profile.first_name` = undefined (nested under `traits`)

## Fix
Resolution function with three fallback tiers:

```typescript
export function resolveMergeTagValue(profile, mergeTagId): string | null {
  // 1. Direct path: "traits.first_name" → profile.traits.first_name
  let val = walkPath(profile, mergeTagId);
  if (val != null) return String(val);

  // 2. Auto-prefix: "firstName" → profile.traits.firstName
  if (!mergeTagId.startsWith('traits.')) {
    val = walkPath(profile, `traits.${mergeTagId}`);
    if (val != null) return String(val);

    // 3. camelCase→snake_case: "firstName" → profile.traits.first_name
    const snake = mergeTagId.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (snake !== mergeTagId) {
      val = walkPath(profile, `traits.${snake}`);
      if (val != null) return String(val);
    }
  }
  return null;
}
```

This is extracted into `src/lib/rich-text-merge-tags.tsx` as a shared utility used by all components via `useMergeTagRenderOptions()`.

## Also requires
1. GraphQL query must include `MERGE_TAG_RT_LINKS` on any rich text field that may contain embedded merge tags
2. Component must use `useMergeTagRenderOptions(baseOptions)` which adds `INLINES.EMBEDDED_ENTRY` handler
3. The `MergeTagsProvider` must be in the component tree (it is — mounted in `PersonalizationProvider`)

## Related files
- `src/lib/rich-text-merge-tags.tsx` — shared hook + resolution
- `src/services/contentful/queries.ts` — `MERGE_TAG_RT_LINKS` constant
- `src/personalization/merge-tags-context.tsx` — merge tag catalog provider
