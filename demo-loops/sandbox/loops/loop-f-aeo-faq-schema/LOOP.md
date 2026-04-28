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
  - Content references (faq → aioAeoGeo via faqMetadata field)
  - GraphQL Content API
content_types:
  - id: faq
    status: existing
    note: Container CT — holds itemsCollection of faqItems + AI Optimization Metadata reference
  - id: faqItem
    status: existing
    note: Individual Q&A pair — questionRt + answerRt rich text fields
  - id: aioAeoGeo
    status: net-new
    note: Governance metadata CT — topic, ownerTeam, lastUpdated, audience, region; linked at FAQ level to drive the confidence upgrade
components:
  - FaqAeoAfterPanel
  - AioAeoPreviewPanel
  - AiSimulationCard
setup_minutes: 3
---

**What this shows:** Adding a single governance metadata reference to a Contentful FAQ entry upgrades a hedged "based on various sources" AI answer into a high-confidence, attributed response — live, in the preview, with no code deploy. This is the structural difference between being cited by AI and being ignored.

---

## Tell — Reflect Their Pain

> "AI Overviews are now appearing on over 40% of commercial search queries. Perplexity, ChatGPT with browsing, Bing Copilot — they all work the same way: they read your content, synthesize an answer, and either cite your brand or they don't. Most teams think their FAQ is good enough. It isn't. Without structured data attached to that FAQ, AI treats your page like a Reddit thread. You get 'based on various sources, answers may vary.' Your competitor who has schema markup gets the citation, the traffic, and the brand authority. The gap isn't content quality — it's content structure. And that's something Contentful solves."

**For SEO Lead / Marketing:** anchor on the citation gap — they feel this as organic traffic erodes and AI Overviews push blue links down the page.

**For Head of Content / Legal:** anchor on governance — every FAQ item can carry an owner, a review date, and a region. Audit-ready from the same content entry, no spreadsheet.

---

## Show — Click Path

**Setup:** Two browser tabs open — Tab 1: `http://localhost:3000/demo/faq-aeo?preview=true`, Tab 2: Contentful entry `https://app.contentful.com/spaces/uumzxfocy3ef/environments/master/entries/4U4M6wZA96houeEr8SVGiB`. FAQ entry has **no** `AI Optimization Metadata` linked at demo start. Browser zoom: 90%.

---

### Step 1 — Orient the room
`[Tab 1 — Demo Page]`

**What you see:** A page header ("AEO Demo — Answer Engine Optimization"), a Google-style search bar in a light grey strip showing the question text, then two columns side-by-side labeled **Before** (red badge: "No structured data") and **After** (green badge: "FAQPage schema + Live Preview").

**What to say:** "I'm going to show you something that takes about 30 seconds to do in Contentful and immediately changes how every AI answer engine responds to this question. Here's where we start."

---

### Step 2 — Read the Before state
`[Tab 1 — Before column, left]`

**What you see:**
- Search bar shows the real question: *"What is Answer Engine Optimization (AEO) and why does it matter for enterprise content?"*
- **AI Suggested Answer** card with a grey dot icon and yellow **● Low confidence / may vary** badge
- Question text repeated in the card
- Truncated answer ending with "…This information is synthesized from available page content and may not reflect the most current or verified guidance."
- `▶ View Structured Data ↓` toggle (collapsed)

**What to say:** "This is what AI gets when it finds a typical FAQ page — no structured signal. It reads the content, synthesizes an answer, and hedges. 'Based on various sources. May not be current.' No brand attribution. No source. Your competitor with schema markup gets the citation. You get the asterisk."

---

### Step 3 — Show the After state (pre-governance)
`[Tab 1 — After column, right]`

**What you see:**
- Same search bar question
- **AI Suggested Answer** card with Google-style multicolor dots icon and yellow **● Low confidence / may vary** badge
- Same question text
- Same truncated hedged answer as the Before — *identical*
- `▶ View Structured Data ↓` collapsed, with note: "Schema is present but lacks governance signals — answer engines may still hedge."
- **Content Governance** section below: grey italic text — "No governance metadata — add an AIO / AEO / GEO Governance entry to unlock high-confidence answers."

**What to say:** "The After column is driven by Contentful — same editorial experience, just structured. But right now it's showing the exact same hedged answer. That's because we haven't attached any governance metadata yet. Watch what happens when I do."

---

### Step 4 — Add the governance entry
`[Tab 2 — Contentful entry editor]`

**What you see:** The **Metafi AEO Demo FAQ** entry. Fields: Internal Name, Title, Description, **AI Optimization Metadata** (empty), Items.

**Click path:**
1. Click **AI Optimization Metadata** field → click **Add existing entry**
2. Search field appears — type "AEO" or leave blank
3. Select **"AEO Demo — Content Governance"** (shows: *Answer Engine Optimization / Content Strategy / Enterprise Content Teams / Global*)
4. Entry appears linked in the field
5. **Cmd+S** — entry saves as draft (no publish required)

**What to say:** "One reference entry. That's it. I'm not writing markup. I'm not touching code. I'm linking a governance record to the FAQ in Contentful — owner, review date, audience, region — and saving."

---

### Step 5 — Watch the After panel upgrade
`[Tab 1 — After column]`

**What you see (live, within 1–2 seconds of saving):**

- Badge flips: yellow **● Low confidence / may vary** → green **● High confidence**
- Answer text upgrades: full, untruncated answer now visible with a **green left border accent**
- Attribution row appears below the answer (green pill chips):
  - `Source: metafi.io · FAQPage JSON-LD schema`
  - `Verified by Content Strategy`
  - `Reviewed Apr 2026`
- **Content Governance** section populates with colored badges:
  - Blue chip: `Answer Engine Optimization`
  - Grey chip: `Content Strategy`
  - Purple chip: `Enterprise Content Teams`
  - Grey chip: `Global`
  - Green chip: `Last reviewed: Apr 2026`

**What to say:** "There it is. Same question. Same content. One governance entry added — and now the AI answer engine gets a confident, attributed, verified response. Brand name cited. Source line. Review date. The Before column hasn't changed at all."

---

### Step 6 — Compare the two panels
`[Tab 1 — both columns visible]`

**What you see:** Left (Before): grey dot, yellow badge, truncated hedged text. Right (After): Google dots, green badge, full answer with green highlights, attribution chips, governance badges.

**What to say:** "Left side — typical FAQ page, no schema, AI hedges. Right side — same editorial content in Contentful, governance metadata attached, AI cites you by name. The structural difference is one content type and one entry. That's the whole gap."

---

### Step 7 — Open the JSON-LD drawer (optional, technical audiences)
`[Tab 1 — After column, click "View Structured Data ↓"]`

**What you see:** Drawer expands, note reads "FAQPage JSON-LD generated automatically from Contentful entries + governance metadata." Below it: formatted JSON block:
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Answer Engine Optimization...",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer Engine Optimization (AEO) is the practice..."
      }
    },
    ...
  ]
}
```

**What to say:** "This is the FAQPage JSON-LD schema that gets injected into the page on every render — automatically, from the Contentful entry. Google reads this. Perplexity reads this. ChatGPT with browsing reads this. Your editors never touch a line of markup. Every time someone publishes or updates an FAQ answer in Contentful, this schema updates too."

---

### Governance close (optional, 2 min — strong for Legal / Compliance personas)
`[Tab 1 — Content Governance badges in After column]`

**What to say:** "These governance badges aren't just for AI. Every FAQ item can carry: who owns it, when it was last reviewed, which audience it applies to, and which region it covers. Your legal team can see that the data privacy answer was reviewed by Legal in March and is marked Global. Your content ops team can build a review workflow around the `Last Reviewed` date. The audit trail is built into the same entry as the answer — not a separate spreadsheet, not a ticket in Jira. One place to write, one place to govern."

---

## Tell — Tie to Outcomes

- **SEO / Marketing:** The difference between a citation and a hedge is FAQPage schema. Contentful generates it automatically on every render — no engineering ticket, no plugin, no third-party tool. Every publish is schema-complete.
- **Head of Content / Legal:** Governance metadata (owner, review date, audience, region) lives on the same entry as the answer. Update once, governs everywhere the FAQ appears. No spreadsheet, no separate workflow.
- **Urgency:** Every day a competitor's FAQ page has schema and yours doesn't, they accumulate AI citation authority. The structural advantage compounds. This is a 30-minute content model change — not a replatform.

---

## Entry Reference

| Entry | Content Type | ID | Notes |
|---|---|---|---|
| Metafi AEO Demo FAQ | `faq` | `4U4M6wZA96houeEr8SVGiB` | Main FAQ entry — add/remove `AI Optimization Metadata` to drive the demo |
| AEO Demo — Content Governance | `aioAeoGeo` | `4ECrOPyz0FZypuK6DK60eJ` | The governance entry to add. Topic: Answer Engine Optimization / Owner: Content Strategy / Audience: Enterprise Content Teams / Region: Global |

**Preview URL:** `http://localhost:3000/demo/faq-aeo?preview=true`

**Contentful entry URL:** `https://app.contentful.com/spaces/uumzxfocy3ef/environments/master/entries/4U4M6wZA96houeEr8SVGiB`

---

## Reset Checklist

- [ ] Open **Metafi AEO Demo FAQ** entry → `AI Optimization Metadata` field → remove **"AEO Demo — Content Governance"** if linked → **Cmd+S** to save (demo starts with no governance)
- [ ] Dev server running at `localhost:3000`
- [ ] Both browser tabs pre-loaded: demo page (Tab 1) + Contentful entry (Tab 2)
- [ ] Browser zoom **90%** — split layout needs horizontal space; below 90% collapses on smaller screens
- [ ] Confirm demo page shows yellow badge on both panels before starting
