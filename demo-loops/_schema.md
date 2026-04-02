# Demo-OS Loop Bundle Schema

Format contract for all demo loop bundles. Glean reads this to know what to expect from each bundle. CC reads this when building net-new loops to know exactly what files to produce.

---

## Bundle structure

```
demo-loops/
  [customer-slug]/
    loops/
      loop-[letter]-[short-name]/
        LOOP.md       ← SE/AE facing: talk track, click path, entry IDs, reset checklist
```

Every loop is one folder, one LOOP.md. No other files required for MVP.

---

## LOOP.md format spec

Every LOOP.md must contain the following sections in this order.

---

### 1. Frontmatter (YAML)

```yaml
---
id: loop-[letter]-[short-name]                    # e.g. loop-a-one-game-all-channels
customer: [customer-slug]                          # e.g. bears
build_type: ootb | sandbox | net-new               # how was this built?
  # ootb    = uses only native Contentful features, no custom code
  # sandbox = uses existing metafi sandbox components
  # net-new = required building a new CT or component
promotion_status: demo-only | candidate | sandbox  # lifecycle stage
  # demo-only  = lives in this demo branch only
  # candidate  = landed well, queued for GH issue + main sandbox
  # sandbox    = already in main sandbox, available to all opps
personas:                                          # who this lands with
  - [role]
industries:                                        # relevant industries
  - [industry]
pain_signals:                                      # phrases from call transcripts that map to this loop
  - "[exact phrase or paraphrase a customer would say]"
contentful_features:                               # OOTB Contentful features this demo uses
  - [feature name]
content_types:                                     # CTs required (existing or net-new)
  - id: [ct-id]
    status: existing | net-new
    note: [one line — what it does in this loop]
components:                                        # frontend components required
  - [component name or 'none']
setup_minutes: [N]                                 # realistic setup time before demo
---
```

---

### 2. One-line summary

```
**What this shows:** [One sentence. Lead with the customer outcome, not the feature.]
```

---

### 3. Tell — Reflect Their Pain

The opening narrative. Written for the SE to say, not to read. 2-4 sentences max. Persona-specific callouts if relevant.

---

### 4. Show — Click Path

Numbered steps. Each step starts with either:
- `[Contentful]` — action in the Contentful UI
- `[Browser]` — action on the demo site
- `[Preview]` — open a preview route

Include direct links for every Contentful entry and every browser route. No step should require the SE to search for anything.

```
1. [Contentful] Open **[Entry Name]** → [https://app.contentful.com/...]
2. [Browser] Navigate to [http://localhost:3000/...]
3. ...
```

---

### 5. Tell — Tie to Outcomes

The close. Persona-specific value statements. 2-3 bullets. Optionally include an urgency/realism line.

---

### 6. Entry Reference

A table of every Contentful entry used in this loop.

| Entry | Content Type | ID | Status | Preview URL |
|---|---|---|---|---|
| [Name] | [CT] | [ID] | published / draft | [URL or —] |

---

### 7. Reset Checklist

What must be true before running this loop in a demo. Each item is a checkbox.

```
- [ ] [entry name] is in [expected state]
- [ ] Dev server running at localhost:3000 from correct worktree
- [ ] ...
```

---

## DEMO-OS.md update rule

When a new loop bundle is created, add one row to the loop table in `demo-loops/DEMO-OS.md`. The row format matches the frontmatter fields. Do not add prose to DEMO-OS.md — it is a structured index only.

When a loop's `promotion_status` changes (e.g. from `candidate` to `sandbox`), update both the LOOP.md frontmatter and the DEMO-OS.md row.

---

## Build decision guidance for CC

Before building a net-new loop, check in this order:

1. **Can OOTB Contentful cover it?** — Check the OOTB features table in DEMO-OS.md. If yes, no build needed. Document the OOTB feature usage in the LOOP.md frontmatter.

2. **Does an existing sandbox component cover it?** — Check the sandbox inventory in DEMO-OS.md. If yes, create the loop bundle with `build_type: sandbox`. May need new Contentful entries but no new code.

3. **Is net-new justified?** — A net-new CT or component is justified when:
   - It unlocks a demo mechanic that can't be shown with existing types (e.g. `game` CT enabling "one entry seeds all surfaces")
   - It has a realistic path to reuse across at least 2 other customer types
   - The build time is proportionate to the opp size

   If yes: `build_type: net-new`, set `promotion_status: candidate` from day one.
