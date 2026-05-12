# Package Versions

## Current Audit (as of 2026-05-12)

**Status: Needs upgrade** — project uses `-react` instead of `-next`.

Run to check current state:
```bash
grep -E "ninetailed" package.json
```

## Correct Package Set

```json
{
  "dependencies": {
    "@ninetailed/experience.js-next": "^7.x.x",
    "@ninetailed/experience.js-insights": "^7.x.x",
    "@ninetailed/experience.js-preview": "^7.x.x"
  }
}
```

## Version Compatibility

| NT Package | Next.js | React | Notes |
|-----------|---------|-------|-------|
| v7.x | 13, 14, 15 | 18, 19 | App Router compatible |
| v6.x | 12, 13 | 17, 18 | Pages Router era |
| v5.x and below | Legacy | — | Do not use |

## Alpha Versions

The project was on `v7.22.0-alpha.2` — alpha versions may have undocumented breaking changes. Pin to a stable release when available:

```bash
# Check latest stable
bun info @ninetailed/experience.js-next version

# Install stable
bun add @ninetailed/experience.js-next@latest
```

## Full Upgrade Command

```bash
# Remove old
bun remove @ninetailed/experience.js-react

# Install correct packages
bun add @ninetailed/experience.js-next @ninetailed/experience.js-insights @ninetailed/experience.js-preview

# Verify
grep ninetailed package.json
```

Then update all imports:
```bash
# Find all files importing from -react
grep -r "experience.js-react" src/ --include="*.ts" --include="*.tsx"

# Replace (manual — verify each file)
# @ninetailed/experience.js-react → @ninetailed/experience.js-next
```
