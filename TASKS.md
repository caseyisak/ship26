# Current State & Roadmap

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
| `feat/skill-creator` | Claude skills development | Other CC |
| `demo/bears` + `bears/*` | Bears customer demo | Archived after demo |

---

_Completed work → [archive/tasks-archive.md](archive/tasks-archive.md)_
_Error patterns → [documentation/lessons-learned.md](documentation/lessons-learned.md)_
