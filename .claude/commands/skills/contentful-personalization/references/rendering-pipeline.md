# NT Rendering Pipeline

## Full Data Flow

```
1. Server: fetchGraphQL({ query: BLOCK_BY_ID, preview })
   → Returns raw data including ntExperiencesCollection

2. Client: useLiveUpdates(rawData)
   → Merges any live preview updates from postMessage
   → Returns liveData (still raw, with __typename and sys.id intact)

3. Client: NT Experience component reads liveData.ntExperiencesCollection
   → Passes experiences array to NT SDK
   → NT SDK evaluates audiences against current profile

4. NT SDK: selects variant (or baseline if no match)
   → Re-renders the block component with selected variant data

5. If identify() is called later:
   → NT re-evaluates audiences with new traits
   → May swap variant → triggers re-render
```

## Timing: Why Hydration Order Matters

React Server Components hydrate before Client Components. Within Client Components, `useEffect` fires **bottom-up** (children before parents). This means:

```
RootLayout renders
  → NinetailedWrapper (client component) renders
    → Page content renders
      → Navbar useEffect fires → identify() called
        → NinetailedProvider onProfileChange subscription NOT YET SET UP
          → identify() traits are lost!
```

**Fix:** `setTimeout(fn, 0)` in `identify()` calls defers to the next event loop tick, by which time the parent subscription is established.

## Rendering Modes

| Mode | When | Notes |
|------|------|-------|
| Client-side hydration | Default | Baseline shows on first render, variant swaps in after hydration |
| SSR preflight | With cookie + preflight API | Correct variant on first render, no flash |
| Static + client | `getStaticProps` / ISR | Same as client-side hydration |

## Flash of Unstyled/Unswapped Content

With pure client-side personalization, users briefly see the baseline before NT swaps in the variant. For demos, this is usually acceptable. For production:
1. Use SSR preflight (cookie-based profile ID)
2. Or ensure variants are visually close to baseline (reduce flash impact)

## Live Preview + NT Interaction

```
Contentful Live Preview SDK sends field updates via postMessage
  → useLiveUpdates() receives and merges update
  → Component re-renders with new data
  → NT Experience component re-evaluates with new ntExperiencesCollection data
  → Correct variant still shows
```

No special handling needed — the two systems compose naturally as long as raw data flows through `useLiveUpdates()` before NT reads it.
