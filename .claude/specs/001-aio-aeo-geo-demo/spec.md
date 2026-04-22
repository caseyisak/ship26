# Spec: AIO / AEO / GEO Demo Loop
**Feature:** `001-aio-aeo-geo-demo`
**Type:** New demo capability
**Branch:** `feat/aio-aeo-geo-demo` (worktree off main)
**Status:** Ready to execute

---

## Problem

The existing FAQ block (`src/cms-components/faq/faq.tsx`) is purely visual — it demonstrates Contentful's live preview but nothing about how structured content feeds AI answer engines. Meanwhile, a parallel hardcoded component (`src/components/sections/metafi-faq.tsx`) shows exactly what most CMS setups look like: unstructured, invisible to AI.

SEs have no way to show prospects *why* Contentful's content model matters for AIO/AEO — the capability exists but there's nothing to point at.

---

## Opportunity

FAQs are the highest-ROI AIO/AEO demo use case:
- `FAQPage` JSON-LD is the most recognized schema type — Google AI Overviews, Perplexity, Bing all cite FAQ-structured content
- The Before/After contrast is instantly legible to any marketer
- Live Preview is already installed — the "aha moment" (edit in Contentful → AI answer updates) costs nothing extra to wire up
- A governance layer (`aioAeoGeo` metadata) makes the Contentful-specific argument: not just FAQ data, but governed, owned, regioned, dated facts

---

## User Story

**As** a Contentful SE running a demo for a prospect interested in AI search / answer engine optimization,
**I want** a dedicated demo page that shows the Before/After contrast of structured vs. unstructured FAQs, with a live-updating AI answer simulation,
**So that** I can demonstrate in under 10 minutes why Contentful's content model is the foundation of any AIO/AEO strategy.

---

## What "done" looks like

1. `/demo/faq-aeo` exists and loads
2. Left panel: hardcoded static FAQ, labeled "No structured data" — visually identical accordion but no live preview, no schema, no governance
3. Right panel: Contentful-connected FAQ with live preview active, governance metadata badges (topic, owner, region, last reviewed), `FAQPage` schema indicator
4. AI Overview simulation below each panel — left is vague/hedged, right is confident with attribution
5. JSON-LD drawer on the right panel (collapsible, syntax-highlighted, updates with live edits)
6. Live edit loop: SE edits FAQ answer in Contentful → right panel accordion updates + AI simulation updates within 2 seconds
7. Demo bundle at `demo-loops/aio-aeo-geo/` with SE README, AI-CONTEXT, and DEMO_SCRIPT

---

## Acceptance Criteria

- [ ] `aioAeoGeo` content type exists in Contentful master env with all 5 fields
- [ ] `faqitem` content type has `aioAeoGeo` link field with validation
- [ ] At least 4 governance entries + 6 FAQ entries published with generic topics
- [ ] `FaqItemFragment` TypeScript type includes `aioAeoGeoCollection`
- [ ] `/demo/faq-aeo` renders Before/After split without errors
- [ ] FAQPage JSON-LD is generated and updates when Contentful content changes via live preview
- [ ] `AioAeoPreviewPanel` renders on the right panel and updates live
- [ ] Left AI simulation and right AI simulation are visually distinct (vague vs. confident)
- [ ] SE can run the demo without a developer present
- [ ] `demo-loops/aio-aeo-geo/` bundle is complete and accurate

---

## Out of Scope (V1)

- Real LLM/AI API calls — AI Overview panel is mocked
- Ninetailed personalization layer
- Multiple locale support
- PolicyRule / Topic / Persona reference types (the deeper content graph)
- RAG pipeline integration
- Real JSON-LD injection into live site `<head>` (demo site only)
- Vertical-specific content (no banking lock-in — generic topics only)

---

## Source Material

- PRD: `~/Dev/kaz glean/project/prd/faq-aio-aeo-demo.md`
- Glean synthesis: `~/Dev/kaz glean/project/context/glean-aio-aeo-synthesis.md`
- SE Standards: `~/Documents/SE Discovery, Demo & POC Standards.md`
- VMF: `~/Documents/Contentful Value Messaging Framework.md`
- Discovery framework: `~/Documents/AE → SE Discovery Framework_ Getting to a Demo That Matters.md`
