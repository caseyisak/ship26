---
name: contentful-migration
description: Write, run, and manage Contentful schema migrations using schema-as-code. Use for any content type or field changes — never make schema changes manually in the UI or via ad-hoc MCP calls without a corresponding migration script. Every CT change needs a versioned migration file.
metadata:
  author: skills-upgrade
  version: 1.0.0
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - mcp__contentful__get_content_type
  - mcp__contentful__list_content_types
  - mcp__contentful__list_environments
  - mcp__contentful__get_space
---

# Contentful Migration

You are a Contentful schema-as-code expert. Schema changes in this project use versioned migration scripts so every content model change is tracked, reproducible, and rollback-safe.

## CRITICAL: Current State

**Migration scripts in `migrations/`:** ZERO (as of 2026-05-12)

Every content type in this project was created via MCP or the Contentful UI with no version history. The first priority when using this skill is to **create the `migrations/` directory and bootstrap it** with a README and an initial snapshot script.

## Stack

- **Package:** `contentful-migration` npm package
- **CLI:** `contentful-cli` → `contentful space migration`
- **Script naming:** `NNN-description.js` (e.g., `001-initial-content-types.js`, `002-add-nt-audience-fields.js`)
- **Directory:** `migrations/` at project root

## Setup

```bash
# Install as dev deps (if not already)
bun add -d contentful-cli contentful-migration

# Verify
bunx contentful --version
```

**Environment variables required:**
```bash
CONTENTFUL_MANAGEMENT_ACCESS_TOKEN=  # CMA key (in ~/.claude/.env as CONTENTFUL_CMA_KEY)
CONTENTFUL_SPACE_ID=uumzxfocy3ef
CONTENTFUL_ENVIRONMENT_ID=master     # or target env
```

## Writing a Migration Script

Each script exports a default function that receives a `migration` object:

```javascript
// migrations/NNN-description.js
module.exports = function(migration, { makeRequest, spaceId, environmentId }) {
  // 1. Create a content type
  const hero = migration.createContentType('hero', {
    name: 'Hero',
    description: 'Hero section block',
    displayField: 'internalName',
  });

  // 2. Add fields
  hero.createField('internalName', {
    name: 'Internal Name',
    type: 'Symbol',
    required: true,
  });

  hero.createField('headline', {
    name: 'Headline',
    type: 'RichText',
    required: false,
  });

  hero.createField('media', {
    name: 'Media',
    type: 'Link',
    linkType: 'Asset',
    required: false,
  });

  hero.createField('sectionsCollection', {
    name: 'Sub-sections',
    type: 'Array',
    items: {
      type: 'Link',
      linkType: 'Entry',
      validations: [{ linkContentType: ['button', 'featureItem'] }],
    },
  });

  // 3. Edit content type metadata
  hero.changeFieldControl('headline', 'builtin', 'richTextEditor', {});
  hero.changeFieldControl('media', 'builtin', 'assetLinkEditor', {});

  // 4. Publish the content type
  migration.transformEntries({
    contentType: 'hero',
    from: ['oldField'],
    to: ['newField'],
    transformEntryForLocale: (fields, locale) => ({
      newField: fields.oldField[locale],
    }),
  });
};
```

## Field Types Reference

| Contentful type | `type` value | Notes |
|----------------|--------------|-------|
| Short text | `Symbol` | Max 256 chars |
| Long text | `Text` | No limit |
| Rich text | `RichText` | Use `richTextEditor` control |
| Number | `Integer` or `Number` | Integer = int, Number = float |
| Boolean | `Boolean` | — |
| Date | `Date` | ISO 8601 |
| JSON | `Object` | Freeform JSON |
| Asset link | `Link`, `linkType: 'Asset'` | — |
| Entry link | `Link`, `linkType: 'Entry'` | Add `linkContentType` validation |
| Array of entries | `Array`, items `Link/Entry` | — |
| Array of symbols | `Array`, items `Symbol` | — |

## Validations

```javascript
field.validations([
  { in: ['value1', 'value2'] },              // Allowed values
  { size: { min: 1, max: 10 } },             // String/array size
  { regexp: { pattern: '^https?://', flags: 'i' } }, // Regex
  { linkContentType: ['hero', 'banner'] },   // Entry link CT restriction
  { linkMimetypeGroup: ['image'] },          // Asset mime type
]);
```

## Running Migrations

```bash
# Dry run (always do this first)
bunx contentful space migration \
  --space-id uumzxfocy3ef \
  --environment-id master \
  --yes \
  migrations/001-description.js --dry-run

# Run for real
bunx contentful space migration \
  --space-id uumzxfocy3ef \
  --environment-id master \
  --yes \
  migrations/001-description.js

# Run against a demo env
bunx contentful space migration \
  --space-id uumzxfocy3ef \
  --environment-id bears \
  --yes \
  migrations/001-description.js
```

## Strategy: Environments

| Scenario | Approach |
|----------|---------|
| New CT in master only | Run migration against `master` |
| New CT needed in demo env too | Run same migration against both envs |
| Demo env diverges from master | That's expected — demo envs are forks |
| Schema rollback needed | Write a new `NNN-rollback-description.js` — never edit history |

## Workflow for a New Content Type

1. **Plan** — document fields, validations, and purpose in the migration script comment header
2. **Write** — create `migrations/NNN-description.js`
3. **Dry run** — verify output with `--dry-run`
4. **Run against dev env first** if one exists, then master
5. **Commit** the migration script with message: `feat(migration): NNN — [what and why]`
6. **MCP verify** — use `mcp__contentful__get_content_type` to confirm the CT was created correctly

## Bootstrapping (First-Use Checklist)

Since migrations/ is currently empty:

1. Create `migrations/README.md` (see `references/running-migrations.md`)
2. Write `migrations/001-baseline-snapshot.js` — a no-op or documentation-only script marking the current state
3. Going forward, every schema change needs a corresponding `NNN-*.js`

## Reference Files

| File | Topic |
|------|-------|
| `references/api-reference.md` | Full migration API — all methods, options |
| `references/patterns.md` | Common patterns: CT create, field edit, entry transform |
| `references/running-migrations.md` | CLI commands, env strategy, CI/CD integration |
