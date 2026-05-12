---
name: write-demo-loop
description: Write or update demo loop LOOP.md files. Use when the user says "write a demo loop", "create a loop", "add a loop for [feature]", "write the loop doc", "document this demo loop", "write a baseline loop", or "tailor this loop for [customer]". Also invoke after building a new sandbox feature that should be available to demos.
version: 1.0.0
author: casey-lisak
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Write Demo Loop Skill

Demo loops are the atomic unit of a Contentful demo. Each loop is a self-contained, repeatable story that shows one customer pain being solved — written for an SE to deliver, not read.

**Two-tier system:**
1. **Sandbox baseline** — generic, audience-agnostic loop in `demo-loops/sandbox/loops/`. Works for any customer. The source of truth.
2. **Customer-tailored loop** — a fork of the baseline in `demo-loops/[customer]/loops/` that replaces placeholders with real quotes, roles, industry refs, and a tailored talk track. Produced by Demo-OS using call transcripts.

This skill handles **both tiers**. Default to writing the sandbox baseline first. Tailoring happens when you have customer call data.

---

## Schema contract

The authoritative format is `demo-loops/_schema.md`. Read it before writing any LOOP.md. Key rules:
- YAML frontmatter first — every field is required
- Sections in order: frontmatter → one-liner → Tell (pain) → Show (click path) → Tell (outcomes) → Entry Reference → Reset Checklist
- Every Contentful entry in the loop gets a row in Entry Reference with its ID
- Every step in the click path starts with `[Contentful]`, `[Browser]`, or `[Preview]`
- Direct links on every step — no searching during a demo

---

## Phase 0 — Classify the loop

Before writing, determine:

1. **Tier** — sandbox baseline or customer-tailored?
2. **Build type** — how was/will this be built?
   - `ootb` — native Contentful features only, no custom code
   - `sandbox` — uses existing metafi sandbox components + Contentful entries
   - `net-new` — required a new content type or component
3. **Promotion status**
   - `demo-only` — customer branch only, not ready for sandbox
   - `candidate` — landed well, GH issue queued for main
   - `sandbox` — already in main, available to all demos
4. **What pain does this loop address?** — write 3–5 `pain_signals` as verbatim phrases a customer would say

If net-new: check `demo-loops/DEMO-OS.md` blocks inventory first. Only build net-new if nothing in sandbox covers it.

---

## Phase 1 — Write the sandbox baseline

**Output location:** `demo-loops/sandbox/loops/loop-[letter]-[short-name]/LOOP.md`

Use letter sequencing: A, B, C... (check existing loops in `demo-loops/sandbox/loops/` for current max).

### Baseline writing rules

- **Personas:** Use generic roles (`Marketing Leader`, `Growth Marketer`, `Digital Experience Lead`, `Product Manager`). Do NOT name specific people.
- **Industries:** Default to `[All]` unless the loop is genuinely industry-specific.
- **Talk track:** Write for delivery, not reading. 2–4 sentence max per Tell section. No bullet walls.
- **Click path:** Every step must be atomic. If a step requires judgment, break it into two steps.
- **Entry IDs:** Use real IDs if entries exist. Use `TBD — [description]` if entries need to be created. Never leave an ID blank without noting it.
- **Reset checklist:** Think about what could go wrong before a live demo. Capture every state dependency.
- **Pricing page intent:** If the loop involves high-intent signals, include a step showing the visitor on `/page/pricing`.

### Baseline LOOP.md template

```markdown
---
id: loop-[letter]-[short-name]
customer: sandbox
build_type: ootb | sandbox | net-new
promotion_status: sandbox
personas:
  - [Role 1]
  - [Role 2]
industries:
  - All
pain_signals:
  - "[phrase a customer would say]"
  - "[phrase a customer would say]"
contentful_features:
  - [Feature name]
content_types:
  - id: [ct-id]
    status: existing | net-new
    note: [one line]
components:
  - [component or 'none']
setup_minutes: [N]
---

**What this shows:** [One sentence. Lead with customer outcome, not feature.]

---

## Tell — Reflect Their Pain

[2–4 sentences. SE says this, not reads it. Acknowledge the pain before showing the solution.]

---

## Show — Click Path

1. [Contentful] Open **[Entry Name]** → https://app.contentful.com/spaces/uumzxfocy3ef/entries/[ID]
2. [Browser] Navigate to http://localhost:3000/page/[slug]?preview=true
3. [Contentful] Edit **[field]** → [what to change]
4. [Browser] Show [what the visitor sees change]

---

## Tell — Tie to Outcomes

- [Outcome 1 — speed, control, personalization, scale]
- [Outcome 2]
- [Outcome 3 — optionally include an urgency/realism line]

---

## Entry Reference

| Entry | Content Type | ID | Status | Preview URL |
|---|---|---|---|---|
| [Name] | [CT] | [ID] | published | http://localhost:3000/preview/[type]/[ID]?preview=true |

---

## Reset Checklist

- [ ] [Entry] is published and in expected state
- [ ] Dev server running at localhost:3000
- [ ] Logged in as correct persona (if applicable)
- [ ] NT preview panel accessible via gear icon
```

---

## Phase 2 — Tailor for a customer (Demo-OS mode)

Only do this when you have customer data: call transcript, discovery notes, or a brief from the SE/AE.

**Output location:** `demo-loops/[customer-slug]/loops/loop-[letter]-[short-name]/LOOP.md`

Start from the sandbox baseline. Replace:

| Placeholder | Replace with |
|---|---|
| Generic pain signals | Exact quotes from the call transcript |
| Generic personas | Named roles from the customer's org |
| Generic industry callouts | Customer's specific industry |
| Generic outcomes | Outcomes tied to their stated goals / KPIs |
| "Metafi" product refs | Customer's product or brand where relevant |
| Generic entry IDs | Customer Contentful env entry IDs |

**Talk track tailoring rules:**
- Pull 1–2 direct quotes from the transcript. Use them verbatim in the Tell sections.
- Name the stakeholder type: "Your Head of Digital said..." or "Teams like yours told us..."
- Tie Loop C (high intent) to Loop B (returning) to Loop A (new visitor) — each loop should reference the previous and set up the next. A cohesive story arc beats three isolated demos.
- Add an "AI conversion guide" section if the loop can be pitched with an AI/CMS angle.

### Story arc guidance

When tailoring 3+ loops into a demo set, sequence them:

1. **Loop A (New Visitor)** — establish the problem: "Here's your world without Contentful."
2. **Loop B (Returning)** — show the possibility: "Here's what personalization looks like when it's content-driven."
3. **Loop C (High Intent)** — close on urgency: "And here's how you capture the moment a buyer signals intent — automatically."

Each loop's Tell — Tie to Outcomes should feed the next loop's Tell — Reflect Their Pain. Make them feel like chapters, not individual features.

---

## Phase 3 — Update DEMO-OS.md

After writing any LOOP.md, add one row to the loop table in `demo-loops/DEMO-OS.md`.

The row format mirrors the frontmatter. Do not add prose — DEMO-OS.md is a structured index only.

If the loop is `promotion_status: candidate`, also file a GitHub issue:
```
gh issue create --title "Promote loop-[letter]-[short-name] to sandbox" \
  --body "Candidate loop from [customer] demo. [One line on why it's reusable.]"
```

---

## Phase 4 — Confirm

Report back:
- File path(s) written
- Entry IDs that are TBD and need to be created
- Promotion status and any GH issue filed
- Whether this loop has a clear connection to adjacent loops (story arc)
- Any reset checklist items that require manual prep before demo day
