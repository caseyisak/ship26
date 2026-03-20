---
name: demo-setup
description: End-to-end guided workflow for spinning up a new customer demo. Runs an intake interview, creates the worktree and branch, scrapes the customer's brand tokens, scaffolds the Contentful environment, selects demo loops, and produces a DEMO_SCRIPT.md. Invoke when user says "set up a new demo", "spin up a demo for [customer]", "create a demo branch", "new demo", "start a demo for", "I have a demo for", or "let's build a demo for".
version: 1.0.0
author: casey-lisak
---

# Demo Setup Skill

You are running the **demo-setup** workflow. Your job is to guide the user through spinning up a complete, personalized demo environment from scratch.

Work through the phases below **sequentially**. Do not skip phases. At each checkpoint, confirm with the user before proceeding.

---

## Phase 0 — Intake interview

Ask these questions (can combine into one message):

1. **Customer name** — What company is this demo for? (used for branch name, theme key, Contentful env)
2. **Their website URL** — Used to scrape brand tokens (colors, fonts). If they don't have one, ask for primary color and font.
3. **Demo date** — When is the demo? (used in branch name)
4. **What they care about** — Pick all that apply:
   - Multi-channel content (web + mobile app)
   - Personalization / A/B testing
   - Data visualization / analytics
   - Live preview / editor experience
   - Blog / content publishing
   - Custom page sections (Hero, FAQ, Features, Tabbed content)
5. **Contentful environment** — Should we copy from `master` (recommended) or start fresh?

Once you have answers, summarize and ask for confirmation before proceeding.

---

## Phase 1 — Branch + worktree

Create the branch and worktree:

```bash
# Branch naming convention: demo/[customer-slug]-[YYYY-MM]
bash scripts/worktree-add.sh demo/[customer-slug]-[YYYY-MM]
```

Then tell the user:
> Worktree ready at `/Users/casey.lisak/Dev/metafi-worktrees/demo-[customer-slug]-[YYYY-MM]`
> Open it in a new Claude Code instance: `claude /Users/casey.lisak/Dev/metafi-worktrees/demo-[customer-slug]-[YYYY-MM]`

The `branch.env` for the new worktree should be set to:
```
CONTENTFUL_ENVIRONMENT=[customer-slug]
NEXT_PUBLIC_BRAND=[customer-slug]
SHADCNBLOCKS_API_KEY=...  # copy from current .env.local
```

---

## Phase 2 — Brand token scraping

Use firecrawl to scrape the customer's website and extract design tokens.

```
mcp__docker__firecrawl_scrape { url: "[customer-url]", formats: ["extract"], extract: { schema: { primaryColor, secondaryColor, accentColor, fontFamily, borderRadius, buttonStyle } } }
```

From the extracted tokens, generate a `[data-theme='[customer-slug]']` CSS block using the pattern already in `src/app/globals.css`.

Key mappings:
- Primary brand color → `--primary` (convert hex to oklch)
- Secondary/accent color → `--accent`
- Background → `--background` (light tint of primary)
- Font → add Google Fonts import if not proprietary; flag proprietary fonts

Write the CSS block to `src/app/globals.css` in the demo branch.

If scraping fails or gives poor results, ask the user to provide:
- Primary hex color
- Accent/secondary hex color
- Font name

---

## Phase 3 — Contentful environment

**Space ID:** `uumzxfocy3ef`

1. **Create the environment** by calling the MCP tool directly:
   ```
   mcp__contentful__create_environment
     spaceId: "uumzxfocy3ef"
     name: "[customer-slug]"
     sourceEnvironmentId: "master"
   ```
   Wait for confirmation that the environment was created before continuing.

2. **Verify** it exists:
   ```
   mcp__contentful__list_environments
     spaceId: "uumzxfocy3ef"
   ```
   Confirm `[customer-slug]` appears in the list.

3. **Remind the user to add the env to their API key** — this cannot be done via MCP:
   > ⚠️ Manual step required: Go to **Contentful → Settings → API Keys → your key → Environments** and add `[customer-slug]`. The app won't be able to fetch content until this is done.

4. **Update `branch.env`** in the worktree with:
   ```
   CONTENTFUL_ENVIRONMENT=[customer-slug]
   NEXT_PUBLIC_BRAND=[customer-slug]
   ```
   Also copy the current `.env.local` values for `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN`, `CONTENTFUL_PREVIEW_ACCESS_TOKEN`, `CONTENTFUL_PREVIEW_SECRET`, and `SHADCNBLOCKS_API_KEY`.

---

## Phase 4 — Demo loop selection

Based on the user's Phase 0 answers, present the matching demo loops:

| User interest | Demo loop | What it shows |
|--------------|-----------|---------------|
| Multi-channel | `multi-channel` | Same Contentful content on web + /app mobile frame |
| Personalization | `personalization` | ntExperiences A/B content variants |
| Data viz | `data-viz` | DataViz block with customer-relevant CSV data |
| Live preview | `live-preview` | Side-by-side editor + preview |
| Blog | `blog` | Blog listing + detail pages |
| Custom sections | `page-sections` | Hero, FAQ, Features, TabbedContent on a demo page |

For each selected loop, run its seed script (once they exist in `demo-loops/`) against the new Contentful environment. Until those scripts exist, list the content types and entries that need to be created manually via MCP.

---

## Phase 5 — DEMO_SCRIPT.md

Scaffold a `DEMO_SCRIPT.md` in the worktree root:

```markdown
# Demo Script — [Customer Name] — [Date]

## Attendees
- [names if known]

## Goal
[What success looks like for this demo]

## Flow

### Opening (2 min)
- Introduce Contentful as the content platform
- Show the live site at localhost:3000

### [Loop 1 name] (X min)
[Talking points from the loop's SCRIPT.md]

### [Loop 2 name] (X min)
[Talking points]

### Live Edit Moment (3 min)
- Open Contentful entry → make a live change → show it update in the preview
- "This is what your editors see every day"

### Close (2 min)
- Questions
- Next steps

## URLs to have open
- [ ] localhost:3000
- [ ] app.contentful.com/spaces/uumzxfocy3ef/environments/[customer-slug]
- [ ] localhost:3000/app (if multi-channel demo)
- [ ] Contentful live preview on a hero/banner entry

## Pre-demo checklist
- [ ] `bun run dev` running
- [ ] `.env.local` set to correct CONTENTFUL_ENVIRONMENT
- [ ] At least one published Page entry in the [customer-slug] env
- [ ] Brand theme visible (check localhost:3000 looks right)
- [ ] Live preview URL configured in Contentful for hero/banner
- [ ] All seed entries published
```

---

## Phase 6 — Handoff summary

Produce a handoff summary the user can save or share:

```
Demo: [Customer Name]
Date: [Date]
Branch: demo/[customer-slug]-[YYYY-MM]
Worktree: /Users/casey.lisak/Dev/metafi-worktrees/demo-[customer-slug]-[YYYY-MM]
Contentful env: [customer-slug]
Theme: [data-theme='[customer-slug]']
Demo loops: [list]
DEMO_SCRIPT.md: ✅
Pre-demo checklist: see DEMO_SCRIPT.md
```

Remind user: when the demo is done, run the **post-demo audit**:
- Did we build anything new that should go back to main?
- Any new component → open PR to main
- Archive the branch (don't delete — keep for reference)
