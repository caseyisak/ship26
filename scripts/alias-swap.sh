#!/usr/bin/env bash
# Usage:
#   bash scripts/alias-swap.sh <env-id>   # point 'demo' alias at <env-id>
#   bash scripts/alias-swap.sh --reset    # point 'demo' alias back at 'master' env
#
# Requires: contentful CLI (npm i -g contentful-cli) + CONTENTFUL_CMA_KEY in env or ~/.claude/.env
set -euo pipefail

SPACE_ID="uumzxfocy3ef"
ALIAS_ID="demo"

# Load CMA key from ~/.claude/.env if not already in environment
if [[ -z "${CONTENTFUL_CMA_KEY:-}" ]]; then
  if [[ -f "$HOME/.claude/.env" ]]; then
    source "$HOME/.claude/.env"
  fi
fi

if [[ -z "${CONTENTFUL_CMA_KEY:-}" ]]; then
  echo "✘ CONTENTFUL_CMA_KEY not set. Add it to ~/.claude/.env or export it." >&2
  exit 1
fi

TARGET_ARG="${1:-}"
if [[ -z "$TARGET_ARG" ]]; then
  echo "Usage: $0 <env-id>   # e.g. $0 beckons-2026-05" >&2
  echo "       $0 --reset    # re-point back to master env" >&2
  exit 1
fi

if [[ "$TARGET_ARG" == "--reset" ]]; then
  TARGET_ENV="master"
  echo "→ Resetting 'demo' alias → master env"
else
  TARGET_ENV="$TARGET_ARG"
  echo "→ Pointing 'demo' alias → $TARGET_ENV"
fi

contentful space environment-alias update \
  --alias-id "$ALIAS_ID" \
  --target-environment-id "$TARGET_ENV" \
  --space-id "$SPACE_ID" \
  --management-token "$CONTENTFUL_CMA_KEY"

echo "✔ Done. 'demo' alias now points at: $TARGET_ENV"
if [[ "$TARGET_ENV" == "master" ]]; then
  echo "  Sandbox is restored. Demo env content is no longer served through 'demo'."
else
  echo "  All requests via CONTENTFUL_ENVIRONMENT=demo now hit: $TARGET_ENV"
  echo "  Remember: publish a dummy NT edit after this to flush NT's audience cache."
fi
