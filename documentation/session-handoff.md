# Session Handoff — 2026-03-27

## Branch
`main` (all work happens here; new branch `feat/aio-aeo-geo-demo` to be created at start of next session)

## What was decided this session

### Initiative: AIO / AEO / GEO Demo Loop

Full planning session for an AI Answer Optimization demo built on top of the existing FAQ block. The goal: show prospects how Contentful-structured content with governance metadata becomes the single source of truth that feeds Google AI Overviews, ChatGPT citations, and any AI channel — consistently.

**The demo story:** One governed FAQ entry in Contentful → consistent answers across all AI surfaces. Change the answer once → every channel updates. This is the "one source of truth" narrative made visible.

---

## Everything you need to know to execute

### Source material (read these if context feels thin)
- **PRD** (already written): `~/Dev/kaz glean/project/prd/faq-aio-aeo-demo.md` — the V1 spec, file map, demo script, success criteria
- **Glean synthesis**: `~/Dev/kaz glean/project/context/glean-aio-aeo-synthesis.md` — AIO/AEO thesis + Contentful angles
- **SE Standards**: `~/Documents/SE Discovery, Demo & POC Standards.md` — Tell-Show-Tell framework, guardrails, objection scripts
- **VMF**: `~/Documents/Contentful Value Messaging Framework.md` — 4 value drivers, proof points, trap-setting Qs
- **Discovery framework**: `~/Documents/AE → SE Discovery Framework_ Getting to a Demo That Matters.md`
- **Spec + tasks**: `.claude/specs/001-aio-aeo-geo-demo/` (written this session — start here)

### The "Before" panel already exists
`src/components/sections/metafi-faq.tsx` — hardcoded static FAQ with no Contentful connection. **Use as-is** for the Before state. Zero extra work.

### The "After" panel is what we're building
`src/cms-components/faq/faq.tsx` — already Contentful-connected with live preview. Extend with:
- `aioAeoGeo` governance link field on each `faqitem`
- `FAQPage` JSON-LD emitted from live data
- `AioAeoPreviewPanel` — simulated AI Overview + governance badges + JSON-LD drawer

### The demo moment
SE has Contentful open (entry editor) and `/demo/faq-aeo` open in another tab. Edit FAQ answer in Contentful → accordion on the After panel updates live + AI Overview simulation updates. "One change. Every surface."

---

## Reconciled plan (PRD V1 + governance layer from this session)

The PRD said "no content model changes for V1" — but the governance metadata (`aioAeoGeo` content type) is what makes the "metadata made a difference" story land. We're building both together.

**The key architectural decision:** The Before panel intentionally has NO governance metadata. The After panel has the structured FAQ + `aioAeoGeo` metadata. The AI simulation on the left is vague/hedged; on the right it's confident and citable. The contrast is the demo.

---

## Milestones (execution order)

| # | What | Where | Notes |
|---|------|--------|-------|
| M1 | Create `aioAeoGeo` content type | Contentful MCP | 5 fields: internalName, topic, ownerTeam, lastUpdated, region |
| M2 | Add `aioAeoGeo` link field to `faqitem` | Contentful MCP | Array, linkContentType: aioAeoGeo, max 1 |
| M3 | Seed 4 governance entries + 6 FAQ entries (generic topics) | Contentful MCP | Generic topics: data_privacy, pricing, product_support, compliance |
| M4 | `AIO_AEO_GEO_FIELDS` GraphQL fragment + TypeScript types | `queries.ts`, `types.ts` | Extend FAQ_ITEM_FIELDS, add AioAeoGeoFragment |
| M5 | `/demo/faq-aeo` page — Before/After split layout | `src/app/demo/faq-aeo/page.tsx` | Left: metafi-faq.tsx, Right: Faq CMS component |
| M6 | Extend `faq.tsx` — FAQPage JSON-LD that updates live | `src/cms-components/faq/faq.tsx` | Derived from liveData items, updates via useLiveUpdates |
| M7 | `AioAeoPreviewPanel` component | `src/components/demo/` | AI Overview mock + governance badges + JSON-LD drawer |
| M8 | `demo-loops/` standard + `aio-aeo-geo/` bundle | `demo-loops/` | SE README, AI-CONTEXT, DEMO_SCRIPT, schema JSONs, seed JSONs |

Full tasks with validation steps: `.claude/specs/001-aio-aeo-geo-demo/tasks.md`

---

## Key decisions already made

- **No vertical lock-in**: Content type fields and FAQ topics are generic (data_privacy, pricing, etc.) — swappable for any prospect vertical without code changes
- **Before side is honest**: Left panel uses real static component, not fabricated. Right panel is live Contentful data. Same answer text, different structure.
- **JSON-LD is generated, not stored**: Dynamic from live entry data in a collapsible drawer. No separate field for editors to manage.
- **Contentful live preview (iframe mode)**: Default approach. SE shows Contentful entry editor with the preview panel. Real-time updates, no polling.
- **`SchemaStatusBadge` folded into `AioAeoPreviewPanel`**: Keeps component count low.
- **`demo-loops/README.md`** establishes the standard for all future demo loops (this is Loop 1).
- **Demo OS integration is a fast-follow**: The `demo-loops/` directory in metafi is the technical asset library; a separate `~/Dev/demo-os/` repo will be the playbook/assembly layer. Not blocking this build.

---

## How to start next session

```
/piv prime
```

Then: "Let's execute the AIO/AEO/GEO demo — start with M1." Tasks are in `.claude/specs/001-aio-aeo-geo-demo/tasks.md`. Create branch `feat/aio-aeo-geo-demo` via worktree before starting any code.
