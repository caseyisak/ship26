# Tasks: AIO / AEO / GEO Demo Loop
**Spec:** `001-aio-aeo-geo-demo`
**Start:** Create worktree + branch before any code tasks

```bash
bash scripts/worktree-add.sh feat/aio-aeo-geo-demo
# Then open new CC instance pointed at the worktree
```

---

## M1 — Contentful: Create `aioAeoGeo` content type
**Tool:** Contentful MCP (`mcp__contentful__create_content_type`, `mcp__contentful__publish_content_type`)
**Space:** `uumzxfocy3ef` | **Env:** `master`

Fields to create:
| Field ID | Name | Type | Required |
|----------|------|------|----------|
| `internalName` | Internal Name | Symbol | ✅ (display field) |
| `topic` | Topic | Symbol | — |
| `ownerTeam` | Owner Team | Symbol | — |
| `lastUpdated` | Last Updated | Date | — |
| `region` | Region | Symbol | — |

Content type description: "Governance metadata for FAQ entries — enables AIO/AEO by tagging structured Q&A with topic ownership, regional applicability, and review cadence for AI crawlers and answer engines."

**Validate:** `mcp__contentful__get_content_type` returns all 5 fields + published

---

## M2 — Contentful: Add `aioAeoGeo` link field to `faqitem`
**Tool:** `mcp__contentful__update_content_type`
**Target:** content type ID `faqitem`

Add field:
- ID: `aioAeoGeo`
- Name: AI Optimization Metadata
- Type: Array of Entry links
- Validation: `linkContentType: ["aioAeoGeo"]`
- Items limit: 1 (max for V1 demos)

Re-publish `faqitem` after update.

**Validate:** `mcp__contentful__get_content_type faqitem` shows `aioAeoGeo` array field

---

## M3 — Contentful: Seed governance entries + FAQ entries
**Tool:** `mcp__contentful__create_entry`, `mcp__contentful__publish_entry`

Create 4 `aioAeoGeo` entries (publish each before moving on):

| internalName | topic | ownerTeam | region | lastUpdated |
|---|---|---|---|---|
| Data Privacy Governance | data_privacy | Legal | global | 2026-03-01 |
| Pricing Governance | pricing | Product Marketing | US | 2026-03-15 |
| Product Support Governance | product_support | Customer Success | global | 2026-02-28 |
| Compliance Governance | compliance | Compliance | EU | 2026-03-10 |

Create 6 `faqitem` entries (publish each), linked to appropriate governance entry:

| question | answer (keep concise, 2-3 sentences) | governance link |
|---|---|---|
| How is my data protected? | [data privacy answer] | Data Privacy Governance |
| What's included in each plan? | [pricing tiers answer] | Pricing Governance |
| How long does onboarding take? | [onboarding answer] | Product Support Governance |
| Can I export my data? | [data export answer] | Data Privacy Governance |
| What compliance certifications do you hold? | [SOC2/ISO answer] | Compliance Governance |
| How do I get support? | [support channels answer] | Product Support Governance |

**Validate:** `mcp__contentful__search_entries` returns 4 `aioAeoGeo` + 6 `faqitem` published entries

---

## M4 — Code: GraphQL fragment + TypeScript types
**Files:** `src/services/contentful/queries.ts`, `src/block-renderer/types.ts`

### `queries.ts`
Add above `FAQ_ITEM_FIELDS`:
```ts
const AIO_AEO_GEO_FIELDS = `
  __typename
  sys { id }
  ... on AioAeoGeo {
    internalName
    topic
    ownerTeam
    lastUpdated
    region
  }
`;
```

Extend `FAQ_ITEM_FIELDS`:
```ts
// Inside ... on Faqitem { }
aioAeoGeoCollection(limit: 1) {
  items {
    ${AIO_AEO_GEO_FIELDS}
  }
}
```

### `types.ts`
Add:
```ts
export type AioAeoGeoFragment = {
  __typename: 'AioAeoGeo';
  sys: { id: string };
  internalName: string;
  topic?: string | null;
  ownerTeam?: string | null;
  lastUpdated?: string | null;
  region?: string | null;
};
```

Extend `FaqItemFragment`:
```ts
aioAeoGeoCollection?: { items: AioAeoGeoFragment[] } | null;
```

**Validate:** `bunx tsc --noEmit` — no errors

---

## M5 — Code: `/demo/faq-aeo` page
**File:** `src/app/demo/faq-aeo/page.tsx` (create)

Layout: two-column split, full-width, no nav chrome.

Left column — "Before":
- Label: `No structured data` (red/gray badge)
- Renders `<MetafiFaq />` from `src/components/sections/metafi-faq.tsx` — import as-is, no props
- Below it: `<AiSimulationCard variant="unstructured" />` — vague hedged answer

Right column — "After":
- Label: `FAQPage schema + Live Preview` (green badge)
- Fetches FAQ entry by ID (use the main FAQ entry from Contentful master) via Preview API
- Wraps with `ContentfulLivePreview` / `useLiveUpdates` (follow existing preview route patterns)
- Renders `<Faq data={liveData} />` — existing CMS component
- Below it: `<AioAeoPreviewPanel data={liveData} />` — new component

Page should be accessible at `/demo/faq-aeo` without auth.

**Validate:** Page loads, both panels visible, no console errors

---

## M6 — Code: FAQPage JSON-LD in `faq.tsx`
**File:** `src/cms-components/faq/faq.tsx` (modify)

Add inside the `Faq` component, after `useLiveUpdates`:
```tsx
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.question ?? '',
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer ?? '',
    },
  })),
};
```

Inject via Next.js script tag:
```tsx
<script
  id="faq-jsonld"
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

This updates automatically because `items` comes from `liveData` which is wired to `useLiveUpdates`.

**Validate:** Inspect page source on `/demo/faq-aeo` right panel — `application/ld+json` script present with correct shape

---

## M7 — Code: `AioAeoPreviewPanel` component
**Files:** `src/components/demo/AioAeoPreviewPanel.tsx` (create)

Props: `{ data: FaqFragment }`

Renders:
1. **GovernanceBadges** — map over `items[0].aioAeoGeoCollection?.items[0]` and show:
   - `topic` chip (blue)
   - `ownerTeam` chip (gray)
   - `region` chip (gray)
   - `lastUpdated` formatted as "Last reviewed: MMM YYYY" (green)
   - If no governance data: show faded "No governance metadata" placeholder

2. **AI Overview mock** — styled card resembling a Google AI Overview:
   - Header: "AI Overview" with Google-style multicolor dot icon
   - Body: First FAQ item's answer (or a derived 1-2 sentence summary)
   - Source attribution: "Source: [site] · FAQPage schema"
   - Confidence indicator: if governance metadata present → "High confidence" badge; if absent → "Low confidence / may vary"

3. **JSON-LD drawer** — collapsible `<details>` element:
   - Label: "View Structured Data ↓"
   - Content: syntax-highlighted JSON of the FAQPage schema derived from live data
   - Note: "This is what answer engines read. Generated automatically from Contentful entries."

All values are derived from `data` (the live-updated `FaqFragment`) — no separate fetch.

**The left panel's `AiSimulationCard variant="unstructured"`** is a simpler version of the same UI but with:
- Body: "Based on various sources, answers may vary. Check the company website for current information." (static, never updates)
- No source attribution
- No confidence badge
- No JSON-LD drawer (or drawer shows empty / "No schema detected")

**Validate:** Right panel AI simulation updates when FAQ answer is changed in Contentful (live preview active)

---

## M8 — Docs: Demo loop bundle
**Files:** `demo-loops/README.md`, `demo-loops/aio-aeo-geo/` (all files)

### `demo-loops/README.md`
Documents the standard pattern for all demo loops:
- What a demo loop is and when to use it
- Folder structure every loop must follow
- How CC uses bundles when a prospect demo is being planned
- How to activate a loop for a new prospect (swap entries, new env, brand scrape)
- Link to first reference implementation: `aio-aeo-geo/`

### `demo-loops/aio-aeo-geo/README.md` (SE-facing)
Structure (mirrors Demo OS module format):
- **Overview**: 1-paragraph pitch — what this demo shows and why it matters
- **When to use**: Signal phrases a prospect might say that trigger this loop
- **Talk track**: Tell-Show-Tell structure with actual SE language
- **Click path**: Step-by-step what to click and in what order
- **Value to the user (champion)**: What the marketer/content person gets
- **Value to the org (economic buyer)**: What the CTO/CMO gets
- **Risk of inaction**: What happens if they don't structure their content ("the 'based on various sources' problem")
- **Discovery questions** (from VMF + AE→SE framework)
- **Trap-setting questions** (from VMF)
- **Objection handling** (common pushbacks + response language)
- **Proof points** (from VMF — relevant customer outcomes)

### `demo-loops/aio-aeo-geo/AI-CONTEXT.md` (CC-facing)
- Component paths + purpose
- Content type IDs + field schemas
- GraphQL fragment names + location in codebase
- TypeScript type names + location
- Contentful entry IDs for the seed data
- Preview route + how to activate live preview
- Env vars required
- "How to adapt for a new prospect" — what to swap, what stays fixed

### `demo-loops/aio-aeo-geo/DEMO_SCRIPT.md`
Full Tell-Show-Tell script with:
- Pre-demo setup checklist
- Act 1: The Problem (talking points, no clicks)
- Act 2: The Before (click path on left panel)
- Act 3: The After + Live Edit moment (the aha)
- Act 4: The Pitch (close + next steps)
- Timing guidance per act

### `demo-loops/aio-aeo-geo/content-types/`
- `aioAeoGeo.json` — full content type schema (for re-seeding in new envs)
- `faqitem-patch.json` — the field addition to `faqitem`

### `demo-loops/aio-aeo-geo/seed-entries/`
- `governance-entries.json` — the 4 `aioAeoGeo` entries
- `faqitem-entries.json` — the 6 FAQ entries

**Validate:** All files present, AI-CONTEXT.md has accurate paths (verify each path exists in codebase)

---

## Final validation checklist

- [ ] `bunx tsc --noEmit` — clean
- [ ] `bun run build` — no errors
- [ ] `/demo/faq-aeo` loads in browser
- [ ] Both panels render
- [ ] Live edit loop works (edit Contentful → right panel updates)
- [ ] JSON-LD drawer shows correct schema
- [ ] Governance badges appear on right panel
- [ ] Left AI card looks different from right AI card
- [ ] All demo-loops bundle files present and accurate
- [ ] Commit + PR to main
