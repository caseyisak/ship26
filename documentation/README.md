# Documentation Index

This folder holds project documentation. Agents and developers should use this index to navigate, update, and archive docs.

---

## Quick Reference

| Doc | Purpose | When to Read |
|-----|---------|--------------|
| [CODEBASE-ARCHITECTURE.md](CODEBASE-ARCHITECTURE.md) | Project structure, tech stack, routes | Before major changes or onboarding |
| [COMPONENT-REFERENCE.md](COMPONENT-REFERENCE.md) | Layout and section components | When adding or modifying UI |
| [DEVELOPMENT-GUIDE.md](DEVELOPMENT-GUIDE.md) | Adding pages, sections, blog posts | When creating new features |
| [component-live-preview.md](component-live-preview.md) | ID-based preview for Contentful blocks | When adding a new block with live preview |
| [content-model-proposal.md](content-model-proposal.md) | Content types, field design | When proposing or creating Contentful models |
| *(this file: Field conventions)* | Rich Text vs Short Text; fix strategy | When defining or fixing Contentful field types |
| [contentful-personalization-reference.md](contentful-personalization-reference.md) | Ninetailed / ntExperiences | When wiring personalization |
| [lessons-learned.md](lessons-learned.md) | Error patterns, root causes, fixes | **Before** implementation; **after** debugging |
| [migration-plan.md](migration-plan.md) | Contentful migration plan | For migration context |
| [colorful-demo-analysis.md](colorful-demo-analysis.md) | Comparison with colorful-demo-2.0 | Reference only |

---

## Contentful field conventions

When defining or updating Contentful content types, use these field-type rules so the content model stays consistent and fixable.

### Rich Text vs Short Text vs Long Text

- **Rich Text:** Use for user-facing content that may need formatting or embedded entries: headlines, subheadlines, body copy, excerpts, descriptions that render on the front end.
- **Short Text (Symbol):** Use for internal names, slugs, identifiers, labels, short UI strings (e.g. button label, nav label), categories, and tags.
- **Long Text:** Avoid. For identifiers use Short Text; for content use Rich Text (Long Text has no structure or embedded entries). Use Long Text only if there is an explicit, documented exception.

### Content-Type-Field-Fix strategy (correcting existing types)

Contentful does not allow changing a field's type after creation. To fix existing content types that use the wrong type (e.g. Long Text where Rich Text is required):

1. Use a separate Contentful environment (e.g. "Content-Type-Field-Fix") where you create the content types with the **correct** field types (e.g. Rich Text instead of Long Text).
2. Use the **merge CLI** to merge that environment back into master so the corrected content model is applied without deleting or recreating fields in place.

### When adding new content types

Define fields as Rich Text or Short Text from the start per the rules above so you don't need the fix environment for new types. Reference [content-model-proposal.md](content-model-proposal.md) for field design and conventions.

---

## For Agents: How to Use These Docs

### Before Starting a Task

1. **Read** [lessons-learned.md](lessons-learned.md) — Scan the index for patterns matching your task (e.g. Contentful, preview, block renderer).
2. **Check** [archive/tasks-archive.md](../archive/tasks-archive.md) — Look for similar past tasks and outcomes.
3. **Reference** the doc that matches your task (see table above).

### When Adding a Contentful Block

1. Follow `.cursor/agents/add-contentful-block.md`.
2. Read [component-live-preview.md](component-live-preview.md) for preview setup.
3. Read [content-model-proposal.md](content-model-proposal.md) for field conventions.
4. Read [lessons-learned.md](lessons-learned.md) — especially LL-001 through LL-009.

### When Debugging

1. **First** check [lessons-learned.md](lessons-learned.md) index for matching error pattern.
2. If it's a Contentful/preview issue, also read `.cursor/rules/contentful-live-preview-debug.mdc` context.

---

## Keeping Docs Up to Date

### When to Update

| Event | Action |
|-------|--------|
| New block added | Update COMPONENT-REFERENCE if it documents cms-components; add to main README block list if needed. |
| New error pattern fixed | Add to lessons-learned.md (index + full lesson). Use `.cursor/skills/continuous-improvement` protocol. |
| Architecture change | Update CODEBASE-ARCHITECTURE.md. |
| New content type | Update content-model-proposal.md or add a note if it diverges. |
| New dev pattern | Add to DEVELOPMENT-GUIDE.md. |

### Priority Rule

**Code is the source of truth.** If a doc conflicts with the code, fix the doc. Priority order: `src/` > migration-plan > content-model-proposal > other docs.

---

## Archiving Past Docs

### When to Archive

- A doc describes an **outdated** approach (e.g. Pages Router when project uses App Router).
- A doc is **superseded** by another (e.g. ISR-convo → migration-plan).
- A doc is **historical** and could mislead agents.

### How to Archive

1. Move the file to `documentation/archive/`.
2. Update [documentation/archive/README.md](archive/README.md) — Add a row to the "Archived Files" table with file name and reason.
3. Add a deprecation header at the top of the archived file:
   ```markdown
   > **Archived.** This doc is outdated. See [current-doc.md](../current-doc.md) for current approach.
   ```
4. Remove or update any links in other docs that pointed to the archived file.

### What Stays in Archive

- Superseded architecture decisions
- Old conversation logs or analysis that's no longer relevant
- Docs that conflict with current implementation

**Do not archive:** lessons-learned entries (they stay in lessons-learned.md; old lessons remain for reference).

---

## Folder Structure

```
documentation/
├── README.md                    ← You are here (index + agent guide)
├── CODEBASE-ARCHITECTURE.md
├── COMPONENT-REFERENCE.md
├── DEVELOPMENT-GUIDE.md
├── component-live-preview.md
├── content-model-proposal.md
├── contentful-personalization-reference.md
├── lessons-learned.md
├── migration-plan.md
├── colorful-demo-analysis.md
└── archive/                     ← Archived docs (outdated/superseded)
    ├── README.md                ← Explains why files were archived
    ├── chatgpt-isr.md
    └── ISR-convo.md
```

**Note:** Task archives live at project root `archive/tasks-archive.md`, not here. `documentation/archive/` is for outdated documentation only.

---

## Integration with Continuous Improvement

The `.cursor/skills/continuous-improvement` skill runs at the end of each milestone. It:

- Archives completed tasks to `archive/tasks-archive.md`
- Adds new error patterns to `lessons-learned.md`
- Cleans `TASKS.md`

When that skill runs, it may update `lessons-learned.md`. No separate documentation update is needed for lesson capture — the skill handles it.
