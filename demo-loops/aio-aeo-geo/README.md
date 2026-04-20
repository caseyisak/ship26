# AIO / AEO / GEO Demo Loop

## Overview

This loop demonstrates how structured content in Contentful makes the difference between an AI answer engine saying *"based on various sources, answers may vary"* and confidently attributing a direct, sourced answer back to your brand. The demo uses a Before / After split screen: the left panel shows a hardcoded FAQ with no schema; the right panel shows the same FAQ powered by Contentful with FAQPage JSON-LD injected automatically, live-editing enabled, and governance metadata surfaced alongside an AI Overview simulation.

The aha moment: the prospect edits a FAQ answer in Contentful, saves, and watches the AI Overview on the right update in real time — without a redeploy.

---

## When to use

Trigger this loop when a prospect says:

- "We're not showing up in AI Overviews / SGE results"
- "ChatGPT / Perplexity gives wrong info about us"
- "We don't know what AI is saying about our products"
- "Our SEO team is worried about zero-click search"
- "How do we make sure our content is what answer engines cite?"
- "We need AEO / GEO / answer engine optimization"
- "Our competitors are getting cited in AI answers and we're not"

---

## Talk track (Tell-Show-Tell)

### Tell (setup — 60 seconds)

> "One of the things we're hearing from marketing and SEO teams right now is that AI Overviews are eating their organic traffic. When someone searches for your product category, they get an AI-generated answer — and if your content isn't structured correctly, that answer either hedges with 'based on various sources' or cites a competitor. Today I want to show you exactly why that happens and how Contentful fixes it."

### Show (demo — 4–5 minutes)

**Act 1 — The Problem (left panel)**

> "This is a typical FAQ page. It works for humans — but look what happens when AI tries to answer from it."
> *(Point to the AI Overview card on the left — low confidence, 'based on various sources', no attribution.)*
> "There's no structured data. No schema. AI reads this the same way it reads a random forum post. It can't trust it."

**Act 2 — The After (right panel)**

> "Now look at the right side. Same content — but this is driven by Contentful. Under the hood, Contentful is generating a FAQPage JSON-LD schema automatically every time an editor updates an answer."
> *(Open the JSON-LD drawer — show the structured data.)*
> "This is what answer engines actually read. Google, Perplexity, ChatGPT with browsing — they all consume this. The result: high confidence, sourced attribution back to your brand."

**Act 3 — The Live Edit moment (the aha)**

> "Here's where it gets interesting. Watch what happens when I change an answer in Contentful right now."
> *(Switch to Contentful, open the first FAQ item, edit the answer, save.)*
> "See that? The AI Overview just updated. No redeploy. The schema regenerates on every render from live data. Your editorial team controls what AI says about you — in real time."

**Act 4 — Governance**

> "And because every FAQ item can carry governance metadata — who owns this content, which team reviewed it, when it was last updated, which region it applies to — you have audit-ready traceability. That matters for legal review cycles, compliance, and multi-region content."

### Tell (close — 60 seconds)

> "The bottom line: structured content is the foundation of answer engine optimization. You can't bolt it on after the fact. You need a content platform where structured data is a first-class citizen — not an afterthought. That's exactly what Contentful gives you."

---

## Click path

1. Navigate to `/demo/faq-aeo`
2. Point out the left / right split — Before (no schema) vs After (FAQPage schema)
3. Click a question on the left — show the hardcoded answer, no metadata
4. Click the same question on the right — show the CMS-driven answer + governance badges
5. Open "View Structured Data ↓" on the right — show the JSON-LD
6. Open Contentful in a second tab, navigate to the AEO Demo FAQ entry, open first FAQ item
7. Edit the answer text, save / publish
8. Return to `/demo/faq-aeo` — show the right panel updated, AI Overview reflects new answer
9. Point to governance badges — topic chip, owner team, last reviewed date

---

## Value to the champion (marketer / content team)

- Control what AI says about your brand without engineering tickets
- Editorial team can update FAQs and the structured data regenerates automatically
- Governance metadata creates audit trails for legal and compliance review
- Live preview lets you see exactly what AI will read before publishing

## Value to the economic buyer (CTO / CMO)

- Structured content is a strategic moat — competitors without it are invisible to AI
- Reduce brand risk from hallucinated or misattributed AI answers
- One content platform for web rendering, AI schema generation, and live editing
- No additional tooling or middleware required

## Risk of inaction

> "If you don't structure your FAQ content, AI answers will continue to cite your competitors or hedge with 'based on various sources.' Every AI Overview that doesn't cite you is a trust signal going to someone else. This isn't an SEO trick — it's table stakes for the AI-native web."

---

## Discovery questions

- "When someone searches for [your product], what does the AI Overview say today?"
- "Who owns FAQ content — marketing, product, legal? How do they coordinate updates?"
- "Have you audited what AI says about your pricing, compliance, or support policies?"
- "What's your current review cadence for public-facing Q&A content?"
- "Do you have a process for validating that AI citations about your brand are accurate?"

## Trap-setting questions

- "If a compliance answer in your FAQ was outdated, how quickly would you know? How quickly could you fix it?"
- "Does your current CMS emit structured data automatically, or does it require a developer?"
- "When your SEO team optimizes for AI Overviews, where does that work happen today?"

## Objection handling

| Objection | Response |
|-----------|----------|
| "We already have schema markup via a plugin." | "Plugins bolt schema on after the fact — they can't reflect real-time content changes or carry governance metadata. Contentful generates schema from your live content model, so it's always accurate and audit-ready." |
| "Our devs can add JSON-LD manually." | "Manual JSON-LD means every FAQ update requires a code change or a separate process. Contentful makes structured data a natural output of your editorial workflow — no developer in the loop for content updates." |
| "This only matters for Google." | "FAQPage schema is consumed by Google, Bing, Perplexity, ChatGPT with browsing, and any LLM with web access. The structured data standard is converging — investing now means you're positioned for every answer engine that comes next." |

## Proof points

- Contentful customers report faster time-to-publish for compliance-sensitive content when governance metadata is centralized
- FAQPage JSON-LD is one of Google's highest-ROI schema types for zero-click search
- Structured content reduces hallucination risk in AI-cited answers by giving models a clean, attributable source
