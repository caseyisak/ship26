# Running Migrations

## Prerequisites

```bash
# Install tools
bun add -d contentful-cli contentful-migration

# Set env vars (or export temporarily)
export CONTENTFUL_MANAGEMENT_ACCESS_TOKEN=<your-CMA-key>
export CONTENTFUL_SPACE_ID=uumzxfocy3ef
export CONTENTFUL_ENVIRONMENT_ID=master
```

The CMA key is stored as `CONTENTFUL_CMA_KEY` in `~/.claude/.env`. Do not hardcode it.

## Basic Commands

```bash
# Dry run (ALWAYS do this first)
bunx contentful space migration \
  --space-id uumzxfocy3ef \
  --environment-id master \
  --management-token $CONTENTFUL_MANAGEMENT_ACCESS_TOKEN \
  migrations/001-my-migration.js \
  --dry-run

# Run for real (no --dry-run)
bunx contentful space migration \
  --space-id uumzxfocy3ef \
  --environment-id master \
  --management-token $CONTENTFUL_MANAGEMENT_ACCESS_TOKEN \
  --yes \
  migrations/001-my-migration.js
```

`--yes` skips the interactive confirmation prompt (useful for CI).

## Environment Strategy

| Target | Command |
|--------|---------|
| master | `--environment-id master` |
| Demo env | `--environment-id bears` (or env name) |
| All envs | Run separately for each |

**Recommendation:** Run against a demo/test env first, verify, then run against master.

## Migration Output

Contentful creates a `__ContentfulMigration` entry in your space to track which migrations have run. This prevents re-running the same script.

If you need to re-run (e.g., on a fresh env that doesn't have the tracking entry), migrations are idempotent if written correctly (check `if (!ct.fields.find(f => f.id === 'newField'))` pattern for add operations).

## CI/CD Integration

```yaml
# .github/workflows/migration.yml
name: Run Contentful Migration
on:
  push:
    branches: [main]
    paths: ['migrations/**']

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - name: Run migrations
        run: |
          # Get list of new migration files
          CHANGED=$(git diff HEAD~1 --name-only -- 'migrations/*.js')
          for MIGRATION in $CHANGED; do
            bunx contentful space migration \
              --space-id ${{ secrets.CONTENTFUL_SPACE_ID }} \
              --environment-id master \
              --management-token ${{ secrets.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN }} \
              --yes \
              $MIGRATION
          done
```

## Rollback Strategy

Contentful does not support migration rollback directly. Strategy:

1. **Write a reverse migration** — new script that undoes the change
2. **Delete field** (if field was added and has no data yet)
3. **Delete CT** (if CT was created and has no entries)

Never edit an existing migration file after it's been committed — write a new one.

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `CT already exists` | Script ran twice or CT created manually | Check if CT exists, skip create |
| `Field already exists` | Same | Wrap in check or use `editField` |
| `CONTENTFUL_MANAGEMENT_ACCESS_TOKEN not set` | Env var missing | Export the token |
| `API rate limit` | Too many changes in one script | Split into multiple scripts |
| `Validation failed` | Invalid field config | Check field type + options match |

## Bootstrapping `migrations/` (First Time)

Since this project has no migration history:

```bash
# 1. Create README
# migrations/README.md — explains the migration system

# 2. Create baseline snapshot (no-op — just documentation)
# migrations/001-baseline-snapshot.js
module.exports = function(migration) {
  // This is a no-op migration that documents the state of CTs
  // as of 2026-05-12 when migration tooling was introduced.
  // All CTs were created via Contentful MCP or UI before this date.
  // From this point forward, all CT changes must have a corresponding migration script.
  console.log('Baseline documented. No changes made.');
};

# 3. Run the baseline snapshot to register it
bunx contentful space migration ... migrations/001-baseline-snapshot.js --yes
```
