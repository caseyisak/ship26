---
id: loop-3-workflow-approvals
customer: punchbowl-news
build_type: ootb
promotion_status: candidate
personas:
  - PM (Kalyn)
  - Product (MT)
industries:
  - Media & Publishing
  - Political News
pain_signals:
  - "Quality control relies on 'don't touch that block' and Google Doc version history"
  - "Adding more verticals and producers is going to get brittle"
  - "We have no visibility into what's been approved"
  - "Things go out without proper sign-off"
  - "Ad inventory and editorial copy have to stay separate"
contentful_features:
  - Workflows
  - Releases
  - Scheduled Publishing
content_types:
  - id: newsletter
    status: net-new
    note: The entries moving through workflow states
components:
  - none (100% OOTB Contentful UI)
setup_minutes: 5
---

**What this shows:** Contentful's built-in Workflows encode the newsroom's real approval chain. Releases bundle all three daily newsletters into a single coordinated publish with one status column showing who's approved and who hasn't. Zero custom code.

---

## Tell — Reflect Their Pain

"You called out how much of your quality control relies on 'don't touch that block' and Google Doc version history. As you add more verticals and more producers — Sunday editions, new policy beats — that's going to get brittle. There's no audit trail. If someone asks what went out and who approved it, you're digging through Slack."

---

## Show — Click Path

1. [Contentful] Navigate to **Workflows** (left nav) — show 3 newsletter issues in different states:
   - **AM Newsletter:** Ready for Send (green)
   - **Midday Newsletter:** In Review (yellow)
   - **PM Newsletter:** Draft (grey)
2. [Contentful] Open **PM Newsletter** → click **Move to "In Review"** → assign editor as approver
3. [Contentful] Open **Midday Newsletter** → click **Move to "Ready for Send"**
4. [Contentful] Navigate to **Releases** → open **"April 10 Editions"** — contains all 3 newsletters
5. [Contentful] Show release status: "3/3 entries Ready for Send"
6. [Contentful] Click **Schedule release** → set publish time for 7:30pm → "Everything goes live at once. One button."
7. [Contentful] Navigate to any newsletter entry → show **Roles** context: "Producers can edit content but can't touch the ad slot — that's locked to ad ops. Same separation you have today, encoded in the tool."

---

## Tell — Tie to Outcomes

- **For Kalyn:** "This is your real checklist — 'copy edited', 'legal checked', 'ready to send' — living in the same system as the content. No Slack thread, no Google Doc, no 'which version is current?'"
- **For MT:** "If you spin up a Sunday producer with a different checklist — Vault, Tech, Defense, Portal all on the same day — that's its own workflow stream, same content types."
- **Audit hook:** "If anyone asks what went out and who approved it, you answer in seconds."

---

## Entry Reference

| Entry | Workflow State | Notes |
|-------|---------------|-------|
| AM Newsletter – April 10 | Ready for Send | Pre-set |
| Midday Newsletter – April 10 | In Review | Advance during demo |
| PM Newsletter – April 10 | Draft | Advance to In Review |
| April 10 Editions | Release | Contains all 3, not yet published |

---

## Reset Checklist

- [ ] AM Newsletter: **Ready for Send**
- [ ] Midday Newsletter: **In Review**
- [ ] PM Newsletter: **Draft**
- [ ] "April 10 Editions" Release exists, contains all 3 entries, NOT already published
- [ ] Contentful Workflows enabled on the space (Settings → Workflows)
