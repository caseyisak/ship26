# Handoff — ProductListing Block + 3P Integration Wiring

**Date:** 2026-05-12  
**Branch context:** PR #87 (`feat/plp-collections`) + future `feat/plp-integration`  
**Previous session:** Skills upgrade (feat/skills-upgrade), Ghirardelli demo planning  
**Picking up in:** `feat-plp-collections` worktree for QA + merge, then new worktree for 3P wiring

---

## Why This Exists

Paused a Ghirardelli demo build to first get the ProductListing block merged into the sandbox. The demo needs a dynamic product listing page (like `ghirardelli.com/chocolate/all-chocolate`) that works with the Integration Simulator's collection picker. That story requires two things that aren't done yet:

1. **PR #87 merged** — the ProductListing block itself
2. **3P wiring** — connecting the Integration Simulator's collection picker to the ProductListing adapter so the category selection drives what products render

---

## What's Already Built (PR #87, `feat-plp-collections` worktree)

The agent research found everything is **complete and ready to merge**. No new code needed for the base block.

### Component
- **Path:** `src/cms-components/product-listing/product-listing.tsx` (443 lines)
- Full sidebar filters: category, price (5 buckets), in-stock toggle, tag checkboxes
- Callout card interleaving (injects after every `columns` products)
- `useLiveUpdates()` + inspector mode on editable fields
- Loading skeleton while self-fetching
- Self-fetch pattern: if no `productCatalog` prop, calls `contentfulCatalogAdapter.getProducts()` on mount

### Data / GraphQL
- `PRODUCT_LISTING_PAGE_FIELDS` fragment in `queries.ts` (lines 923–937)
- `PRODUCT_LISTING_BY_ID` query in `queries.ts` (lines 1606–1614)
- Fragment included in `PAGE_BY_SLUG` at line 975
- `ProductListingFragment` TypeScript type in `block-renderer/types.ts` (lines 582–591)

### Contentful CT
- API ID: `ProductListing`
- Fields: `internalName` (Symbol), `titleRt` (RichText), `collection` (Symbol — category ID), `columns` (Integer), `calloutCardsCollection` (Array → Card)
- Created and published in master env (via MCP — no migration script exists for it)

### Infrastructure
- Block renderer registered in `block-renderer/configs/index.ts` (lines 188–216)
- Preview route: `/preview/product-listing/[entryId]`
- Enable-draft registered at `src/app/api/enable-draft/route.ts` lines 45 + 87
- Transform case in `page-content-live.tsx` lines 337–346

### Bugs Fixed (last two commits)
- Race condition in self-fetch useEffect (added `cancelled` cleanup flag)
- Loading skeleton state
- `calloutCardsCollection` was stripped in `transformSection` — now forwarded correctly

### Sample Entry
- Entry ID: `2Dk9Jx6REC9YKDVZi7h1HP` (in Contentful master env)
- Preview URL: `/preview/product-listing/2Dk9Jx6REC9YKDVZi7h1HP`

---

## The 3P Integration Gap (after PR #87 merges)

The block currently uses a **mock catalog** fed through `src/lib/integration-adapters/contentful-catalog.ts`. The adapter calls `/api/catalog` and returns `ProductRecord[]` with a clean interface (sku, name, price, salePrice, inStock, category, tags, images).

**What's missing:** the Integration Simulator's collection picker (GH #101 — already merged to main) needs to feed collection/category IDs into the ProductListing component so that:

> SE opens Integration Simulator → picks "Dark Chocolate" category → ProductListing page re-renders with those SKUs

This is new work. The architecture is already compatible:
- The `collection` field on the CT accepts a Symbol (category name/ID)
- The adapter already filters by category
- Integration Simulator already has multi-select collection picker UI

The wiring needed:
1. The Integration Simulator's selected collection needs to publish/expose a category ID
2. The ProductListing `collection` field (or a new field) reads that category ID
3. OR: the Integration Simulator entry is linked to the ProductListing entry via a reference field and the component reads from it

This should be planned before coding — the approach (field linking vs shared context vs API route) hasn't been decided yet.

---

## Immediate Next Steps (fresh session in `feat-plp-collections`)

Read first: `PLAN.md`, `FINDINGS.md`, `metafi-2026-04-23-handoff.md` in the worktree root.

**This session is QA + merge only — no new code.**

1. Start dev server: `bun run dev`
2. Smoke test: navigate to `/preview/product-listing/2Dk9Jx6REC9YKDVZi7h1HP?preview=true`
   - Confirm grid renders with products
   - Test category, price, stock, tag filters
   - Confirm callout cards appear
   - Check browser console for errors
3. Run tests: `bun test` (expect 39 pass, same as before)
4. Run type check: `bunx tsc --noEmit`
5. Run lint: `bun run lint`
6. Push the branch: `git push origin feat/plp-collections`
7. Update PR #87 if it needs description updates, then mark ready for review
8. Merge (squash): `feat(product-listing): add ProductListing block — dynamic grid with sidebar filters, callout card interleaving, and 3P catalog adapter; resolves #87`
9. After merge: archive `metafi-2026-04-23-handoff.md` to `documentation/archive/`

---

## After PR #87 Merges — Phase 2 Work

Open a new worktree: `bash scripts/worktree-add.sh feat/plp-integration`

**Goal:** Wire Integration Simulator collection picker → ProductListing adapter

**Questions to answer before writing any code:**
- How does the Integration Simulator expose the selected collection to the Next.js app? (postMessage? shared Contentful field? API route?)
- Does the ProductListing `collection` field get updated by the SE mid-demo (live, no publish) or is it pre-configured per page?
- For the Ghirardelli demo: are the product SKUs coming from a mock Shopify catalog seeded for the demo, or a real connected API?

**Likely approach** (hypothesis — needs research):
- Add a `collectionRef` Link field on `ProductListing` CT pointing to an `IntegrationConfig` entry
- `IntegrationConfig` entry holds the selected collection ID (updated by Integration Simulator Contentful app)
- ProductListing reads `collectionRef.collectionId` on mount and filters catalog accordingly
- This makes it a "live" demo: SE changes collection in the Contentful app → `collectionRef` updates → ProductListing re-fetches with new category

---

## Ghirardelli Demo Status

**Paused** until ProductListing is in main. When ready:

- Env: `ghirardelli-2026-05` (not created yet)
- Needs: master env alias (issue #96) or new env created + API key scoped
- Loops planned: Personalization, Omnichannel, Content Ops, **Dynamic Product Listing** (Loop 4 — blocked until phase 2 above)
- Loop 4 specifically: collection picker demo with Ghirardelli chocolate categories (Dark, Milk, Seasonal & Gifts)
- PR #87 and 3P wiring are both prerequisites for Loop 4

---

## Skills Upgrade Context

A large skills upgrade was completed this session in `feat/skills-upgrade` worktree. Not yet merged to main. Contains:
- 5 new skills: `add-contentful-block`, `contentful-personalization`, `contentful-migration`, `contentful-guide`, `contentful-graphql-nextjs`
- `allowed-tools` on all 16 project skills
- `AGENTS.md` role definitions
- `migrations/README.md` bootstrapping migrations

That PR should be reviewed and merged separately — unrelated to the PLP work but relevant to the Ghirardelli demo setup.

---

## Key Files Quick Reference

| File | Purpose |
|------|---------|
| `feat-plp-collections/src/cms-components/product-listing/product-listing.tsx` | Main component |
| `feat-plp-collections/src/services/contentful/product-listing.ts` | `getProductListingById()` service |
| `feat-plp-collections/src/services/contentful/queries.ts` lines 923–937, 1606 | GraphQL fragment + query |
| `feat-plp-collections/src/lib/integration-adapters/contentful-catalog.ts` | Catalog adapter (mock → real) |
| `feat-plp-collections/PLAN.md` | Original spec |
| `feat-plp-collections/FINDINGS.md` | Research baseline |
| `feat-plp-collections/metafi-2026-04-23-handoff.md` | Prior session handoff |
| `src/app/contentful-app/integration-sim/` | Integration Simulator app (on main) |

---

## Open Questions for Next Session

1. Is `bun test` currently passing in the worktree (39 tests)? The research said no breaking changes but it wasn't verified.
2. Is the branch tip pushed? The handoff doc noted it might not be.
3. Does the Contentful CT `ProductListing` exist in master env right now, or does it need to be recreated? (No migration script = can't verify easily)
4. For 3P wiring: which integration approach — field linking, shared context, or API route?
