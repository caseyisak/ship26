# Contentful Migrations

Schema-as-code for all Contentful content type changes in this project.

## Why This Exists

Before 2026-05-12, all content types were created via Contentful MCP or the UI with no version history. Starting now, every schema change requires a migration script so changes are:
- **Tracked** — visible in git history with a why-comment
- **Reproducible** — can be run against any new environment
- **Rollback-safe** — reverse migrations are new scripts, not edits to history

## File Naming

```
NNN-[kebab-case-description].js
001-baseline-snapshot.js      # No-op — marks start of migration history
002-add-form-block.js         # Adding a new CT
003-hero-add-eyebrow-field.js # Adding field to existing CT
004-rename-headline-to-rt.js  # Breaking field change
```

Always increment. Never edit existing scripts after they've been committed.

## Running Migrations

```bash
# Prerequisites
bun add -d contentful-cli contentful-migration

# Dry run first (ALWAYS)
bunx contentful space migration \
  --space-id uumzxfocy3ef \
  --environment-id master \
  --management-token $CONTENTFUL_MANAGEMENT_ACCESS_TOKEN \
  migrations/NNN-description.js \
  --dry-run

# Run for real
bunx contentful space migration \
  --space-id uumzxfocy3ef \
  --environment-id master \
  --management-token $CONTENTFUL_MANAGEMENT_ACCESS_TOKEN \
  --yes \
  migrations/NNN-description.js
```

The CMA token is stored as `CONTENTFUL_CMA_KEY` in `~/.claude/.env`.

## Script Template

```javascript
// migrations/NNN-[description].js
// [Date] — [What and why]
// Fields: [list of affected fields]
// Reason: [business/technical reason]

module.exports = function(migration) {
  // Your migration code here
};
```

## Full Reference

See `.claude/commands/skills/contentful-migration/SKILL.md` for:
- All field types and validations
- Common patterns (create CT, add field, rename field, transform entries)
- Error handling
- CI/CD integration
