# Session Capture — 2026-04-27

This doc captures everything researched and decided in this session so it isn't lost. It feeds directly into the newsletter fix spec and the Demo-OS project registry initiative.

---

## What we did today

### 1. Worktree cleanup
- Removed 14 merged feature worktrees + 4 agent worktrees + 1 orphaned directory
- Active worktrees remaining: `feat/plp-collections`, `demo/tilley`
- Stale branches still on remote (safe to delete via GitHub): `origin/bears/*`, `origin/cherry/*`, `origin/feat/dashboard-personas`, etc.
- **Open question:** `feat/card-media-size` (2 unmerged commits: card mediaSize + style/columns/colorVariant) and `fix/button-hover-states` (1 unmerged hover state commit) — user needs to decide: merge or drop

### 2. Sandbox versioning established
- Retroactively versioned the repo history into 5 eras (see below)
- **Current version: `sandbox/v4.0`**
- Rule saved to memory: auto-tag + update README changelog on every meaningful merge, no prompting needed
- Tag `sandbox/v4.0` still needs to be applied to current HEAD

### 3. Demo-OS architecture discussion
- `~/Dev/demo-os/` exists as a separate repo — currently markdown-only (se-charter, discovery-questions, proof-points, loop library)
- **Decision:** Demo-OS = program brain (why things exist, specs, loop library, project history). Metafi = execution output (code only, light docs)
- Until Demo-OS has tooling, project management lives here as a band-aid — but everything gets structured so it can migrate

### 4. Punchbowl revival strategy
- No `demo/punchbowl` branch exists on remote — was cleaned up
- `fix/post-punchbowl-generics` (still on remote) contains the promoted generic improvements from that demo
- **Revival approach:** Create fresh `demo/punchbowl-2026-04` off current main, point at existing Punchbowl Contentful env — content persists in Contentful, code gets latest sandbox improvements
- **Theming:** Now in `siteSettings` CT (JSON field → runtime CSS vars). Need to verify Punchbowl Contentful env has a siteSettings entry with brand tokens
- Punchbowl demo needed "later this week" (week of 2026-04-28)

### 5. Newsletter bug diagnosis
Three distinct bugs found, all in the same root cause (RT field migration):

**Bug A — promoSlot Banner/TwoAcross renders blank**
- Location: `newsletter-page.tsx` lines 459–496, 497–524
- Root cause: Component reads `promoSlot.headline`, `promoSlot.eyebrow`, `promoSlot.heading` (plain text). After RT migration, GraphQL only fetches `headlineRt { json }`, `eyebrowRt { json }`, `headingRt { json }`. Plain text fields are always null.

**Bug B — Hero/Banner embedded in RTE renders blank**
- Location: `newsletter-page.tsx` lines 78–155 (buildRichTextOptions embedded entry renderer)
- Root cause: Same as Bug A — `entry.headline`/`entry.subheadline` are null; need to read `entry.headlineRt.json`

**Bug C — TypeScript duplicate property**
- Location: `src/services/contentful/newsletter.ts` lines 23–35
- Root cause: `headlineRt` and `subheadlineRt` declared twice in `EmbeddedEntry` type (once under "Hero + Banner RT fields", again under "// Banner RT fields")
- Causes TypeScript compile error

**Design change — leadStory → promoSlot consolidation**
- User wants to remove `leadStory` as a separate concept
- `promoSlot` already accepts BlogPost, TwoAcross, Banner — just needs to render BlogPost in the "lead story" position (above content)
- Contentful CT change: remove `leadStory` field from Newsletter CT (or make it an alias pointing to promoSlot)

### 6. GitHub issues / project tracking gap
- No GitHub project exists tying issues to a project roadmap
- Issues have been created ad hoc; no consistent tracking from spec → issue → fix → test → ship
- Band-aid until Demo-OS: use GitHub issues + a spec in `.claude/specs/` + TASKS.md entry

---

## Sandbox version history

| Version | Era | Key PRs | What shipped |
|---------|-----|---------|-------------|
| v1.0 | Punchbowl era | PR #28 | Settings CT + theming, newsletter suite, TwoAcross, Banner, nav from Contentful |
| v2.0 | P0 promotions / WOW demo | PRs #58–63 | NT infrastructure, dashboard shell, animation components, all P0 blocks |
| v2.5 | RT migration + marketing blocks | PRs #65–67 | Full RT migration, Pricing, IconGrid, FeatureShowcase, MediaCardGrid |
| v3.0 | Personas + AIO sprint | PRs #68–78 | 3-persona dashboard, FeatureSection, newsWrapper, localization, form block |
| v4.0 | Integration simulator + catalog | PRs #79–82 | Integration simulator app, catalog CT, DAM picker, NT fixes |

**Tag to apply:** `git tag sandbox/v4.0 b95f1cf` (current HEAD)

---

## Open decisions (user needs to answer)

1. `feat/card-media-size` — merge or drop? (2 commits: card mediaSize field + style/columns/colorVariant)
2. `fix/button-hover-states` — merge or drop? (1 commit: hover states)
3. Full list of fixes for the agent team beyond newsletter bugs
4. Punchbowl timeline — demo is "this week" — when exactly? Affects worktree priority

---

## Next steps (ordered)

1. Sub-agent audit returns → reconcile TASKS.md + create GitHub issues
2. Write newsletter fix spec at `.claude/specs/003-newsletter-fixes/spec.md`
3. Tag `sandbox/v4.0`, add version + changelog to README
4. Spin up agent team via `/spin-team` to execute newsletter fixes
5. Create fresh Punchbowl worktree off updated main
6. Verify Punchbowl Contentful env has siteSettings entry with brand tokens

---

## Files to read first in the next session

- `TASKS.md` (updated with newsletter project)
- `.claude/specs/003-newsletter-fixes/spec.md` (the spec)
- `src/cms-components/newsletter/newsletter-page.tsx` (where the bugs are)
- `src/services/contentful/newsletter.ts` (types + GraphQL query)
- `documentation/session-capture-2026-04-27.md` (this doc)
