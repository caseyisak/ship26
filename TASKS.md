# Current State & Roadmap

## 🔥 Active Initiative — GH Issue Blitz (agent team)

**Execution order:** D → A → B + C in parallel

| Stream | Issues | Branch | Status |
|--------|--------|--------|--------|
| D: Model cleanup (first — unblocks A) | #4 rename CTs, #42 FeatureItem fields | `feat/model-cleanup` | ⬜ |
| A: Marketing blocks | #56 CtaSection, #54 Pricing, #57 featureSection | `feat/marketing-blocks` | ⬜ blocked on D |
| B: Dashboard + Personas | #40 dashboard, #41 dashboardPage CT, #43 preview route, #39 persona system, #38 switcher | `feat/dashboard-personas` | 🟡 PR #68 open — needs Casey visual sign-off → merge |
| C: RT field migration | #52 audit + wire all CTs to RT fields | `feat/rt-migration` | ⬜ |

### Backlog — deferred (blocked or needs planning)

| Issue | Why deferred |
|-------|-------------|
| #49 Tilley personalization fix | Blocked — issue says "TBD details," nothing to fix yet |
| #51 Localization all fields | Risky mid-migration — run after #52 RT migration lands and CTs are stable |
| #8 Deprecate hardcoded themes | Blocked on #57 featureSection — new system not defined yet |
| #53 Visual form builder app | Big scope, separate Contentful app — needs planning session first |
| #48 3rd-party integration simulator | Needs design decisions (which integrations, data shape) before code starts |
| #5 newsWrapper CT + news feed | Standalone, not blocking current streams |
| #2 Style override app | Separate Contentful app, big scope, not blocking demos |

---

## 🟡 Pending — AIO / AEO / GEO Demo Loop

**Branch to create:** `feat/aio-aeo-geo-demo` (worktree off main)
**Spec + tasks:** `.claude/specs/001-aio-aeo-geo-demo/`
**Handoff doc:** `documentation/handoff-2026-03-30-bears-worktrees-agents-orientation.md`

Quick-start: `/piv prime` → read handoff doc → `bash scripts/worktree-add.sh feat/aio-aeo-geo-demo` → execute tasks

| Milestone | What | Status |
|-----------|------|--------|
| M1 | Create `aioAeoGeo` content type (Contentful MCP) | ⬜ |
| M2 | Add `aioAeoGeo` field to `faqitem` (Contentful MCP) | ⬜ |
| M3 | Seed 4 governance entries + 6 FAQ entries | ⬜ |
| M4 | GraphQL fragment + TypeScript types | ⬜ |
| M5 | `/demo/faq-aeo` page — Before/After split layout | ⬜ |
| M6 | FAQPage JSON-LD in `faq.tsx` (live-updating) | ⬜ |
| M7 | `AioAeoPreviewPanel` component | ⬜ |
| M8 | `demo-loops/` standard + `aio-aeo-geo/` bundle | ⬜ |

---

## Main branch — what's in it (as of 2026-03-19)

All blocks are committed to `main`. This is the source of truth.

| Block | Component | Status |
|-------|-----------|--------|
| Hero | cms-components/hero | ✅ done, section style editor, custom grid |
| FAQ | cms-components/faq | ✅ done |
| TabbedContent | cms-components/tabbed-content | ✅ done |
| Features | cms-components/features | ✅ done, animation registry |
| DataViz | cms-components/data-viz | ✅ done, 5 chart types, interactive legend |
| Blog | cms-components/blog-post | ✅ done, rich text, sticky TOC, live preview |

## Demo System (building)

**Philosophy:** `main` = clean sandbox with all blocks. Every customer demo = branch off main.

### Phases

**Phase 1 — Demo loop structure** (next)
- [ ] Create `demo-loops/` folder structure
- [ ] Extract Bears mobile app viewer as generic `multi-channel` demo loop
- [ ] Write `multi-channel/bundle.sh` seed script

**Phase 2 — Brand scraper**
- [ ] Firecrawl scrape → extract CSS design tokens (colors, fonts, spacing)
- [ ] Auto-generate `[data-theme='customer']` CSS block
- [ ] Store in `demo-loops/[loop]/theme/`

**Phase 3 — Asset bundles / component docs**
- [ ] Document every block (fields → Contentful mapping, setup steps)
- [ ] Contentful migration script per block (`contentful/content-types/`)
- [ ] Seed entries JSON per block
- [ ] One-command env setup: `scripts/demo-setup/[customer].sh`

**Phase 4 — Slides integration**
- [ ] DEMO_SCRIPT.md template per demo
- [ ] Link to contentful-pptx skill for auto-deck generation

**Phase 5 — Skill references cleanup**
- [ ] Extract heavy content from skill SKILL.md files into `references/` subdirectories
- [ ] Priority: `contentful-block-discovery` (225L, no refs) — extract Discovery Report Template + Common Patterns
- [ ] Audit: `contentful-block-graphql-types`, `contentful-block-component`, `contentful-mcp-create-model` for additional extraction
- [ ] `continuous-improvement` (97L) — evaluate if split is needed

---

## Active branches

| Branch | Purpose | CC instance |
|--------|---------|-------------|
| `main` | Sandbox, all blocks, source of truth | This CC |
| `feat/dashboard-personas` | Stream B — 3-persona dashboard + NT personalization | Worktree — PR #68 open |
| `feat/skill-creator` | Claude skills development | Other CC |

---

_Completed work → [archive/tasks-archive.md](archive/tasks-archive.md)_
_Error patterns → [documentation/lessons-learned.md](documentation/lessons-learned.md)_
