# DEMO SCRIPT — AIO / AEO / GEO Answer Engine Optimization

**Route:** `/demo/faq-aeo`
**Total time:** 8–12 minutes
**Persona:** Marketing Director, SEO Lead, or Head of Content

---

## Pre-demo setup checklist

- [ ] Dev server running at `localhost:3001` (or your designated port)
- [ ] Contentful logged in, "Metafi AEO Demo FAQ" entry open in a second tab
- [ ] Browser zoom at 90% for split layout visibility
- [ ] First FAQ item answer is in a known state (reset if needed)
- [ ] Live preview connected (look for the Contentful inspector toolbar at top of page)

---

## Act 1 — The Problem (2 minutes, no clicks)

**Talking points:**

"Before I show you the demo, I want to frame the problem we're solving.

AI Overviews — Google's AI-generated answers at the top of search results — are now appearing for over 40% of commercial queries. Perplexity, ChatGPT with browsing, Bing Copilot — they all do the same thing. They read your content, synthesize an answer, and either cite you or they don't.

The difference between getting cited and getting ignored comes down to one thing: structured data. If your content doesn't have machine-readable schema, AI treats it like any other web page — and it hedges. You get 'based on various sources, answers may vary.' Your brand attribution disappears.

The question isn't whether AI is reading your content. It is. The question is whether it can trust it enough to cite you."

---

## Act 2 — The Before (2 minutes)

**Click path:**

1. Point to the left panel — "No structured data" badge
2. Click the first question to expand it
3. Point to the AI Overview card below: low confidence badge, no source attribution, static hedged answer

**Script:**

"This is a typical FAQ page. It's perfectly human-readable. But look at the AI simulation below it.

'Based on various sources, answers may vary.' No source. No confidence. No attribution to Metafi.

Why? Because there's no schema. AI reads this page the same way it reads a Reddit thread. It can't tell if this is authoritative or not.

And this isn't hypothetical — this is what happens to most FAQ pages today."

---

## Act 3 — The After + Live Edit (4–5 minutes, the aha)

**Click path:**

1. Point to the right panel — "FAQPage schema + Live Preview" badge
2. Click the first question to expand it
3. Point to the governance badges: topic chip, owner team, last reviewed date
4. Open the "View Structured Data ↓" drawer — show the JSON-LD
5. Point to the AI Overview on the right: high confidence badge, source attribution "metafi.io · FAQPage schema"

**Script (before the live edit):**

"Now look at the right side. Same FAQ — but this one is driven by Contentful.

Contentful is generating this FAQPage JSON-LD schema automatically on every render. *(Open drawer.)* This is exactly what Google reads. Exactly what Perplexity indexes. The structure is explicit: Question, AcceptedAnswer, source.

Result: *(point to AI Overview)* high confidence, sourced attribution, your brand's answer verbatim. Not 'based on various sources.' Yours."

**The live edit:**

*(Switch to Contentful tab, open the first FAQ item, change the answer — e.g., add "Updated: " at the beginning.)*

"Now watch. I'm going to change this answer in Contentful. Just a simple edit. I'll save it."

*(Save in Contentful, switch back to the demo page.)*

"The AI Overview just updated. The JSON-LD updated. No redeploy. No engineering ticket. Your editorial team controls what AI says about you — in real time.

That's the power of structured content as infrastructure."

**Governance:**

"One more thing — every FAQ item can carry governance metadata. *(Point to the badges.)* Topic, owning team, when it was last reviewed, which region it applies to. That's not just for AI — that's for your legal and compliance team to know that the answer about your data protection policy was reviewed by Legal in March and is current. Audit-ready, out of the box."

---

## Act 4 — The Pitch (2 minutes)

**Script:**

"The bottom line: the AI-native web rewards structured content. Companies that treat their content as data — not just text — will get cited. Companies that don't will get a hedge.

Contentful makes structured content the default. Your editors work in a familiar interface. The JSON-LD, the governance metadata, the live preview — it all comes from the same content model. There's no separate schema layer to maintain, no plugin to break.

The question I'd ask your team: if AI answered a customer's question about your compliance certifications with 'based on various sources, answers may vary' — what's the cost of that? One lost deal? A compliance concern? A competitor getting the citation instead?

That's the risk of not having this. And it compounds every day search behavior shifts toward AI."

**Close / next steps:**

"What I'd suggest: let's look at your current FAQ structure together. I can show you exactly what schema Contentful would generate from your content today — and where the gaps are. Does that make sense as a next step?"

---

## Timing guidance

| Act | Time |
|-----|------|
| Act 1 — Problem framing | 2 min |
| Act 2 — Before | 2 min |
| Act 3 — After + live edit | 4–5 min |
| Act 4 — Pitch + close | 2 min |
| Q&A | 2–3 min |
| **Total** | **12–14 min** |

For a shorter slot (8 min): skip Act 1, start directly with "Let me show you the problem and the solution side by side."
