---
id: loop-4-reuse-across-channels
customer: punchbowl-news
build_type: sandbox
promotion_status: candidate
personas:
  - PM (Kalyn)
  - Product (MT)
industries:
  - Media & Publishing
  - Political News
pain_signals:
  - "Once the newsletter goes out, producers burn another 30–45 min turning stories into site articles"
  - "The same story exists three times in three different tools"
  - "We copy-paste the newsletter into WordPress for the site version"
  - "We want to experiment with premium alerts but don't want to recreate content"
contentful_features:
  - Content References
  - Live Preview
content_types:
  - id: blogPost
    status: existing
    note: The reusable story unit — referenced by newsletter body, homepage, and site article
  - id: newsletter
    status: net-new
    note: References article as leadStory — same entry, different surface
  - id: page
    status: existing
    note: Homepage page with sections referencing top articles
components:
  - /blog/[slug] (already exists on main)
  - BlogPostsSection (existing component — card grid)
setup_minutes: 5
---

**What this shows:** One `blogPost` article entry is simultaneously the lead story in a newsletter, a standalone site article at `/blog/[slug]`, and a card on the homepage. Edit the headline once — all three surfaces update. No copy-paste, no second file.

---

## Tell — Reflect Their Pain

"Right now, once the newsletter goes out, your producers burn another 30–45 minutes turning the same stories into site articles. It's necessary work, but it's not differentiated work — you're not making the journalism better, you're copy-pasting the same paragraph into another tool."

---

## Show — Click Path

1. [Contentful] Open **blogPost** entry: "Senate Defense Hearing – April 10"
2. [Contentful] Click **References** (sidebar) → show where this entry is used:
   - AM Newsletter – April 10 (lead story)
   - punchbowl-home page (cards section)
3. [Browser] Navigate to **http://localhost:3000/blog/senate-defense-hearing** → full article page
4. [Browser] Navigate to **http://localhost:3000/page/home** → same story as a card in the grid
5. [Browser] Navigate to **http://localhost:3000/newsletter/am-newsletter-april-10** → same story as the newsletter lead
6. [Contentful] Edit the **title** on the article → save → [Browser] refresh all three URLs → show update everywhere
7. [Contentful] Point to tags: "The newsletter references this as the lead. The homepage references it as a card. You decide where it goes — newsletter-only, site-only, both. You're never copy-pasting."

---

## Tell — Tie to Outcomes

- **For Kalyn:** "This is the 30–45 minutes per newsletter you get back. Your producers write the story once, in structured form. It flows to the newsletter, the site, and wherever else it's needed. That time goes back to journalism."
- **For MT (product expansion):** "If you experiment with a breaking-news premium alert, you reuse the same structured entry for the premium email, the paywalled article, and the promo in tomorrow's newsletter — without recreating the content."
- **CMS migration hook:** "Your August window lines up well. Click Studios would migrate your existing articles as structured entries. You go live in the new model in time for the fall session."

---

## Entry Reference

| Entry | Content Type | Surface |
|-------|-------------|---------|
| Senate Defense Hearing – April 10 | blogPost | Newsletter lead + site article + homepage card |
| AM Newsletter – April 10 | newsletter | References article as leadStory |
| punchbowl-home | page | Homepage with BlogPostsSection referencing articles |

---

## Reset Checklist

- [ ] Senate Defense Hearing article is Published with heroImage, title, excerpt, body
- [ ] AM Newsletter leadStory field references the article
- [ ] punchbowl-home page entry has BlogPostsSection referencing article
- [ ] `/blog/senate-defense-hearing` returns 200 with content
- [ ] `/page/home` returns 200 and shows the article card
- [ ] `/newsletter/am-newsletter-april-10` returns 200 with the article as lead story
- [ ] Contentful References panel shows all 3 references on the article entry
