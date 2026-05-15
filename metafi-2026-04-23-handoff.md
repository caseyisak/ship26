# Session Handoff — 2026-04-23

## What was completed this session

### Branch: `feat/plp-collections` → PR #87

**ProductListing block (M1–M5 + fixes):**
- Contentful CT `productListing` created and published
- GraphQL query, types, component, preview route, block renderer registration all done
- Race condition fixed, loading skeleton added, self-fetch pattern documented (LL-027)
- Visual QA passed on `/preview/product-listing/2Dk9Jx6REC9YKDVZi7h1HP`

**DynamicListing enhancements (added this session):**
- `calloutCards` field added to `dynamicListing` CT in Contentful master (published)
- `calloutCardsCollection` added to GraphQL query, types, and component
- Scroll variant replaced with shadcn `Carousel` (prev/next arrows, `align: start`)
- Callout cards interleaved every 3rd product in both grid and carousel paths
- Bug fixed: `calloutCardsCollection` was stripped in `transformSection` in `page-content-live.tsx` — one line fix at line 334
- QA confirmed: carousel renders, callout at slide 3 (off-screen initially, visible after 2 Next clicks), grid renders. All pass.

**Contentful entries created for verification:**
- `Dynamic Listing — Desk Accessories (Grid)` — entry `7MnGQEoOVbJqrMLt43TX6w`
- `Dynamic Listing — Desk Accessories (Scroll)` — entry `eFjtBS4RktRupQdMir1kP`
- Both added to `product-showcase` page, 2 callout cards linked on scroll entry

**PR #87 status:** Open, `feat/plp-collections` → `main`. Not yet pushed with latest commits — push before merging.

---

## Card work — branch `feat-card-media-size`

Existing branch has card media size fixes in progress. The following changes are needed on top of that, applying to ALL card surfaces (not just DynamicListing):

| # | Change | Type |
|---|--------|------|
| 1 | Fix callout card sizing — must match carousel product card height/width | CSS/component |
| 2 | Color variant — new CT field (dropdown) on `card` | CT + component |
| 3 | Media size fields not wiring to image dimensions | Code bug fix |
| 4 | Optional link: URL (Symbol) + Page reference (Link), ref takes precedence | CT (2 fields) + component |
| 5 | Optional button: text field + button color variant dropdown | CT (2 fields) + component |

Card CT field additions are all optional/additive — no breakage risk to existing cards.
The shared `card` component should be updated (not just the local `CalloutCard` in `dynamic-listing.tsx`) so all surfaces benefit.

---

## Spin-team conventions updated this session

Key updates to `~/.claude/skills/spin-team/SKILL.md`:
- **Agent panes**: always create a visible tmux pane — do NOT use `Agent(run_in_background: true)`. Split from the rightmost pane, name it `[persona] - [project] - [job]`, set color, start `claude --dangerously-skip-permissions`, **wait ~5s** before sending task or it won't submit.
- **Layout**: ORCH = full-height left (~80 cols), agents = stacked grid right, servers = separate tmux window
- **Colors**: ORCH=orange(`colour214`), Dev=blue(`colour33`), QA=cyan(`colour43`), Server=gray(`colour244`), PR=purple(`colour129`), Research=red(`colour196`)
- **Reuse idle panes** before creating new ones; kill panes when agent completes
- **Dev server**: teammate responsibility — check `package.json`, pick port, kill existing process first. ORCH never runs `bun run dev`.
- **Agent startup**: every agent runs `/prime` first before its task
- **Port convention**: no hardcoded port — agent determines from project

---

## Commands to close this session

```bash
# Kill all agent panes except ORCH
tmux kill-pane -t metafi:1.1
tmux kill-pane -t metafi:1.2

# Kill servers window
tmux kill-window -t metafi:servers

# Or nuke the whole agents window and start fresh next time
# tmux kill-window -t metafi:1
```

Push the branch before closing:
```bash
git push origin feat/plp-collections
```

---

## For the new chat

Open pointed at the card worktree:
```
claude /Users/casey.lisak/Dev/metafi-worktrees/feat-card-media-size
```

Feed it this file + the 5 card changes above. Run `/prime` first to orient.
