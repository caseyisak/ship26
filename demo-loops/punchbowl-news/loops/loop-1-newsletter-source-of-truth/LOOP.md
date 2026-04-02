---
id: loop-1-newsletter-source-of-truth
customer: punchbowl-news
build_type: net-new
promotion_status: candidate
personas:
  - Producer (Robert)
  - PM (Kalyn)
  - Product (MT)
industries:
  - Media & Publishing
  - Political News
pain_signals:
  - "Every newsletter means Google Doc → WordPress → ESP → site article"
  - "3 newsletters a day, 30–45 min each, mostly copy-paste"
  - "Any change means hunting down all the copies"
  - "Errors creep in on the 5am send"
  - "Adding more verticals means another WordPress template and ESP config"
contentful_features:
  - Rich Text + Embedded Entries
  - Content References
  - Live Preview
content_types:
  - id: newsletter
    status: net-new
    note: Complete newsletter issue — title, sender, subjectLine, date, teaser, slug, leadStory ref, promoSlot ref, content RichText
  - id: blogPost
    status: existing
    note: Article entries referenced as leadStory and promoSlot, also embedded in RichText body
components:
  - NewsletterIssuePage (/newsletter/[slug])
  - NewsletterPage (cms-components/newsletter/newsletter-page.tsx)
setup_minutes: 10
---

**What this shows:** A `newsletter` entry is the complete structured object for one issue — edition, subject line, preheader, lead story reference, RichText body with embedded article cards, promo slot, and ad slot. Producers fill out one form in Contentful. Nothing gets copy-pasted.

---

## Tell — Reflect Their Pain

"On the last call you walked us through how every newsletter means: Google Doc → WordPress → Sailthru → site article, with copy-paste at every step. Three daily newsletters, 30–45 minutes each. Any change — a headline fix, a time correction — means hunting down all the copies. That's where errors creep in, especially on the 5am send."

---

## Show — Click Path

1. [Contentful] Navigate to **Content** → filter by type **Newsletter** → open **AM Newsletter – April 10**
2. [Contentful] Walk the entry fields:
   - **Edition:** AM | **Subject line:** "Congress returns: what to expect this week"
   - **Lead Story:** linked `blogPost` entry → "This links to the actual article. If the headline changes there, it changes here. No second copy."
   - **Content** (RichText): embedded article cards, section blocks, promo callout
3. [Browser] Navigate to **http://localhost:3000/newsletter/am-newsletter-april-10**
4. [Browser] Walk the rendered issue: subject line header, lead story card with image, embedded article cards, promo slot, ad banner with "Ad Ops" lock badge
5. [Contentful] Change **Subject Line** → save → [Browser] refresh → "One edit, one place."

---

## Tell — Tie to Outcomes

- **For Kalyn (producer → PM):** "This is the form your producers actually fill out. Subject line, preheader, lead story, body — all in one place. No Google Doc. No WordPress. No 'is the Doc or WordPress the source of truth?'"
- **For Robert (producer):** "Any correction you make here is the correction. You don't track down three other files."
- **For MT (product):** "When you add a new vertical — a Sunday Portal edition — you add a new layout pattern and tags here, not a whole new WordPress template and ESP config."
- **ESP hook:** "When you replace Sailthru in June, the content model doesn't change. You point a new email renderer at the same structured entry."

---

## Entry Reference

| Entry | Content Type | Slug | Status |
|-------|-------------|------|--------|
| AM Newsletter – April 10 | newsletter | am-newsletter-april-10 | Draft |
| Midday Newsletter – April 10 | newsletter | midday-newsletter-april-10 | In Review |
| PM Newsletter – April 10 | newsletter | pm-newsletter-april-10 | Ready for Send |
| Senate Defense Hearing | blogPost | senate-defense-hearing | Published |
| Tech Transparency Bill | blogPost | tech-transparency-bill | Published |

---

## Reset Checklist

- [ ] All article (blogPost) entries Published
- [ ] AM Newsletter in state: Draft
- [ ] `/newsletter/am-newsletter-april-10` returns 200
- [ ] Dev server running at localhost:3000 from punchbowl worktree
- [ ] Contentful open to Content tab, Newsletter type visible
