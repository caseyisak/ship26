#!/usr/bin/env bash
# Usage: ./scripts/worktree-add.sh <branch-name>
# Creates a worktree at /Users/casey.lisak/Dev/metafi-worktrees/<branch-slug>,
# symlinks node_modules and .env (shared tokens), and copies branch.env → .env.local.
# Each worktree gets its own CONTENTFUL_ENVIRONMENT via branch.env / .env.local.
set -euo pipefail

BRANCH="${1:-}"
if [[ -z "$BRANCH" ]]; then
  echo "Usage: $0 <branch-name>" >&2
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
WORKTREES_DIR="/Users/casey.lisak/Dev/metafi-worktrees"
SLUG="${BRANCH//\//-}"   # replace / with -
TARGET="$WORKTREES_DIR/$SLUG"

if [[ -d "$TARGET" ]]; then
  echo "✘ Worktree already exists at $TARGET" >&2
  exit 1
fi

echo "→ Creating worktree for '$BRANCH' at $TARGET"
git worktree add "$TARGET" "$BRANCH"

echo "→ Symlinking node_modules"
ln -s "$REPO_ROOT/node_modules" "$TARGET/node_modules"

echo "→ Symlinking .env (shared tokens)"
# .env holds space ID + API tokens — same for all environments, never copied so tokens
# stay in sync with the main repo. CONTENTFUL_ENVIRONMENT is overridden per-worktree
# via .env.local (set below from branch.env).
if [[ -f "$REPO_ROOT/.env" ]]; then
  ln -s "$REPO_ROOT/.env" "$TARGET/.env"
  echo "  ✔ .env symlinked from main repo"
fi

echo "→ Copying branch.env → .env.local"
if [[ -f "$TARGET/branch.env" ]]; then
  cp "$TARGET/branch.env" "$TARGET/.env.local"
  echo "  ✔ .env.local set from branch.env (Contentful env: $(grep CONTENTFUL_ENVIRONMENT "$TARGET/.env.local" | cut -d= -f2))"
else
  cp "$REPO_ROOT/.env.local" "$TARGET/.env.local"
  echo "  ✔ .env.local copied from main repo (no branch.env found)"
fi

echo ""
echo "✔ Worktree ready: $TARGET"
echo "  Branch: $BRANCH"
echo "  Open a new Claude Code instance with: claude \"$TARGET\""
