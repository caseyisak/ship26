# Package Versions

## Current Audit (as of 2026-06-02)

**Status: Correct** -- project uses `@ninetailed/experience.js-react` v7.23.2 (stable).

Run to check current state:
```bash
grep -E "ninetailed" package.json
```

## Correct Package Set (App Router)

> **WARNING:** Previous versions of this document recommended `@ninetailed/experience.js-next`. That package uses `next/router` (Pages Router API) and does NOT work with App Router. Use `-react` instead.

```json
{
  "dependencies": {
    "@ninetailed/experience.js-react": "^7.23.2",
    "@ninetailed/experience.js-utils": "^7.23.2",
    "@ninetailed/experience.js-plugin-preview": "^7.23.2"
  }
}
```

## Version Compatibility

| NT Package | Next.js | React | Notes |
|-----------|---------|-------|-------|
| v7.x | 13, 14, 15 | 18, 19 | App Router compatible (use `-react` package) |
| v6.x | 12, 13 | 17, 18 | Pages Router era |
| v5.x and below | Legacy | --- | Do not use |

## Alpha Versions

The project was previously on `v7.22.0-alpha.2` -- alpha versions may have undocumented breaking changes. Upgraded to stable `v7.23.2` in June 2026.

```bash
# Check latest stable
bun info @ninetailed/experience.js-react version

# Install stable
bun add @ninetailed/experience.js-react@latest
```

## Full Install Command

```bash
# Install correct packages for App Router
bun add @ninetailed/experience.js-react @ninetailed/experience.js-utils @ninetailed/experience.js-plugin-preview

# Verify
grep ninetailed package.json
```
