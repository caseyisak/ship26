---
id: loop-c-approval-workflow-release
customer: bears
build_type: ootb
promotion_status: candidate
personas:
  - VP Digital / Brand
  - Social Brand Manager
  - Legal / Compliance
industries:
  - Sports
  - Media & Entertainment
  - Any regulated or high-visibility publisher
pain_signals:
  - "We had a third-party social tool get compromised so we publish natively now"
  - "We have no visibility into what's been approved and what hasn't"
  - "Things go out without sign-off"
  - "We track approvals in Slack and spreadsheets"
  - "Legal asks us what went out and who approved it and we can't answer quickly"
  - "We're flying without a cockpit view"
  - "Sensitive posts need a second set of eyes before they go out"
  - "We need a release checklist for game day"
contentful_features:
  - Workflows (draft → ready_for_review → approved)
  - Releases (bundle + scheduled publish)
  - Content filtering by status
  - Audit log
content_types:
  - id: socialPost
    status: net-new (bears env only)
    note: Has workflow states; 3 posts across X/IG/FB show different stages in one view
  - id: banner
    status: net-new
    note: Included in the Release alongside social posts
  - id: newsArticle
    status: net-new
    note: Also bundled into the Week 1 Release
components:
  - none (this loop is primarily OOTB Contentful UI)
setup_minutes: 3
---

**What this shows:** Three social posts in three Contentful workflow states. Advance one through the approval flow. Then open Releases — a bundled go-live checklist for the entire Week 1 content drop. Approve the last item, publish the Release — everything goes live simultaneously.

---

## Tell — Reflect Their Pain

> "You had an account compromised through a third-party social tool. You fixed that by going 100% native publishing. The downside: you're flying without a cockpit view. What's approved? What's risky? What's already out? That lives in spreadsheets and Slack."

Frame Contentful as a **flight deck, not a scheduler** — it stores the content, routes approvals, and never touches a social handle.

- For **Pooja**: "If the league or ownership ever asks 'what did we say, who approved it, what image did we use?' — you answer in seconds. Not because you built a new system, but because approval happened in the same tool where the content lives."
- For **Megan**: "One view per game week. No hunting across DMs to see if a sensitive post is cleared."

---

## Show — Click Path

### Part 1 — Workflow states

1. **[Contentful]** Content → filter by `Social Post` → show 3 entries with different workflow states
   → Tag filter: **Pregame Hype** (shows only the 3 gameday posts)

2. **[Contentful]** Open **Wk 1 — X — Gameday Hype**
   [https://app.contentful.com/spaces/uumzxfocy3ef/environments/bears/entries/2jFNTxovaWjtmphbaw4S4E](https://app.contentful.com/spaces/uumzxfocy3ef/environments/bears/entries/2jFNTxovaWjtmphbaw4S4E)
   → Show workflow status = `Draft`
   → Change to `Ready for Review` → save
   → Add a note: "Legal cleared — sensitive post, needs second approval"

3. **[Contentful]** Open **Wk 1 — IG — Gameday Hype**
   [https://app.contentful.com/spaces/uumzxfocy3ef/environments/bears/entries/7dHr6nKLd50aEOdPnGiLbO](https://app.contentful.com/spaces/uumzxfocy3ef/environments/bears/entries/7dHr6nKLd50aEOdPnGiLbO)
   → Show it's been reviewed → change to `Approved`

4. **[Contentful]** Return to Content list → filter status = `Ready for Review` → only posts needing sign-off appear
   → Filter = `Approved` → only cleared posts appear
   > "One view per game week. No hunting across DMs and spreadsheets to see if a sensitive post is cleared."

### Part 2 — Release

5. **[Contentful]** Left nav → **Releases** → open **"Week 1 vs Rams"**
   → Show linked entries: 1 banner + 3 social posts + 1 news article
   → Status column: show mixed states — some approved, one still draft

6. **[Contentful]** Open the remaining draft → advance to Approved → return to Release
   → All entries now approved

7. **[Contentful]** Publish Release → all entries go live simultaneously
   > "If the league or ownership ever asks 'what did we say, who approved it?' — you answer in seconds. Approval happened in the same tool where the content lives."

---

## Tell — Tie to Outcomes

> "You've already locked down the publishing side. This is the missing piece — a source of truth for everything before it goes out."

- For **Megan**: "One view per game week. No hunting across DMs and spreadsheets to see if a sensitive post is cleared."
- For **Pooja**: "You've already locked down the publishing side. This is the missing piece — a source of truth for everything before it goes out."

---

## Entry Reference

| Entry | Content Type | Workflow State | ID |
|---|---|---|---|
| Wk 1 — X — Gameday Hype | socialPost | Draft | `2jFNTxovaWjtmphbaw4S4E` |
| Wk 1 — IG — Gameday Hype | socialPost | Draft | `7dHr6nKLd50aEOdPnGiLbO` |
| Wk 1 — FB — Gameday Hype | socialPost | Draft | `3Dj2nGX1fyuqcccGUbmYYi` |
| Gameday Banner — Bears vs Rams | banner | Published | `2CbmCSNNaI4R7Y9UzMX11y` |
| Bears Set Roster for Home Opener | newsArticle | Published | `5Utez9CoNttUNpNBoERpGw` |

**Release to create in Contentful UI before demo:** "Week 1 vs Rams" — add all 5 entries above.

---

## Reset Checklist

- [ ] All 3 social posts are in `Draft` Contentful workflow state
- [ ] "Week 1 vs Rams" Release exists in Contentful with all 5 entries linked
- [ ] Dev server not required for this loop — it's entirely in Contentful UI
- [ ] Optional: have the content list open pre-filtered to `Social Post` type for a clean start
