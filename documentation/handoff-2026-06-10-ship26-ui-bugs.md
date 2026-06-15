# Session Handoff: SHIP '26 — UI Bug Pass

**Date:** 2026-06-10
**Branch:** `feat/stitch-search`
**Worktree:** `/Users/casey.lisak/Dev/metafi-worktrees/demo-ship26`
**Contentful env:** `ship-vercel`
**GH Issue:** caseyisak/metafi#112
**Demo-OS source:** `/Users/casey.lisak/Dev/demo-os/demos/ship-vercel/`

---

## What was done this session

### Infrastructure fixes
- **`/products?preview=true` 404** — webpack `ignored` pattern `**/metafi-worktrees/**` blocked HMR in worktrees + stale `.next` cache. Removed pattern, cleared cache. (LL-047)
- **NT experiences loading as 0 on client** — same stale cache root cause. After restart: 14 experiences load correctly.

### NT personalization fixes
- **FAQ variant swap not working** — `activateAudience()` alone doesn't trigger SDK variant selection. Added `setExperienceVariant()` call in `LocalAudienceEvaluator`. (LL-048)
- **FAQ variant items missing** — `itemsCollection` can't be in global experiences query (Contentful complexity limit). Created `/api/faq/[entryId]` route for client-side variant fetch with module-level cache. (LL-049)
- **PLP callout card** — user fixed in Contentful (Card entry wasn't wired to NT experience)

### Merge tag abstraction
- Created `src/lib/rich-text-merge-tags.tsx` — shared `useMergeTagRenderOptions()` hook
- Resolution handles: direct dot-paths, `traits.` prefix, camelCase→snake_case fallback (LL-050)
- Applied to 7 components: Banner, FAQ, Hero, TwoAcross, CtaSection, CardsWrapper, TabbedContent
- Removed hardcoded rich text fallbacks from FAQ and TabbedContent

### FAQ UX overhaul
- Badges moved from answer body to question row
- Chevron replaces +/- icons (rotates on toggle)
- Default open state (all items expanded)
- CSS grid animation (`grid-rows-[1fr]/[0fr]`) replaces JS height calc (LL-051)

### Docs
- LL-047–051 written and pushed to both metafi and demo-os repos
- `CLAUDE.md` max updated to LL-051

---

## What's open — UI bugs for next session

These are known issues that need visual QA and fixing. Start with the PDP, then PLP, then homepage.

### P0 — must fix before demo

1. **FAQ answer text may still clip on variant swap** — the CSS grid animation works on initial render but hasn't been tested after a persona swap triggers the variant fetch. Toggle close→open might still be needed. Test: login as Jordan on PDP, check all 6 answers are fully visible without toggling.

2. **SearchPanel (right drawer) not visually tested** — `SearchBar.tsx` has a +284/-128 diff from the session. It compiles and the component exists but no one has opened it in a browser. Test: click search icon in navbar, type "lamp for my living room", verify AI suggestion row + product cards.

3. **Profile Previewer session traits don't populate** — session/customer split UI exists but behavioral signals (search queries, pages viewed) aren't captured from browsing. The Profile Previewer shows empty session traits.

4. **Contentful live preview iframe** — not tested this session (needs Contentful login). Open `https://app.contentful.com/spaces/uumzxfocy3ef/entries/2Dk9Jx6REC9YKDVZi7h1HP/preview/032ljj9cIpYzufyGbjFOiW` and verify the iframe renders the PLP at localhost:3000.

5. **Homepage not tested** — no visual QA on the homepage this session. Check `/page/home?preview=true`.

### P1 — should fix

6. **ContentMatchReveal wiring** — triggers on sidebar filter selection, not on SearchPanel chat navigation. Automatic reveal after chat navigation would make the demo flow smoother.

7. **Integration Simulator 3P app badge** — commerce platform badge name + color not configured in Contentful. Quick UI config.

8. **Merge tag fallbacks** — the merge tag `firstName` has `ntFallback: null`. If the user is anonymous (no `first_name` trait), the FAQ title would render "FAQs for " (with trailing space). Add a fallback value in Contentful or handle null gracefully in the component.

9. **Banner merge tag resolution** — Banner's `resolveNtMergeTagId` was replaced with the shared hook but the Banner also uses `resolveMergeTagsInDoc()` (template-style `{{first_name}}` merge tags in text nodes). Verify both paths still work.

### P2 — polish

10. **FAQ badge wrapping** — on narrow viewports, the badge might wrap below the question text instead of staying inline. Check responsive behavior.

11. **No console errors** — verify 0 errors on PDP, PLP, and homepage in dev console.

12. **Demo script alignment** — `DEMO_SCRIPT.md` in demo-os references "typewriter animation" and specific timing that may not match current implementation. Update if needed.

---

## Files to read first

| Priority | File | Why |
|----------|------|-----|
| 1 | This handoff doc | Current state + what's open |
| 2 | `src/cms-components/faq/faq.tsx` | FAQ component — just rewritten, may need tweaks |
| 3 | `src/lib/rich-text-merge-tags.tsx` | Shared merge tag hook — new this session |
| 4 | `src/personalization/local-audience-evaluator.tsx` | NT variant forcing — new pattern |
| 5 | `src/components/sections/SearchBar.tsx` | Search panel — untested visually |
| 6 | `documentation/lessons-learned/index.md` | LL-047–051 for context |

---

## Key entry IDs (unchanged from session handoff)

| Entry | ID |
|-------|----|
| PDP: Arc 900 | `2XX3huwQrJb9NPDvtgXvMx` |
| FAQ baseline | `eA9qFt3hjNM0efahDjE4N` |
| FAQ Jordan | `4d01S0aoVHFBE7zmrTTHXw` |
| FAQ Amber | `3jSfJQ5fvKKzFmAKgFsBgM` |
| Governance | `1tXDfQ4Spr4BlyFM0BY8j8` |
| NT: Jordan | `3ExwxjXXhbjWpQguGyvR7N` |
| NT: Amber | `6MtN6OUgqEDmQmr1Qx7tyt` |
| Settings | `2cgyEdELIF1EbwlLLdSZgR` |
| PLP | `2Dk9Jx6REC9YKDVZi7h1HP` |

---

## Dev server

```bash
cd /Users/casey.lisak/Dev/metafi-worktrees/demo-ship26
rm -rf .next && bun run dev --port 3000
```

Always clear `.next` on first start — the webpack ignore fix means HMR works now, but a stale cache from a previous session may still exist.
