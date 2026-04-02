---
id: loop-2-live-preview-email-site
customer: punchbowl-news
build_type: net-new
promotion_status: candidate
personas:
  - Producer (Robert)
  - PM (Kalyn)
industries:
  - Media & Publishing
  - Political News
pain_signals:
  - "We only see if the layout is broken after it's too late"
  - "The 5am send is the riskiest moment"
  - "Formatting breaks on import to WordPress or the ESP"
  - "We want to see what a subscriber vs. free reader sees before we send"
contentful_features:
  - Live Preview
content_types:
  - id: newsletter
    status: net-new
    note: The entry being previewed — renders in both email and site panes
  - id: blogPost
    status: existing
    note: Lead story — rendered inline in both panes
components:
  - NewsletterSplitPreview (/preview/newsletter/[entryId])
  - NewsletterEmailChrome (cms-components/newsletter/newsletter-email-chrome.tsx)
  - NewsletterHeader (cms-components/newsletter/newsletter-header.tsx)
setup_minutes: 5
---

**What this shows:** `/preview/newsletter/[entryId]` renders a split-pane view — left is a Gmail-style email chrome showing exactly how the newsletter will look in an inbox, right is the same content as a site article. Edit any field in Contentful and both panes update live.

---

## Tell — Reflect Their Pain

"Today, if the layout breaks on import to WordPress or the ESP, you only see it after it's too late — or you spend time re-fixing something you already corrected. That's especially risky at the 5am send, when there's no time to fix and resend."

---

## Show — Click Path

1. [Contentful] Open **AM Newsletter – April 10** → click **Open live preview** (or navigate to preview URL)
2. [Browser] Navigate to **http://localhost:3000/preview/newsletter/[AM-newsletter-entry-id]**
3. [Browser] Show the split-pane:
   - **Left:** Gmail-style chrome — Inbox badge, sender, subject line header, preheader bar, lead story hero image, article body, embedded section blocks, ad banner
   - **Right:** Same lead story rendered as a site article
4. [Contentful] Edit the **subject line** → save → both panes update. "Same edit. Both surfaces."
5. [Contentful] Edit the lead story **headline** → save → both panes update — "The newsletter and the site article stay in sync automatically."
6. [Browser] Point to the ad banner: "Ad ops controls this slot. Editorial can see it but can't touch the creative."

---

## Tell — Tie to Outcomes

- **For Robert (producer):** "You can see the 5am send before it goes out. Email view and site view, live. Catch the broken image or the truncated headline before it's in 50,000 inboxes."
- **For Kalyn (PM):** "This is the QA step that doesn't exist today. Producers check their work in the same tool they write in — no separate ESP preview to log into."
- **ESP urgency hook:** "Your ESP contract is up in June. The preview on the right just points to a new email template. Your producers don't have to relearn anything when you switch."

---

## Entry Reference

| Entry | Content Type | ID | Preview URL |
|-------|-------------|-----|------------|
| AM Newsletter – April 10 | newsletter | [Contentful entry ID] | http://localhost:3000/preview/newsletter/[entryId] |
| Senate Defense Hearing | blogPost | [Contentful entry ID] | — |

---

## Reset Checklist

- [ ] `/preview/newsletter/[entryId]` returns 200
- [ ] Both panes render — email chrome left, site article right
- [ ] Live Preview URL configured in Contentful (Settings → Content Preview)
- [ ] Editing a field in Contentful updates both panes within ~2 seconds
- [ ] Lead story heroImage is uploaded and published (empty image = broken preview)
