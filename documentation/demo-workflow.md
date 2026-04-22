# Demo Workflow

How to spin up, run, and clean up a prospect demo on this platform.

---

## Overview

`main` is the clean sandbox — all blocks, generic branding, no prospect-specific content. Every demo gets its own branch and Contentful environment so demos are isolated and can be developed in parallel.

```
main                    ← source of truth, all blocks, generic content
demo/[prospect]         ← base branch for a prospect (equiv. of main for that demo)
demo/[prospect]/feat/[desc]   ← feature work on top of the demo
demo/[prospect]/fix/[desc]    ← fixes on top of the demo
```

---

## Phase 1 — Start: branch + worktree

### Prerequisites
- `main` is up to date: `git pull`
- No outstanding unmerged branches that should land in main first (check with `git branch -a`)

### Steps

```bash
# 1. Create branch off latest main
git checkout main && git pull
git checkout -b demo/[prospect]

# 2. Set branch-specific env vars (committed to the branch)
cat > branch.env << 'EOF'
CONTENTFUL_ENVIRONMENT=[prospect]
NEXT_PUBLIC_BRAND=[prospect]
EOF

git add branch.env
git commit -m "env(demo/[prospect]): set Contentful env + brand — new prospect demo"

# 3. Create worktree (auto-copies branch.env → .env.local)
bash scripts/worktree-add.sh demo/[prospect]

# 4. Open in a new Claude Code instance
# claude /Users/casey.lisak/Dev/metafi-worktrees/demo-[prospect]
```

> `branch.env` is committed to the branch and auto-copied to `.env.local` on every checkout/worktree creation via the post-checkout git hook. Never commit `.env.local`.

---

## Phase 2 — Contentful environment setup

### Create the environment

In Contentful → **Environments → Add environment**:
- ID: `[prospect]` (must match `CONTENTFUL_ENVIRONMENT` in `branch.env`)
- Copy from: `master`

Content types are inherited from master automatically. You only need to seed entries.

### Verify API access

The existing space-level API tokens (Delivery + Preview) work across all environments — no new tokens needed.

To confirm:
```bash
# In the worktree
cat .env.local   # should show CONTENTFUL_ENVIRONMENT=[prospect]
bun run dev      # visit http://localhost:3000
```

If the site loads with no content, the environment was created but has no entries yet (expected).

### Seed content via MCP

Use Contentful MCP tools to create entries in the new environment:

```
mcp__contentful__create_entry  (space: uumzxfocy3ef, env: [prospect])
mcp__contentful__publish_entry
```

Seed order: child entries first, parent entries last. Publish each before linking to parent.

---

## Phase 3 — Brand + theme

### Scrape brand tokens

Use the brand scraper (or manually inspect the prospect's site) to extract:
- Primary / secondary colors
- Font families
- Border radius, spacing scale

### Add theme to globals.css

Add a `[data-theme='[prospect]']` block to `src/app/globals.css` overriding CSS variables:

```css
[data-theme='[prospect]'] {
  --background: ...;
  --foreground: ...;
  --primary: ...;
  --primary-foreground: ...;
  /* etc. */
}
```

`NEXT_PUBLIC_BRAND=[prospect]` in `.env.local` activates this theme on `<body>`.

> Never hardcode the prospect name anywhere in component files. Always read from `process.env.NEXT_PUBLIC_BRAND`.

---

## Phase 4 — Verify live preview

Live preview requires the Contentful Preview API and the SDK connection to be working end-to-end. Check all of the following:

### Checklist

- [ ] `CONTENTFUL_PREVIEW_ACCESS_TOKEN` is set in `.env` (shared, not per-demo)
- [ ] `CONTENTFUL_PREVIEW_SECRET` is set in `.env`
- [ ] `CONTENTFUL_ENVIRONMENT` in `.env.local` matches the Contentful environment ID
- [ ] Dev server running (`bun run dev`)
- [ ] Open an entry in Contentful → click "Open preview" → page loads
- [ ] Edit a field → change appears in the preview iframe without a page reload

### Preview URLs (Contentful → Settings → Content preview)

These are space-level and already configured. If adding a new content type, register its preview URL:

| Content Type | URL pattern |
|---|---|
| Page | `http://localhost:3000/api/enable-draft?secret=kaz&slug={{entry.fields.slug}}` |
| Hero | `http://localhost:3000/api/enable-draft?secret=kaz&entryId={{entry.sys.id}}&type=hero` |
| Faq | `http://localhost:3000/api/enable-draft?secret=kaz&entryId={{entry.sys.id}}&type=faq` |
| TabbedContent | `http://localhost:3000/api/enable-draft?secret=kaz&entryId={{entry.sys.id}}&type=tabbedContent` |
| DataViz | `http://localhost:3000/api/enable-draft?secret=kaz&entryId={{entry.sys.id}}&type=dataViz` |
| Banner | `http://localhost:3000/api/enable-draft?secret=kaz&entryId={{entry.sys.id}}&type=banner` |
| BlogPost | `http://localhost:3000/api/enable-draft?secret=kaz&entryId={{entry.sys.id}}&type=blogPost` |

### Debugging live preview

If live preview isn't updating, run the `contentful-live-preview-verify` skill for browser-based diagnostics. Also check `documentation/lessons-learned/` for known patterns.

---

## Phase 5 — Demo script + prep

Before the demo:

- [ ] `documentation/session-handoff.md` updated with demo goals + click path
- [ ] `DEMO_SCRIPT.md` exists in `demo-loops/[loop-name]/` if using a demo loop
- [ ] Contentful entry editor open and pointed at the prospect environment
- [ ] Preview URL open in a separate tab / window
- [ ] Live edit loop tested: edit field → see change in preview

---

## Phase 6 — Post-demo cleanup

After the demo is done and the branch is no longer needed:

```bash
# Remove worktree
git worktree remove /Users/casey.lisak/Dev/metafi-worktrees/demo-[prospect]

# Delete local branch
git branch -d demo/[prospect]

# Delete remote branch (optional — keep for reference if demo may repeat)
git push origin --delete demo/[prospect]
```

The Contentful environment can be archived or deleted in Contentful → Environments.

---

## What's automatic vs manual

| Area | Automatic? | Notes |
|---|---|---|
| `.env.local` from `branch.env` | ✅ Auto (git hook) | On every checkout + worktree creation |
| GraphQL endpoint | ✅ Auto | Built from `CONTENTFUL_ENVIRONMENT` |
| Live preview SDK | ✅ Auto | Reads `CONTENTFUL_ENVIRONMENT` from layout |
| Draft mode | ✅ Auto | Same secret across all envs |
| API tokens | ✅ Auto | Space-level, work across all envs |
| Content types | ✅ Auto | Inherited when env is copied from master |
| CSS theme | ⚠️ Manual | Must add `[data-theme='[prospect]']` to globals.css |
| Seed entries | ⚠️ Manual | Must create in the new Contentful environment |
| `node_modules` | ✅ Auto (symlink) | `worktree-add.sh` creates the symlink |
| Ninetailed audiences/experiences | ⚠️ Manual | Must create in the new Contentful environment if used |

---

## Branch naming reference

| Pattern | Used for |
|---|---|
| `demo/[prospect]` | Base branch for a prospect demo |
| `demo/[prospect]/feat/[desc]` | Feature added on top of a demo |
| `demo/[prospect]/fix/[desc]` | Bug fix on top of a demo |
| `feat/[desc]` | Feature work on main |
| `fix/[desc]` | Bug fix on main |
