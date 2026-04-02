---
id: loop-3-retention-save-offer
customer: wow
build_type: net-new
promotion_status: demo-only
personas:
  - VP of Customer Experience
  - Head of Retention
  - CMO
industries:
  - Telecommunications
  - ISP
pain_signals:
  - "By the time we identify at-risk customers, they've already called to cancel"
  - "We have save offers but they're buried in the call center script"
  - "We can't surface a loyalty offer in the portal without a dev cycle"
  - "Our churn rate is improving but our digital channel doesn't reflect our retention strategy"
contentful_features:
  - Ninetailed Personalization
  - Entry replacement
  - NT identify() at login with at_risk trait
  - Dashboard hero slot serving save offer content
content_types:
  - id: hero
    status: existing
    note: Dashboard baseline + at-risk save offer variant
  - id: nt_experience
    status: existing
    note: At-Risk Save Offer experience linked to dashboard hero baseline
  - id: nt_audience
    status: existing
    note: logged-in-at-risk audience (isLoggedIn=true AND at_risk=true)
components:
  - Hero
  - Dashboard page
  - Login modal with persona picker
setup_minutes: 5
---

**What this shows:** An at-risk customer logs in and immediately sees a proactive loyalty save offer in their dashboard — not a generic "Check Availability" banner, but a specific, personalized "We value your loyalty" message with a real dollar amount — served by Contentful, triggered by a customer trait, with no dev involvement.

---

## Tell — Reflect Their Pain

At-risk customers don't announce themselves. By the time they call to cancel, the relationship is already damaged. The best retention moment is the one that happens before they pick up the phone.

You have the data. You know which customers are at risk — your CRM flags them, your usage model identifies them. But getting that signal into the digital experience? That's three sprints and a deployment freeze.

Contentful + Ninetailed closes that loop. When your system flags a customer as at-risk, their next login serves them a loyalty offer — not a generic homepage, a specific message with a specific number: "Save $120 over 12 months."

---

## Show — Click Path

1. [Browser] Open `http://localhost:3000/page/wow-home`
2. [Browser] Click **Sign In** — select **"At-Risk Customer"** from persona picker
3. [Browser] Redirected to `/dashboard` — hero shows **"We've got a loyalty offer — lock in your speed and save $120 over 12 months."**
4. [Browser] Point out: this is the same Hero component slot used for the upsell in Loop 2. Same slot, different message, different audience.
5. [Contentful] Open **WOW Dashboard Hero — At-Risk** → `https://app.contentful.com/spaces/uumzxfocy3ef/environments/wow/entries/2RDoMD6DNI144qlF0DD3K6`
6. [Contentful] Show the content — headline, subheadline, CTA. This is what the retention team controls. No dev involvement.
7. [Contentful] Open **NT Exp: Dashboard Hero — At-Risk Save Offer** → `https://app.contentful.com/spaces/uumzxfocy3ef/environments/wow/entries/57yXVnekT3xNRVMDLOth99`
8. [Contentful] Show the audience link: "Logged In — At Risk" (`isLoggedIn: true, at_risk: true`). The audience is a data contract between your CRM and Contentful.

---

## Tell — Tie to Outcomes

- **Retention becomes proactive.** The offer surfaces the moment an at-risk customer logs in — before they consider calling to cancel.
- **The retention team owns the message.** Headline, dollar amount, urgency framing — editor-controlled. When the offer expires, they swap it in 2 minutes.
- **The data contract is explicit.** Your CRM passes `at_risk: true` on identify. Ninetailed matches it to the audience. Contentful serves the variant. Three systems, clean separation of concerns.

---

## Entry Reference

| Entry | Content Type | ID | Status | Preview URL |
|---|---|---|---|---|
| WOW Dashboard Hero — Baseline | hero | `7iat0YeLSovtE2QbGWuks` | published | `http://localhost:3000/preview/hero/7iat0YeLSovtE2QbGWuks` |
| WOW Dashboard Hero — At-Risk | hero | `2RDoMD6DNI144qlF0DD3K6` | published | `http://localhost:3000/preview/hero/2RDoMD6DNI144qlF0DD3K6` |
| NT Exp: Dashboard Hero — At-Risk Save Offer | nt_experience | `57yXVnekT3xNRVMDLOth99` | published | — |
| NT Audience: Logged In — At Risk | nt_audience | `5Y2dPpgLIsMcIuEgfVAU3E` | published | — |
| WOW Settings | settings | `4yvNwoEl3213IAdefmZVMt` | published | — |

---

## Reset Checklist

- [ ] Dev server running at `localhost:3000` from `/Users/casey.lisak/Dev/metafi-worktrees/demo-wow-personalization-2026-04`
- [ ] Not logged in before starting
- [ ] NT overlay ⚙️ shows no active profile
- [ ] To reset: click Sign Out, or clear NT profile via overlay, or use incognito
- [ ] If running after Loop 2: must re-login as At-Risk persona (NT profile from Loop 2 may still be active)
