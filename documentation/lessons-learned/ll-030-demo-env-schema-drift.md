# LL-030 — Demo env schema drift: blank content after re-spinning old demo

## Symptom

Re-spinning a customer demo that previously worked. Dev server boots clean, no GraphQL errors in terminal, but content slots are blank — hero headline missing, banner text missing, twoAcross heading missing. Live preview loads but nothing updates. Newsletter renders but promoSlot is empty.

## Root cause

The main sandbox (`master` env + `main` branch) systematically migrated all `Symbol`/`Text` headline fields to `RichText` fields with an `Rt` suffix (e.g. `headline` → `headlineRt`, `subheadline` → `subheadlineRt`, `eyebrow` → `eyebrowRt`, `heading` → `headingRt`). This happened after the customer demo env was created.

The old demo env entries were written against the OLD field IDs. The current codebase queries the NEW field IDs. GraphQL returns null for fields that exist in the query but not in the entry — silently, no error. The entry has data in `headline` but the query asks for `headlineRt`. Nothing renders.

**Affected CTs from the 2026-04 migration:**
- `hero`: `headline` / `subheadline` → `headlineRt` / `subheadlineRt`
- `banner`: `headline` / `subheadline` / `copy` → `headlineRt` / `subheadlineRt` (`copy` dropped)
- `twoAcross`: `eyebrow` / `heading` → `eyebrowRt` / `headingRt`
- `faq`: `title` / `description` → `titleRt` / `descriptionRt`
- `faqitem`: `question` / `answer` → `questionRt` / `answerRt`
- `newsletter`: `leadStory` reference → `promoSlot` reference; `slug` field omitted

## Fix

Do NOT patch the old demo env. Create a fresh env from `master` and migrate the content:

1. Create new env from `master` (gets updated CT schema)
2. Read all source entries from old demo env
3. For each entry, map old field ID → new field ID, convert Symbol text → RichText document format:
```json
{
  "nodeType": "document",
  "data": {},
  "content": [{
    "nodeType": "paragraph",
    "data": {},
    "content": [{ "nodeType": "text", "value": "Your text", "marks": [], "data": {} }]
  }]
}
```
4. Create new entries in the new env with mapped field IDs
5. Rebuild page/home to reference new entry IDs

The Contentful MCP agent approach (see `documentation/handoff-punchbowl-2-setup.md`) handled this in ~10 min of agent time for ~25 entries.

## Prevention

See NEW-DEMO-RUNBOOK.md → "Re-spinning an existing demo" section.

**Rule of thumb:** If it has been >4 weeks since a demo env was created, assume schema drift. Create a new env from master rather than running the old demo env against the current codebase.

## Related files

- `demo-loops/NEW-DEMO-RUNBOOK.md` — Re-spin checklist
- `documentation/handoff-punchbowl-2-setup.md` — Full punchbowl migration map (old→new entry IDs)
- `src/services/contentful/newsletter.ts` — Current newsletter field names (promoSlot, not leadStory)
- `src/services/contentful/queries.ts` — Current field IDs for all blocks
