# Worktrees 101 — Git Worktrees with Claude Code

## Section 1 — Branches vs worktrees: what's the difference?

### What you already know: branches

A Git branch is a pointer to a commit. When you do `git checkout feat/my-feature`, Git updates your single working directory to reflect that branch's state. If you have uncommitted changes, you have to stash them or commit them first. You can only be on one branch at a time in a given directory.

This is the workflow you described: create branch → do work → merge to main → done.

### What worktrees add

A Git worktree is an **actual folder on disk**, checked out to a specific branch. You can have multiple worktrees at the same time, each on a different branch, each with their own files and `.env.local`. No stashing, no branch switching.

The key insight: **all worktrees share the same `.git` directory**. They are not clones. They share the same commit history, the same remotes, the same object store. Creating a worktree is cheap and instant — it's just a new checkout.

```
/Users/casey.lisak/Dev/
  metafi-nextjs-shadcnblocks/     ← main repo, checked out to `main`
  metafi-worktrees/
    demo-bears/                   ← worktree, checked out to `demo/bears`
    feat-aio-aeo-geo-demo/        ← worktree, checked out to `feat/aio-aeo-geo-demo`
```

All three folders above are the same repository. You can `cd` between them freely. Each has its own working files, its own `.env.local`, and its own dev server process.

---

## Section 2 — How this project uses worktrees

### The pattern

- `main` = clean sandbox with all blocks, generic branding. Never demoed directly.
- Every feature or customer demo = its own worktree, branched off `main`.
- Worktrees live at `/Users/casey.lisak/Dev/metafi-worktrees/<branch-slug>`.

### The helper script

`scripts/worktree-add.sh` automates the setup:

```bash
bash scripts/worktree-add.sh <branch-name>
```

What it does, step by step:
1. Converts the branch name to a slug (replaces `/` with `-`) — so `demo/bears` becomes `demo-bears`
2. Runs `git worktree add /Users/casey.lisak/Dev/metafi-worktrees/demo-bears demo/bears`
3. Symlinks `node_modules` from the main repo — no reinstall needed
4. Copies `.env.local` from the main repo into the worktree (or uses `branch.env` if one exists in the branch)

### Full lifecycle

```bash
# 1. Create the worktree
bash scripts/worktree-add.sh demo/bears
# → creates /Users/casey.lisak/Dev/metafi-worktrees/demo-bears

# 2. Open it in a new Claude Code instance
claude /Users/casey.lisak/Dev/metafi-worktrees/demo-bears

# 3. See all active worktrees
git worktree list

# 4. When the demo is retired, clean up
git worktree remove /Users/casey.lisak/Dev/metafi-worktrees/demo-bears
git branch -d demo/bears
```

> **Note:** Demo worktrees are long-lived. Don't rush to remove them. `demo/bears` stays alive as long as the Bears relationship is active.

---

## Section 3 — Worktrees + Claude Code: multiple agents

### One CC instance per worktree

Each worktree gets its own Claude Code instance, opened with:

```bash
claude /Users/casey.lisak/Dev/metafi-worktrees/<slug>
```

This is why worktrees matter for Claude Code specifically:
- Each CC instance has a stable working directory. It never has to switch branches.
- Two CC instances can work in parallel without touching each other's files.
- No risk of one agent overwriting another's uncommitted changes.

### The rule

**One CC instance per branch. Never two CC instances on the same branch at the same time.**

### Coordination between instances

When multiple CC instances are running simultaneously:

- **TASKS.md** — each CC edits only its own section. The "Active branches" table shows who owns what.
- **MEMORY.md** — only the CC on `main` writes here. Other branches note things locally and the main CC merges them in on PR.
- **Before starting work** — run `git log --oneline -5` to see what other instances may have committed.
- **After a branch merges to main** — run `git pull` in all open CC sessions before continuing.

### Practical example

If you're running the Bears demo prep AND working on the AIO/AEO feature at the same time:

```
Terminal 1: claude /Users/casey.lisak/Dev/metafi-nextjs-shadcnblocks        ← main CC
Terminal 2: claude /Users/casey.lisak/Dev/metafi-worktrees/demo-bears       ← Bears CC
Terminal 3: claude /Users/casey.lisak/Dev/metafi-worktrees/feat-aio-aeo-...  ← AIO CC
```

All three run independently. No interference.

---

## Section 4 — The demo-per-worktree pattern (the key workflow)

This is the full end-to-end flow for spinning up a new customer demo. The Bears demo is the canonical example.

### Step 1 — Create the worktree and branch

```bash
bash scripts/worktree-add.sh demo/bears
# → /Users/casey.lisak/Dev/metafi-worktrees/demo-bears
```

The branch `demo/bears` is created off `main`. It starts identical to main.

### Step 2 — Update `.env.local` in the worktree

The script copied main's `.env.local` into the worktree. Now update it to point to the Bears Contentful environment:

```bash
# /Users/casey.lisak/Dev/metafi-worktrees/demo-bears/.env.local
CONTENTFUL_ENVIRONMENT=bears          # ← change from "master"
NEXT_PUBLIC_BRAND=bears               # ← activates Bears theme
SHADCNBLOCKS_API_KEY=sk_live_...      # ← same key, already there
```

This `.env.local` is specific to this worktree. Main's `.env.local` still says `master`. They never conflict.

> **Important:** The `CONTENTFUL_ENVIRONMENT` value must match the Contentful environment ID **exactly** (case-sensitive). If the environment is named `bears`, the value must be `bears`.

### Step 3 — Create the matching Contentful environment

In Contentful → Settings → Environments, create a new environment named `bears` (cloned from `master`). The name must match `CONTENTFUL_ENVIRONMENT` in `.env.local`.

Also: go to Settings → API Keys and check the `bears` environment in both the delivery and preview token settings. This is easy to forget and will cause silent 404s if missed.

### Step 4 — Add the brand theme

In the worktree's code, add a `[data-theme='bears']` block to `src/app/globals.css` with the customer's brand colors:

```css
[data-theme='bears'] {
  --primary: #C83803;      /* Bears orange */
  --primary-foreground: #ffffff;
  --background: #0B1F41;  /* Bears navy */
  /* ... */
}
```

`NEXT_PUBLIC_BRAND=bears` in `.env.local` automatically applies `data-theme="bears"` to the `<body>` in `layout.tsx`. No code changes needed to activate it.

### Step 5 — Run the dev server in the worktree

```bash
cd /Users/casey.lisak/Dev/metafi-worktrees/demo-bears
bun run dev
```

Because `node_modules` is symlinked from main, no reinstall is needed. The server starts on port 3000.

> If you also have the main dev server running, use `PORT=3001 bun run dev` in the worktree to avoid the conflict.

### Step 6 — Live preview just works

Because `.env.local` in the worktree has `CONTENTFUL_ENVIRONMENT=bears`, every Contentful API call from this dev server automatically hits the `bears` environment. The live preview iframe points to `localhost:3000` (or `3001`), which in turn reads from `bears`.

Preview URLs in Contentful are configured per content type and look like:

```
http://localhost:3000/api/enable-draft?secret=kaz&entryId={{entry.sys.id}}&type=banner
```

The `CONTENTFUL_ENVIRONMENT` is resolved server-side — the URL doesn't need to specify it. As long as your dev server is running in the worktree, live preview hits the right environment.

### Step 7 — The demo is isolated

At this point:
- The worktree has Bears branding (navy + orange)
- All Contentful content is from the `bears` environment
- Main is untouched — still has generic branding + `master` content
- You can run both side by side if needed

---

## Section 5 — Gotchas and lessons learned

### `.env.local` is per-worktree and does not auto-update

The script copies `.env.local` at creation time. If you later update main's `.env.local` (e.g. add a new API key), that change does **not** propagate to existing worktrees. You need to update each worktree's `.env.local` manually.

### `CONTENTFUL_ENVIRONMENT` is case-sensitive

If Contentful created the environment as `Bears` (capital B) but your `.env.local` says `bears`, all API calls will fail silently. Always copy the environment ID from the Contentful UI.

### API tokens need the environment added

When you create a new Contentful environment, the existing delivery and preview API tokens don't automatically have access to it. Go to Contentful → Settings → API Keys and manually check the new environment for each token. Forgetting this causes 404s with no obvious error message.

### Preview URLs in Contentful are absolute

The preview URL configured on a content type (e.g. `http://localhost:3000/api/enable-draft?...`) is hardcoded to a port. If your worktree's dev server is on port 3001 instead of 3000, live preview will open the wrong server. Either keep worktrees on different ports and update the URLs in Contentful, or only run one dev server at a time.

### Do not run `bun install` in a worktree

The `node_modules` directory in a worktree is a symlink to main's `node_modules`. Running `bun install` in the worktree will try to replace the symlink with a real directory. Always make package changes in main first, then they're automatically available in all worktrees via the symlink.

### Demo worktrees are long-lived by design

Unlike feature branches (merge → delete), demo worktrees stay alive for the duration of the customer relationship. You may come back to `demo/bears` weeks later to update content or branding. Don't delete it prematurely.

---

## Section 6 — Quick reference

```bash
# Create a new worktree (demo or feature)
bash scripts/worktree-add.sh demo/acme-2026-04
bash scripts/worktree-add.sh feat/aio-aeo-geo-demo

# Open in a new Claude Code instance
claude /Users/casey.lisak/Dev/metafi-worktrees/demo-acme-2026-04

# Start the dev server in a worktree
cd /Users/casey.lisak/Dev/metafi-worktrees/demo-acme-2026-04
bun run dev

# Start on a different port (if main dev server is already on 3000)
PORT=3001 bun run dev

# See all active worktrees and which branch each is on
git worktree list

# Remove a worktree when the demo is retired
git worktree remove /Users/casey.lisak/Dev/metafi-worktrees/demo-acme-2026-04
git branch -d demo/acme-2026-04

# After any branch merges to main, sync all open CC sessions
git pull   # run this in each active worktree
```

### `.env.local` values to change per demo

| Variable | Value in main | Value in demo worktree |
|---|---|---|
| `CONTENTFUL_ENVIRONMENT` | `master` | `bears` (must match Contentful env ID) |
| `NEXT_PUBLIC_BRAND` | *(unset or `default`)* | `bears` (must match `[data-theme='bears']` in globals.css) |

All other variables (API keys, preview secret, etc.) are the same across worktrees.
