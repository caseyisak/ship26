# New Demo Setup Runbook

How to spin up a new customer demo from scratch. Written from the bears experience — captures every pain point and gotcha so the next demo goes faster.

**Time estimate:** ~2 hours to fully working demo with personalization. ~45 min if skipping NT.

---

## 🔴 Manual Intervention Checklist

**These steps CANNOT be automated by CC or MCP. They require a human in the browser.**
CC will remind you at the right point in the build — but print this list and check off each item before calling the demo "ready."

| # | Step | Where | When |
|---|------|--------|------|
| M1 | **Add new env to Contentful API key** | Contentful → Settings → API Keys → [key] → Environments tab → add env → Save | Immediately after creating the Contentful env (Step 3) |
| M2 | **Connect NT Personalization app to new env** | Contentful → Apps → Contentful Personalization → click Connect | After API key is scoped (M1) |
| M3 | **Enable personalizable content types in NT app** | Contentful Personalization app → Personalizable content types tab → enable each CT | After connecting NT app (M2) |
| M4 | **Omit field collisions caused by NT app** | Contentful → Content model → [each CT] → omit `ntExperiences` (camelCase) field | Immediately after M3 — see LL-016 |
| M5 | **Add NT API key to .env.local** | Worktree `.env.local` | After getting key from NT dashboard |
| M6 | **Link existing NT experiences (not clone)** | Contentful → each baseline entry → NT sidebar → "Link existing experience" | After creating variant entries (Step 8) — see LL-020 |
| M7 | **Publish all NT experience + audience entries** | Contentful → each `nt_experience` + `nt_audience` entry | Before first Playwright verification run |
| M8 | **Visual sign-off** | Browser at localhost:3000 | After Playwright passes — human eyes on every loop |

> **M1 is the most commonly missed.** Without it, every GraphQL call returns `UNKNOWN_ENVIRONMENT` and the app silently 404s. Do it the moment the Contentful env exists — CC will flag it.

---

## Step 1 — Create the worktree

```bash
# From the main metafi-nextjs-shadcnblocks repo
bash scripts/worktree-add.sh demo/[customer]-[YYYY-MM]

# Then open a NEW CC session in that worktree — do not continue in the current one
claude /Users/casey.lisak/Dev/metafi-worktrees/demo-[customer]-[YYYY-MM]
```

**What the script does:** creates worktree, symlinks `node_modules` and `.env`, copies `.env.local`.

⚠️ **Pain from bears:** The script copies `.env.local` from main. Main's `.env.local` has `CONTENTFUL_ENVIRONMENT=master` and `NEXT_PUBLIC_BRAND=metafi`. You MUST update `.env.local` in the worktree immediately — before running any dev server.

---

## Step 2 — Update .env.local for the demo

Edit `[worktree]/.env.local`:

```bash
CONTENTFUL_ENVIRONMENT=[customer]        # must match the new Contentful env name
NEXT_PUBLIC_BRAND=[customer]             # drives data-theme attribute
NEXT_PUBLIC_NINETAILED_API_KEY=[key]     # REQUIRED — use NEXT_PUBLIC_ prefix, not NINETAILED_CLIENT_ID
NEXT_PUBLIC_NINETAILED_ENVIRONMENT=main  # usually main unless you created a separate NT env
```

> 🔴 **MANUAL — M5:** Get `NEXT_PUBLIC_NINETAILED_API_KEY` from NT dashboard → workspace settings. Paste it into `.env.local`. CC cannot read or inject this value.

⚠️ **Pain from bears:** `.env` (symlink to main) uses `NINETAILED_CLIENT_ID` — but the code reads `NEXT_PUBLIC_NINETAILED_API_KEY`. These are different names. Without the correct `NEXT_PUBLIC_` vars in `.env.local`, the NT SDK gets no client ID and personalization silently fails.

---

## Step 3 — Create the Contentful environment

In Contentful UI: Settings → Environments → Add environment → **copy from `master`**.

Name it `[customer]` (same as `CONTENTFUL_ENVIRONMENT` above).

⚠️ **Pain from bears:** Copying from master gives you all the existing content types and components, but does NOT copy:
- The NT Personalization app installation (you have to re-connect it per env — see Step 6)
- Any entries (those are env-specific)

> 🔴 **MANUAL — M1:** Immediately after creating the env, go to Contentful → Settings → API Keys → [your key] → Environments tab → add the new env → Save. **Do this now, before running the dev server.** Without it, every GraphQL call returns `UNKNOWN_ENVIRONMENT`.

---

## Step 4 — Apply the brand theme

Add a `[data-theme='[customer]']` block to `src/app/globals.css`. Use Styleglide or manual CSS vars.

```css
[data-theme='[customer]'] {
  --primary: [hex];
  --primary-foreground: [hex];
  --accent: [hex];
  --accent-foreground: [hex];
  /* etc */
}
```

Use `https://www.styleglide.ai` to generate from brand colors. See existing `[data-theme='bears']` block as a reference.

---

## Step 5 — Start the dev server and verify basics

```bash
bun run dev > /tmp/[customer]-dev.log 2>&1 &
```

Check: `http://localhost:3000/page/[your-home-slug]` returns 200.

⚠️ **Port 3000 is permanently reserved for Contentful live preview.** Never use it for a secondary server. If something else is running on 3000, kill it first.

Verify server is running from the right worktree:
```bash
lsof -i :3000 | grep LISTEN         # get PID
lsof -p [PID] | grep cwd            # must show worktree path, not main repo
```

---

## Step 6 — Connect Contentful Personalization (NT) to the new env

> 🔴 **MANUAL — M2:** In Contentful: Apps → Contentful Personalization → click **Connect** and complete setup. CC cannot do this.

> 🔴 **MANUAL — M3:** Go to **Personalizable content types** tab → enable each CT you want to personalize (e.g. Banner, Hero). CC cannot do this.

> 🔴 **MANUAL — M4 (immediately after M3):** After enabling each CT, check for a pre-existing `ntExperiences` (camelCase) field — the NT app added `nt_experiences` (snake_case), and both generate the identical GraphQL name `ntExperiencesCollection` → 422 error. Omit the old field via MCP or Contentful UI. **Affected in the sandbox:** `banner`, `features`, `faq`, `tabbedcontent`. You WILL hit this if you skip it. See LL-016.

⚠️ **Pain from bears (critical):** When you enable a content type, the NT app adds an `nt_experiences` (snake_case) field to it. If you previously added a manual `ntExperiences` (camelCase) field to that content type, **both fields generate the identical GraphQL name `ntExperiencesCollection`** → GraphQL 422 error → page 404.

---

## Step 6b — Prospect Content Scraping (run in parallel with Steps 5–6)

**Real copy and images make demos land. Generic placeholder content undermines credibility.**

Spin a dedicated scraping agent with WebFetch + Contentful MCP access. Give it:
1. The prospect's site URL
2. The CT field map (field ID → what to look for on the site)
3. Instructions to upload images as Contentful assets

The scraping agent runs in parallel while the main build session handles CT creation and routing.

**Agent brief template:**
```
You are a content research agent. Scrape [prospect-url] for real editorial content.
For each article/story you find, extract:
- title (for blogPost.title)
- excerpt/deck (for blogPost.excerpt)
- body text, 2–3 paragraphs (for blogPost.body)
- hero image CDN URL (for blogPost.heroImage)
- tags/category

Also extract:
- Brand colors (primary, accent, background)
- Logo URL
- Navigation structure (for nav CT entries)

Upload all images to Contentful space [space-id], environment [env], as named assets.
Return a mapping of: field ID → value for each entry to create.

Constraints:
- Use the prospect's actual CDN image URLs — do NOT use Unsplash (403 on WebFetch)
- If WebFetch is blocked, try scraping the sitemap or RSS feed instead
- Match the brand's voice in any generated copy
```

---

## Step 7 — Create demo content

Follow the Demo-OS loop bundles for your chosen loops. Each `LOOP.md` has the content types and entries you need.

**Build decision order:**
1. OOTB Contentful features first (Workflows, Releases, Live Preview) — no build needed
2. Existing sandbox components — just create entries with scraped content from Step 6b
3. Net-new only if it moves the opp

For net-new content types, use the `add-contentful-block` skill. Do not build without it.

**Homepage strategy:** Do not use metafi's default content types for the homepage. Build sections using CTs relevant to the prospect's demo loops. Base the layout on the prospect's actual homepage structure (use the scrape report from Step 6b).

---

## Step 8 — Wire NT personalization (if using Loop D or similar)

⚠️ **CRITICAL — Link, don't clone (LL-020):** Never create a new `nt_experience` entry in the demo env if the experience already exists in `master`. Copying a Contentful environment duplicates NT experience entries with the same `ntExperienceId` — both envs fight for ownership and personalization silently breaks. The NT sidebar will show a "Changed" badge and config edits won't apply.

**The correct NT setup for demo envs:**

1. Create variant content entries (Hero/Banner/etc.) with branded copy — these are new, demo-specific ✅ *(CC can do this via MCP)*
2. Do **NOT** create a new `nt_experience` entry
3. > 🔴 **MANUAL — M6:** On each baseline entry, open the NT Personalization sidebar → click **"Link existing experience"** → select the experience from `master`. Do this for every personalizable entry. CC cannot click this button.
4. Add your variant entries as components in the linked experience *(CC can set this up in NT app UI or MCP)*
5. > 🔴 **MANUAL — M7:** Publish all `nt_experience` and `nt_audience` entries in Contentful before running verification.

If you inherited a cloned experience (copied from master env): remove it from the baseline's `nt_experiences` field, then use "Link existing experience" to reattach the original.

**Only create a net-new `nt_experience` entry** if this demo needs a personalization that doesn't exist in master at all (e.g. a demo-specific audience rule or a completely new experience type).

**`nt_config` format** (exact structure the SDK expects):
```json
{
  "traffic": 1,
  "distribution": [0, 1],
  "components": [{
    "type": "EntryReplacement",
    "baseline": { "id": "[baseline-entry-id]" },
    "variants": [{ "id": "[variant-entry-id]", "hidden": false }]
  }]
}
```

⚠️ **Pain from bears:** `distribution: [0.1, 0.9]` is wrong for a pure personalization — 10% of matching audience still sees baseline. Use `[0, 1]`.

⚠️ **Pain from bears:** `NT_AUDIENCE_FIELDS` must include `ntRules`. Without it, `identify()` fires but the audience never matches (see LL-014). This is **already fixed** in the codebase — just verify `ntRules` is in the query if you ever regenerate it.

⚠️ **Pain from bears:** The NT Personalization app sometimes adds a SECOND `ntExperiencesCollection` block to `nt_experience` content types with duplicate `limit` args → GraphQL field conflict. If `/preview/banner/` returns 404 and there are no visible errors, check `BANNER_BY_ID` for duplicate `ntExperiencesCollection` selections (see LL-017).

---

## Step 9 — Verify the full demo flow

> 🔴 **MANUAL — M8:** After Playwright passes, do a full visual walkthrough in the browser. CC can confirm 200s and no console errors — it cannot judge whether the demo looks right, the copy is on-brand, or the personalization swap is visually convincing.

Run through each loop's reset checklist before rehearsing. Key checks:

- [ ] `http://localhost:3000/page/[home-slug]` loads 200, no console errors
- [ ] NT ⚙️ overlay visible on homepage (confirms NT SDK connected)
- [ ] Preview routes return 200 for each content type you're demoing
- [ ] Login → identify → variant swaps (if using personalization)
- [ ] Logout → resets to anonymous state
- [ ] Live preview: edit a field in Contentful → see it update in the browser iframe

---

## What breaks when swapping Contentful environments mid-session

If you change `CONTENTFUL_ENVIRONMENT` in `.env.local` without restarting the server, you'll see:
- Stale GraphQL responses (server cached old env data)
- 404s on pages that exist in one env but not another
- NT audiences/experiences from the wrong env

**Always restart the dev server after changing `CONTENTFUL_ENVIRONMENT`:**
```bash
pkill -f "next dev" && rm -rf .next && bun run dev > /tmp/[customer]-dev.log 2>&1 &
```

---

## Checklist for "next demo ready"

After the current demo, before starting the next one:

- [ ] Merge current demo branch → `demo/[customer]` (NOT main)
- [ ] Copy `demo-loops/` to main metafi repo and commit
- [ ] File GH issues for anything worth promoting to main sandbox
- [ ] Archive session handoff to `documentation/archive/`
- [ ] Note any new content types or components that should go in next DEMO-OS version
- [ ] Update `demo-loops/DEMO-OS.md`: set promotion_status for anything that landed well

---

## Time estimates per task

| Task | Time |
|---|---|
| Worktree + env setup (Steps 1-5) | 15 min |
| Brand theme | 20 min |
| NT app connection + field collision cleanup | 30 min |
| Creating demo content (entries, mediaWrappers, etc.) | 30-60 min |
| NT personalization wiring | 30 min |
| Full flow verification | 15 min |
| **Total** | **~2.5 hours** |

---

## Files to check at session start

```bash
git log --oneline -5                          # what changed since last session
lsof -i :3000 | grep LISTEN                   # is server running?
lsof -p [PID] | grep cwd                      # is it the right worktree?
cat .env.local                                # right env + NT vars?
curl -s http://localhost:3000/page/[slug] -o /dev/null -w "%{http_code}"  # page loads?
```
