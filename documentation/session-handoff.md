# Session Handoff — 2026-04-01

## What was done this session

All bears bug fixes merged to `main` via PR #15. Settings, login modal, banner previews, and social post multi-channel preview built and shipped. `main` is clean and demo-ready.

**Closed:** #9 (Settings CT + login modal + NT identify), #10 (ntRules), #11 (preview token), #12 (query minification), #13 (cancelled), #14 (pivoted to BlogPostsSection)

---

## Current sandbox state

| Thing | Status |
|-------|--------|
| `main` branch | Clean — all fixes shipped, server running on localhost:3000 |
| Contentful master env | Settings CT + entry (Metafi defaults), Banner CT (variant/sectionStyle/contentType), Hero CT (sectionStyleUpdatedAt), socialPost CT (channels multi-select) |
| Settings entry `2cgyEdELIF1EbwlLLdSZgR` | Published — Metafi theme defaults in `theme` JSON, demo user in `loggedInMetadata` |
| Login modal | Working — triggers `ninetailed.identify({ isLoggedIn: true, ...loggedInMetadata })` |
| Banner preview | `/preview/banner/[entryId]` = web bare; `?view=mobile` = phone frame |
| Social post preview | `/preview/social-post/[entryId]` — stacked cards per selected channel |
| BlogPostsSection | New CT + block — drop on any page, renders blog post card grid |

---

## Open issues — ordered by priority for Punchbowl News demo

---

### #6 — Contentful-driven color injection *(partial — foundation done)*
**Status:** `settings.theme` JSON field exists. `layout.tsx` reads it and injects `<style>:root { ... }`. **Gap:** components still use hardcoded oklch vars; need to confirm the injected vars actually override them end-to-end.
- **Next step:** Create a Punchbowl settings entry with brand colors in `theme`. Check `var(--primary)` picks up the injected values. If not, update component CSS var references to match injected key names.
- **Files:** `src/services/contentful/settings.ts` (`themeToStyle()`), `src/app/layout.tsx`
- **Relates to:** #8 — once injection is confirmed working, remove the `[data-theme]` CSS blocks

---

### #8 — Remove hardcoded `[data-theme]` CSS blocks *(depends on #6)*
Once #6 is confirmed end-to-end:
1. Delete all `[data-theme='bears']`, `[data-theme='punchbowl']` etc. blocks from `globals.css`
2. Remove `data-theme={process.env.NEXT_PUBLIC_BRAND}` from `layout.tsx` and all page wrappers
3. Remove `NEXT_PUBLIC_BRAND` from `.env`, `branch.env` files, and CLAUDE.md
4. Update memory notes re: theme system
- **File:** `src/app/globals.css`, `src/app/layout.tsx`

---

### #2 — Section style app: per-content-type panel visibility
The editor (`/contentful-app`) shows all panels (Layout, Content Style, Button Style, Background) to every entry. They should be scoped by content type.
- **Approach:** Read `sdk.entry.getSys().contentType.sys.id` in the app, map to a config that defines visible panels. No new API calls needed.
- **Config:** `hero` → Layout + Background; `banner` → Content Style + Button Style + Background; others → all panels
- **File:** `src/contentful-app/section-style-editor.tsx` — add `CONTENT_TYPE_PANELS` map at top, gate each `<Collapsible>` block on it

---

### #7 — Nav and footer content types + CMS-driven navigation
Editors can't change nav links without a code deploy. Need three new CTs:
- `navLink` — label (Symbol), url (Symbol), page (Reference → page, optional)
- `nav` — internalName, logo (Asset, overrides settings siteIcon), links (Array → navLink)
- `footer` — internalName, tagline (Symbol), logo (Asset), links (Array → navLink)

Nav component fetches active `nav` entry, falls back to current hardcoded `ITEMS` array if none exists.
- **File:** `src/components/layout/navbar.tsx`

---

### #4 — Rename `features`/`featureItem` CT IDs to `cardsWrapper`/`card`
Bears display names were changed but underlying IDs weren't (Contentful can't rename IDs in-place).
1. Create new CTs `cardsWrapper` + `card` (copy fields from `features`/`featureItem`)
2. Migrate all existing entries via CMA script
3. Update Page entries that reference `features` in `sections`
4. Delete old `features` + `featureItem` CTs
5. Code: rename `src/cms-components/features/` → `cards-wrapper/`, update types/queries/mappers/block config
- **Risk:** Medium — do in a dedicated branch with a migration script. Don't merge until all entries are migrated.

---

### #5 — newsWrapper content type + dynamic news feed block
A section that shows a pinned + dynamic feed of blog posts (newsArticle = blogPost, same schema).
- **CT fields:** internalName, label, title, description, filterCategory (Symbol enum), sortOrder (Symbol enum: newest_first/oldest_first), maxItems (Integer 1–24), priorityItems (Array → blogPost), ntExperiencesCollection
- **Service logic:** fetch pinned by ID + dynamic by category/order, dedup, slice to maxItems
- **Pattern to follow:** `src/cms-components/features/features.tsx`, `FEATURES_FIELDS` in `queries.ts`

---

### #3 — Process: syncing infra commits from main to active demo branches
No formal process exists. When infra commits (CT changes, query updates, layout changes) land on `main`, active demo branches silently fall behind and hit conflicts.
- **Minimal fix:** Add to `CLAUDE.md`: "Before starting any demo milestone, run `git log HEAD..main --oneline` to check for infra commits to merge in"
- **Better fix:** Tag infra PRs with a label; after merge, add a note to active branch task lists

---

## For Punchbowl News — what to do first

```bash
# 1. Create the worktree
bash scripts/worktree-add.sh demo/punchbowl

# 2. Open a new CC instance in it
claude /Users/casey.lisak/Dev/metafi-worktrees/demo-punchbowl
```

Then in the new session:
1. Create `punchbowl` Contentful environment (clone from master)
2. Set `branch.env` → `CONTENTFUL_ENVIRONMENT=punchbowl`
3. Create a `settings` entry with Punchbowl brand colors in `theme` JSON — this tests #6
4. Upload Punchbowl logo to `siteIcon` — navbar picks it up automatically
5. Update `loggedInMetadata` with a Punchbowl-appropriate user persona for NT demo
6. Run `bun run dev` — the site should adopt Punchbowl colors from Contentful with no code changes

**Issues safe to skip for first Punchbowl demo:** #4 (cardsWrapper rename), #5 (newsWrapper), #7 (CMS nav), #8 (remove data-theme — wait until #6 is fully validated)
