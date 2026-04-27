# LL-028 — NT personalization shows baseline on all page routes

**Date:** 2026-04-27
**Symptom:** Ninetailed `<Experience>` component always renders baseline content on pages loaded via `PAGE_BY_SLUG`. Preview panel opens correctly; `experienceVariantIndexes` shows correct variant selected; DOM still shows baseline text.
**Wasted time:** ~4 hours

---

## Root cause

`PAGE_BY_SLUG` uses lean fragments (e.g. `HERO_PAGE_FIELDS`) that omit `ntExperiencesCollection` to stay under Contentful's 8192-byte query limit (see LL-011). Block-renderer reads `data.ntExperiencesCollection?.items` to build `mappedExperiences`. Without `ntExperiencesCollection` in the response, `isPersonalized(data)` returns false and `mappedExperiences = []`.

The NT `<Experience>` component receives `experiences={[]}` and falls through to baseline on every call — no experience can match an empty array. The preview plugin's `experienceVariantIndexes` reflects the plugin's own state (which radio was clicked), but the React component reads from `useESR()` and uses the `experiences` prop for lookup. These are separate.

---

## Fix

Expose `mappedExperiences` (all NT experiences) from `NinetailedProvider` via a React context (`NtExperiencesContext`). Block-renderer reads from this context instead of per-block `ntExperiencesCollection`. The `<Experience>` component's built-in lookup (`nt_config.components[].baseline.id === data.sys.id`) correctly filters to only the experience targeting the current block.

```tsx
// ninetailed-nextjs.tsx
export const NtExperiencesContext = createContext<ExperienceConfiguration[]>([]);
export const useNtExperiences = () => useContext(NtExperiencesContext);

// Inside NinetailedProvider render:
<NtExperiencesContext.Provider value={mappedExperiences}>
  <ReactNinetailedProvider ...>
    {children}
  </ReactNinetailedProvider>
</NtExperiencesContext.Provider>
```

```tsx
// block-renderer.tsx
const allNtExperiences = useNtExperiences();

const mappedExperiences =
  allNtExperiences.length > 0
    ? allNtExperiences
    : isPersonalized(data)
      ? mapExperiences(data.ntExperiencesCollection?.items)
      : [];
```

The fallback to `ntExperiencesCollection` is kept for preview routes that fetch the full fragment.

---

## Debugging trap — `experienceVariantIndexes: {}` is not a signal

An empty `{}` on page load is **normal**. It means no preview-panel override is active. The SDK chose the variant via natural audience evaluation / distribution hash. Check the rendered DOM (`document.querySelector('main h1')?.innerText`) to confirm the variant is showing — not `experienceVariantIndexes`.

---

## Related files

- `src/personalization/ninetailed-nextjs.tsx` — context definition + provider
- `src/block-renderer/block-renderer.tsx` — reads from context
- `src/services/contentful/queries.ts` — `HERO_PAGE_FIELDS` (lean, omits ntExperiencesCollection)
- `.claude/commands/skills/test-nt-personalization/SKILL.md` — Phase 4 item 2

## See also

- LL-011 — Contentful 8192-byte query limit (why ntExperiencesCollection was omitted)
