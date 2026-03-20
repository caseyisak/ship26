# Tasks archive

Completed work is moved here from [TASKS.md](../TASKS.md) so the main task file stays focused on active and upcoming work. Use this file to see outcomes, metrics, and links to lessons learned.

---

## Entry format

When archiving, use this structure per task (or milestone):

```markdown
### YYYY-MM-DD — Task or milestone name

- **Outcome:** ✅ Success | ⚠️ Success with learnings | ❌ Failure
- **Done:** list of completed subtasks
- **Incomplete (if any):** list of skipped or deferred items
- **Metrics (optional):** iterations, errors encountered, time
- **Lessons:** link to [lessons-learned](../documentation/lessons-learned.md) ID(s) if applicable (e.g. LL-001)
- **Notes:** contextual details (branch, env, follow-ups)
```

---

## Archived entries

*(Entries appear below, newest first. Move completed sections from TASKS.md here using the format above.)*

---

### 2026-03-19 — All Contentful blocks + Demo workflow setup

- **Outcome:** ✅ Success
- **Done:**
  - All 6 blocks committed to `main`: Hero, FAQ, TabbedContent, Features, DataViz, Blog
  - Hero: section style editor, custom grid drag/resize, live preview, ID-based preview route
  - FAQ: Contentful-driven accordion, live preview
  - TabbedContent: Contentful-driven tabs, live preview
  - Features: animation registry (checkout, recurring-billing, invoicing, payment-link), live preview
  - DataViz: 5 chart types (groupedBar, treemap, bubble, radar, funnel), CSV upload, interactive legend, live preview
  - Blog: shadcnblocks blogpost6 layout, rich text rendering, sticky TOC, live preview route at `/preview/blog-post/[entryId]`
  - Git worktree helper (`scripts/worktree-add.sh`) and parent dir at `/Users/casey.lisak/Dev/metafi-worktrees/`
  - Demo system architecture documented in TASKS.md and memory
  - All stale feature branches deleted; 7 branches remain (main, feat/skill-creator, demo/bears + 4 bears/*)
- **Lessons:** LL-001–LL-008 in `documentation/lessons-learned.md`
- **Notes:** Contentful space `uumzxfocy3ef`, env `master`. Blog posts: 6 published entries. DataViz sample entry: `7vaivmIvB8A7rxHuXSklRQ`.

---

### 2026-02-05 — Milestones 0–4: BlockRenderer + Live Preview foundation

- **Outcome:** ✅ Success
- **Done:** Vitest setup, BlockRenderer plumbing, Hero component, draft mode, Contentful GraphQL client, live preview SDK integration, enable-draft API, section style editor, custom grid layout, ENTRY_SAVED postMessage listener for section reference changes
- **Lessons:** LL-001 (GraphQL typename case), LL-002 (Turbopack manifest bug), LL-003 (mixed content HTTPS), LL-004 (Hero field is `media` not `image`), LL-005 (JSON field must be Object not string), LL-006 (ENTRY_SAVED SDK callback only fires for tagged entries), LL-007 (cookie SameSite in iframe), LL-008 (check both `image` and `media` in feature items)
- **Notes:** Section style editor requires `bun run dev:https` for Contentful iframe (mixed content)
