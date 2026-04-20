# AI-CONTEXT.md — AIO / AEO / GEO Demo Loop

This file is for Claude Code. It provides the exact paths, entry IDs, and adaptation instructions needed to work with this demo loop.

---

## Component paths

| Component | Path | Purpose |
|-----------|------|---------|
| Demo page | `src/app/demo/faq-aeo/page.tsx` | Server component — fetches FAQ data, renders split layout |
| After panel wrapper | `src/components/demo/FaqAeoAfterPanel.tsx` | Client component — subscribes to live updates, renders Faq + AioAeoPreviewPanel |
| AI Overview + governance panel | `src/components/demo/AioAeoPreviewPanel.tsx` | Renders governance badges, AI Overview mock, JSON-LD drawer |
| AI simulation card (Before) | `src/components/demo/AiSimulationCard.tsx` | Static unstructured AI answer for left panel |
| CMS FAQ component | `src/cms-components/faq/faq.tsx` | Modified to inject FAQPage JSON-LD script tag |
| Static FAQ (Before panel) | `src/components/sections/metafi-faq.tsx` | Hardcoded FAQ — import as-is, no props |

## Content type IDs

| Content Type | ID | Description |
|---|---|---|
| AIO/AEO/GEO Governance | `aioAeoGeo` | Governance metadata: topic, ownerTeam, lastUpdated, region |
| FAQ Item | `faqitem` | Extended with `aioAeoGeoCollection` array field (max 1) |
| FAQ | `faq` | Parent container — links to faqitem entries |

## GraphQL fragments

| Fragment | Location | Notes |
|----------|----------|-------|
| `AIO_AEO_GEO_FIELDS` | `src/services/contentful/queries.ts` | New — topic, ownerTeam, lastUpdated, region |
| `FAQ_ITEM_FIELDS` | `src/services/contentful/queries.ts` | Extended with `aioAeoGeoCollection(limit: 1)` |

## TypeScript types

| Type | Location |
|------|----------|
| `AioAeoGeoFragment` | `src/block-renderer/types.ts` |
| `FaqItemFragment` | `src/block-renderer/types.ts` — extended with `aioAeoGeoCollection` |

## Contentful entry IDs (master env)

| Entry | Content Type | ID |
|-------|---|---|
| Metafi AEO Demo FAQ | `faq` | `4U4M6wZA96houeEr8SVGiB` |
| FAQ: How is my data protected? | `faqitem` | `5lSrZBhKEzUTyrTq1Gn1PW` |
| FAQ: What's included in each plan? | `faqitem` | `dNaVCN3YfugCq96jRnrUr` |
| FAQ: How long does onboarding take? | `faqitem` | `2o0nGihQs97QjWhgkSJgK3` |
| FAQ: Can I export my data? | `faqitem` | `1iMg2Rx30UG94wSU31HjSr` |
| FAQ: What compliance certifications? | `faqitem` | `65jQzT3lhm6RTaM7aLVr8i` |
| FAQ: How do I get support? | `faqitem` | `3nLaRNcri3JeNY5dD8ur3R` |
| Data Privacy Governance | `aioAeoGeo` | `6nm4fpps00zGUNEvrAAmnj` |
| Pricing Governance | `aioAeoGeo` | `4jqYg8GDUgWnshttOYkn70` |
| Product Support Governance | `aioAeoGeo` | `1lf4UtdPayLvRKWKFU35oC` |
| Compliance Governance | `aioAeoGeo` | `7Ifq0UkQFT33GAqZUIbON7` |

## Demo route

- URL: `/demo/faq-aeo`
- No auth required
- Fetches FAQ data via preview API (draft mode) — shows latest draft content

## Live preview

The `FaqAeoAfterPanel` client component calls `useLiveUpdates(data)` from `@/lib/live-preview`. The `LivePreviewProvider` is already in the root layout (`src/app/layout.tsx` → `LivePreviewProviderWrapper`). No additional setup needed.

The JSON-LD script tag in `faq.tsx` re-renders automatically because it derives from `liveData` which is the live-updated version.

## Env vars required

```
CONTENTFUL_SPACE_ID=uumzxfocy3ef
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_ACCESS_TOKEN=<delivery token>
CONTENTFUL_PREVIEW_ACCESS_TOKEN=<preview token>
```

## How to adapt for a new prospect

**What to swap:**
- Create 4 new `aioAeoGeo` entries matching the prospect's team structure (Legal → their legal dept name, etc.)
- Create 6 new `faqitem` entries with prospect-specific Q&A content
- Create a new `faq` entry linking the new faqitems
- Update `AEO_FAQ_ENTRY_ID` constant in `src/app/demo/faq-aeo/page.tsx` to the new FAQ entry ID
- Apply brand tokens via `siteSettings` entry

**What stays fixed:**
- The component code — no changes needed
- The content types — `aioAeoGeo` and the `faqitem.aioAeoGeoCollection` field
- The GraphQL fragment and TypeScript types
- The page route `/demo/faq-aeo`

**Time to adapt:** ~30 minutes (create entries in Contentful, update 1 constant)
