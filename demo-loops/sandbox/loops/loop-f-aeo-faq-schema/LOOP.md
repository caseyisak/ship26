---
id: loop-f-aeo-faq-schema
customer: sandbox
build_type: net-new
promotion_status: sandbox
personas:
  - SEO Lead
  - Marketing Director
  - Head of Content
  - Legal/Compliance
industries:
  - B2B SaaS
  - Financial Services
  - Healthcare
  - Media & Publishing
  - E-commerce
pain_signals:
  - "AI Overviews aren't citing us"
  - "We get 'based on various sources' instead of an attributed answer"
  - "We don't know if search engines trust our FAQ content"
  - "Our competitors are getting the AI citation, we're not"
  - "How do we get Perplexity / ChatGPT to recommend us?"
  - "Our legal team wants to know when compliance FAQs were last reviewed"
contentful_features:
  - Live Preview (Content Source SDK)
  - Rich Text fields
  - Content references (faqItem → aioAeoGeo)
  - GraphQL Content API
content_types:
  - id: faq
    status: existing
    note: Container CT — holds headline + itemsCollection of faqItems
  - id: faqItem
    status: existing
    note: Individual Q&A pair — questionRt + answerRt rich text fields; references aioAeoGeo entries
  - id: aioAeoGeo
    status: net-new
    note: Governance metadata CT — topic, ownerTeam, lastUpdated, region; attached to faqItems to power badges + audit trail
components:
  - FaqAeoAfterPanel
  - AioAeoPreviewPanel
  - AiSimulationCard
  - MetafiFaq
setup_minutes: 3
---

**What this shows:** Contentful's structured content model turns a generic FAQ page into a machine-readable FAQPage schema — so AI answer engines cite your brand instead of hedging with "based on various sources."

---

## Tell — Reflect Their Pain

"AI Overviews are appearing on over 40% of commercial queries right now. Perplexity, ChatGPT with browsing, Bing Copilot — they all do the same thing: read your content, synthesize an answer, and either cite you or they don't. Most teams assume their FAQ is good enough. It's not. Without structured data, AI treats your FAQ page the same way it treats a Reddit thread — it hedges. You get 'based on various sources.' Your competitors who have schema get the attribution. The gap isn't content quality. It's content structure."

For SEO Lead / Head of Content: anchor on the citation gap — they feel this in organic traffic drops as AI Overviews push down blue links.

For Legal / Compliance: anchor on governance — every FAQ item carries an owner, review date, and region. Audit-ready from the same content entry.

---

## Show — Click Path

1. `[Browser]` Navigate to `http://localhost:3000/demo/faq-aeo?preview=true`
2. `[Browser]` Point to the LEFT panel **"No structured data"** red badge — explain this is a typical FAQ page with no schema markup
3. `[Browser]` Click the first question to expand it — it's human-readable but there is no machine signal AI can anchor to
4. `[Browser]` Point to the **AiSimulationCard** below the FAQ: "Low confidence / may vary" badge, no source attribution, no brand name — this is what AI engines return today for most FAQ pages
5. `[Browser]` Point to the RIGHT panel **"FAQPage schema + Live Preview"** green badge — same questions, same editorial interface, different output
6. `[Browser]` Click the first question to expand it
7. `[Browser]` Point to the governance badges in the Content Governance card: topic chip, owner team, last reviewed date, region — explain this is metadata attached directly to the FAQ item entry in Contentful, not a separate system
8. `[Browser]` Click **"View Structured Data ↓"** to open the JSON-LD drawer — show the FAQPage schema: `@context`, `@type: FAQPage`, `mainEntity` array with Question + AcceptedAnswer — this is exactly what Google and Perplexity index
9. `[Browser]` Point to the **AI Overview** card: "High confidence" green badge, "metafi.io · FAQPage schema" source line, answer body matches the Contentful entry verbatim
10. `[Contentful]` Open **Metafi AEO Demo FAQ** entry → `https://app.contentful.com/spaces/uumzxfocy3ef/environments/master/entries/4U4M6wZA96houeEr8SVGiB`
11. `[Contentful]` Click into the first FAQ item → open its answer field → add "Updated: " at the very beginning of the answer text
12. `[Contentful]` Save with **Cmd+S** (do not publish — live preview runs off the draft)
13. `[Browser]` Switch back to the demo tab — the AI Overview body has updated in real time; open the JSON-LD drawer again to confirm the `acceptedAnswer.text` updated — no redeploy, no engineering ticket

**Governance close (2 min):**

Point back to the governance badges. "Every FAQ item can carry metadata: the topic, the owning team, when it was last reviewed, which region it covers. That's not just for AI — that's for your legal team to confirm the data protection policy answer was reviewed by Legal in March and is current. Audit trail is built in from the same content model."

---

## Tell — Tie to Outcomes

- **SEO / Marketing:** The difference between a citation and a hedge is schema. Contentful generates FAQPage JSON-LD automatically on every render — your editorial team never touches markup, and every publish is schema-complete.
- **Head of Content / Legal:** Governance metadata (owner, review date, region) lives on the same entry as the answer. One place to update, one place to audit. No spreadsheet, no separate CMS field, no ticket to engineering.
- **Urgency:** Every day a competitor's FAQ page has FAQPage schema and yours doesn't, they accumulate AI citation authority. The structural advantage compounds. This is a 30-minute content model change — not a replatform.

---

## Entry Reference

| Entry | Content Type | ID | Status | Preview URL |
|---|---|---|---|---|
| Metafi AEO Demo FAQ | `faq` | `4U4M6wZA96houeEr8SVGiB` | published | `http://localhost:3000/demo/faq-aeo?preview=true` |

---

## Reset Checklist

- [ ] **Metafi AEO Demo FAQ** entry (ID: `4U4M6wZA96houeEr8SVGiB`) has original answer text — no "Updated: " prefix on the first FAQ item answer
- [ ] Dev server running at `localhost:3000`
- [ ] Contentful open in a second browser tab with the **Metafi AEO Demo FAQ** entry already loaded (saves tab-switching time)
- [ ] Browser zoom set to **90%** — the split layout needs horizontal space; below 90% collapses to single column on smaller screens
- [ ] Live preview connected — Contentful inspector toolbar visible at top of the demo page; if missing, reload with `?preview=true` query param
