---
name: demo-setup
description: End-to-end guided workflow for spinning up a new customer demo. Runs an intake interview, creates the worktree and branch, scrapes the customer's brand tokens, scaffolds the Contentful environment, selects demo loops, and produces a DEMO_SCRIPT.md. Invoke when user says "set up a new demo", "spin up a demo for [customer]", "create a demo branch", "new demo", "start a demo for", "I have a demo for", or "let's build a demo for".
version: 1.1.0
author: casey-lisak
---

# Demo Setup Skill

Guided workflow for spinning up a complete, personalized demo environment from scratch.
Work through phases **sequentially**. Confirm with the user at each checkpoint before proceeding.

---

## Phase 0 — Intake interview

Ask in one message:

1. **Customer name** — used for branch name, theme key, Contentful env
2. **Website URL** — for brand scraping (see [Brand Scraping](references/brand-scraping.md))
3. **Demo date** — used in branch name (`demo/[customer]-[YYYY-MM]`)
4. **What they care about** — pick all that apply:
   - Multi-channel content (web + mobile)
   - Personalization / A/B testing
   - Data visualization
   - Live preview / editor experience
   - Blog / content publishing
   - Custom page sections (Hero, FAQ, Features, Tabs)
5. **Contentful env** — copy from `master` (recommended) or fresh start?

Summarize answers and confirm before Phase 1.

---

## Phase 1 — Branch + worktree

```bash
bash scripts/worktree-add.sh demo/[customer-slug]-[YYYY-MM]
```

Tell the user:
> Worktree ready: `/Users/casey.lisak/Dev/metafi-worktrees/demo-[customer-slug]-[YYYY-MM]`
> Open in new Claude Code: `claude /Users/casey.lisak/Dev/metafi-worktrees/demo-[customer-slug]-[YYYY-MM]`

Write `branch.env` in the worktree:
```
CONTENTFUL_ENVIRONMENT=[customer-slug]
NEXT_PUBLIC_BRAND=[customer-slug]
```
Copy `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN`, `CONTENTFUL_PREVIEW_ACCESS_TOKEN`,
`CONTENTFUL_PREVIEW_SECRET`, `SHADCNBLOCKS_API_KEY` from current `.env.local`.

---

## Phase 2 — Brand token scraping

See **[Brand Scraping](references/brand-scraping.md)** for full firecrawl instructions, hex→oklch conversion, and proprietary font substitutes.

**Quick summary:**
1. Run firecrawl scrape on customer URL → extract colors + font
2. Convert hex → oklch
3. Write `[data-theme='[customer-slug]']` CSS block to `src/app/globals.css`
4. If scrape fails → ask user for primary hex, accent hex, font name

---

## Phase 3 — Contentful environment

**Space ID:** `uumzxfocy3ef`

1. Create environment via MCP:
   ```
   mcp__contentful__create_environment
     spaceId: "uumzxfocy3ef"
     name: "[customer-slug]"
     sourceEnvironmentId: "master"
   ```

2. Verify with `mcp__contentful__list_environments`.

3. **⚠️ Manual step:** Contentful → Settings → API Keys → your key → add `[customer-slug]` to environments. The app can't fetch content until this is done.

---

## Phase 4 — Demo loop selection

See **[Demo Loops](references/demo-loops.md)** for the full loop table, what each shows, and how to seed them.

Based on Phase 0 answers, present matching loops and confirm selection. For each selected loop, run its seed script or create content via MCP against the `[customer-slug]` environment.

---

## Phase 5 — DEMO_SCRIPT.md

Use **[Demo Script Template](references/demo-script-template.md)** to scaffold `DEMO_SCRIPT.md` in the worktree root. Fill in:
- Customer name + date
- Selected loops with their talking points
- Specific entry IDs for live preview URLs
- Pre-demo checklist items

---

## Phase 6 — Handoff summary

Output this block for the user to save:

```
Demo:          [Customer Name]
Date:          [Date]
Branch:        demo/[customer-slug]-[YYYY-MM]
Worktree:      /Users/casey.lisak/Dev/metafi-worktrees/demo-[customer-slug]-[YYYY-MM]
Contentful:    space=uumzxfocy3ef  env=[customer-slug]
Theme:         [data-theme='[customer-slug]']
Loops:         [list]
DEMO_SCRIPT:   ✅ at DEMO_SCRIPT.md
⚠️  Still needed: Add [customer-slug] to Contentful API key environments
```

Post-demo reminder: run **continuous-improvement** skill to archive the demo and flag any new components worth merging to main.
