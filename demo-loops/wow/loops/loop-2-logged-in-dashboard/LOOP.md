---
id: loop-2-logged-in-dashboard
customer: wow
build_type: net-new
promotion_status: demo-only
personas:
  - Digital Product Manager
  - VP of Customer Experience
  - CMO
industries:
  - Telecommunications
  - ISP
pain_signals:
  - "Our logged-in portal is generic — everyone sees the same dashboard"
  - "We have offers for upsell but marketing can't get them into the app"
  - "We need to show the right NBO to the right customer without involving dev"
  - "Our app is ours but the promotional slots should be content-driven"
contentful_features:
  - Ninetailed Personalization
  - Entry replacement
  - NT identify() at login with customer traits
  - Settings CT as config store (dashboardHeroEntryId, dashboardNboTileIds)
content_types:
  - id: hero
    status: existing
    note: Dashboard baseline + 2 variants (speed-upsell, tv-eligible)
  - id: banner
    status: existing
    note: 3 NBO tiles (autopay, speed, tv) — selectively shown via NT
  - id: settings
    status: existing
    note: dashboardHeroEntryId + dashboardNboTileIds wired to WOW Settings
  - id: nt_experience
    status: existing
    note: Speed Upsell Hero, TV Eligible Hero, Autopay Banner experiences
  - id: nt_audience
    status: existing
    note: logged-in-speed-upsell, logged-in-tv-eligible, logged-in-no-autopay
components:
  - Hero
  - Banner
  - Dashboard page (custom /dashboard route simulating OAM app chrome)
  - Login modal with persona picker
setup_minutes: 5
---

**What this shows:** A customer logs in and the dashboard immediately reflects their account context — a 300 Mbps customer sees a speed upgrade offer, a TV-eligible customer sees a YouTube TV bundle pitch — all without a code change, driven by Contentful.

---

## Tell — Reflect Their Pain

Your logged-in portal is mostly your code. Your logic, your data, your design. That's fine — and that's the point. Contentful isn't trying to take over your app.

But those promotional slots? The upsell banner at the top, the NBO tile in the middle? Right now those are hardcoded strings buried in a dev sprint. Every new offer requires a ticket, a deploy, a QA cycle.

What if marketing could update those slots directly — and they automatically show the right message to the right customer based on what Contentful already knows about them?

---

## Show — Click Path

1. [Browser] Open `http://localhost:3000/page/wow-home` — show baseline homepage
2. [Browser] Click **Sign In** in the nav
3. [Browser] In the login modal, show the persona dropdown — 4 options: "300 Mbps Customer (Upsell)", "TV-Eligible Customer", "No Autopay Customer", "At-Risk Customer"
4. [Browser] Select **"300 Mbps Customer (Upsell)"** → click Sign In
5. [Browser] Redirected to `/dashboard` — hero shows **"Upgrade to 1 Gig for +$20/mo. Lock in the price."**
6. [Contentful] Open **WOW Dashboard Hero — Baseline** → `https://app.contentful.com/spaces/uumzxfocy3ef/environments/wow/entries/7iat0YeLSovtE2QbGWuks`
7. [Contentful] Show the Ninetailed tab — 3 experiences linked. The logged-in traits passed at login (`isLoggedIn: true, current_speed_tier: 300mbps`) match the Speed Upsell audience.
8. [Browser] Go back, log in as **"TV-Eligible Customer"** — dashboard hero now shows "Add YouTube TV — 100+ channels, save up to $15."
9. [Browser] Point to the NBO tiles — banner slots driven by Contentful, personalized by NT

---

## Tell — Tie to Outcomes

- **Marketing controls the offer.** The NBO copy, the CTA, the audience criteria — all editor-controlled. No sprint required.
- **Your app stays yours.** The portal chrome, account data, usage stats — all yours. Contentful only touches the slots you give it.
- **One settings entry as the contract.** `dashboardHeroEntryId` and `dashboardNboTileIds` in the WOW Settings entry are the only coupling between your app and Contentful. Swap entry IDs to change the entire experience.

---

## Entry Reference

| Entry | Content Type | ID | Status | Preview URL |
|---|---|---|---|---|
| WOW Dashboard Hero — Baseline | hero | `7iat0YeLSovtE2QbGWuks` | published | `http://localhost:3000/preview/hero/7iat0YeLSovtE2QbGWuks` |
| WOW Dashboard Hero — Speed Upsell | hero | `6nrPEBl9RaulJuob7nw0as` | published | `http://localhost:3000/preview/hero/6nrPEBl9RaulJuob7nw0as` |
| WOW Dashboard Hero — TV Eligible | hero | `6NzS3BVVsQnlDXc6P0wfR8` | published | `http://localhost:3000/preview/hero/6NzS3BVVsQnlDXc6P0wfR8` |
| WOW Dashboard Banner — Autopay NBO | banner | `2YAnkwuSnB8EXqgZFyDp2A` | published | — |
| WOW Dashboard Banner — Speed NBO | banner | `5ng2CRuRrbSfcTc3ibBz1L` | published | — |
| WOW Dashboard Banner — TV NBO | banner | `tbT55HQH80cLiAayl3ch4` | published | — |
| WOW Settings | settings | `4yvNwoEl3213IAdefmZVMt` | published | — |
| NT Exp: Dashboard Hero — Speed Upsell | nt_experience | `7cZKynDCL5vM5L7otQ92x` | published | — |
| NT Exp: Dashboard Hero — TV Eligible | nt_experience | `6TSCHbTCtzWo1Jm9l4zFRZ` | published | — |
| NT Exp: Dashboard Banner — Autopay NBO | nt_experience | `76bp3S7LTTj1RcsIKpsc3P` | published | — |
| NT Audience: Logged In — Speed Upsell | nt_audience | `6wSSLORwEqsiznyga2XVxL` | published | — |
| NT Audience: Logged In — TV Eligible | nt_audience | `6vOGGb4aBBs7jbEnqyERS6` | published | — |
| NT Audience: Logged In — No Autopay | nt_audience | `4Syv0ws3qJdmZ0oFefgI8o` | published | — |

---

## Reset Checklist

- [ ] Dev server running at `localhost:3000` from `/Users/casey.lisak/Dev/metafi-worktrees/demo-wow-personalization-2026-04`
- [ ] Not logged in (nav shows "Sign In")
- [ ] NT overlay ⚙️ shows no active profile
- [ ] To reset between personas: click Sign Out, or open incognito window
- [ ] WOW Settings entry (`4yvNwoEl3213IAdefmZVMt`) has correct dashboardHeroEntryId = `7iat0YeLSovtE2QbGWuks`
