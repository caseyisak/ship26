---
id: loop-1-acquisition-homepage
customer: wow
build_type: net-new
promotion_status: demo-only
personas:
  - Marketing Manager
  - Digital VP
  - CMO
industries:
  - Telecommunications
  - ISP
pain_signals:
  - "Our homepage shows the same thing to every visitor"
  - "We can't personalize without a dev deploy"
  - "We're running campaigns for fiber and TV but they land on the same page"
  - "We need to react to what someone looked at before they got to the homepage"
contentful_features:
  - Ninetailed Personalization
  - Entry replacement
  - NT identify() via URL visit
  - NT metrics track() on CTA
content_types:
  - id: hero
    status: existing
    note: Baseline + 2 variants (fiber, streaming)
  - id: banner
    status: existing
    note: Baseline + 2 variants (fiber, streaming)
  - id: features
    status: existing
    note: 3-col auto-detect when 3 items
  - id: page
    status: existing
    note: home, fiber-internet, youtube-tv pages
  - id: nt_experience
    status: existing
    note: 4 experiences wired to homepage hero + banner baselines
  - id: nt_audience
    status: existing
    note: fiber-interest, streaming-interest audiences
components:
  - Hero
  - Banner
  - Features
  - PageTracker (new — fires identify() on mount)
setup_minutes: 5
---

**What this shows:** A visitor browses the Fiber Internet page, and when they return to the homepage, the hero and banner have already updated to reflect their interest — with no login required, no cookie popup, no backend change.

---

## Tell — Reflect Their Pain

Most ISP homepages are billboards. Same message to everyone, regardless of what they came from or where they're going. You're running separate campaigns for fiber and for TV, but they all land on the same "Check Availability" hero.

Ninetailed lets you personalize that moment based on what someone actually did — without a code deploy, without a segment refresh. The content editor makes the call. The experience changes in real time.

---

## Show — Click Path

1. [Browser] Open `http://localhost:3000/page/wow-home` — show the baseline homepage: "Price-Locked Fiber Internet", generic availability CTA
2. [Browser] Click the **Fiber Internet** feature card — navigates to `/fiber-internet`
3. [Browser] On the Fiber page, point out the PageTracker fires `identify({ interest: 'fiber' })` on mount (check NT preview panel ⚙️)
4. [Browser] Navigate back to `http://localhost:3000/page/wow-home`
5. [Browser] Hero now reads **"Fiber just arrived in your area. Up to 1 Gig."** — banner updated to "Up to 1 Gig from $40/mo — Price Locked."
6. [Contentful] Open **WOW Homepage Hero — Baseline** → `https://app.contentful.com/spaces/uumzxfocy3ef/environments/wow/entries/4h3OJejiKENyRPI5JFeZLN`
7. [Contentful] Show the Ninetailed tab — 2 experiences linked, each tied to an audience, no code required
8. [Browser] Repeat step 2 for the **YouTube TV** feature card → `/youtube-tv` → identify fires `{ interest: 'streaming' }` → back to homepage → hero/banner update again

---

## Tell — Tie to Outcomes

- **Marketing owns the message.** The editor creates the variant, sets the audience, hits publish. IT is not in the loop.
- **One entry, infinite contexts.** The same Hero component serves every visitor — Ninetailed decides which version they see based on what they've done.
- **The data builds over time.** After two weeks of traffic, the NT analytics panel shows which fiber message drove more availability checks. That's your A1 experiment proof point.

---

## Entry Reference

| Entry | Content Type | ID | Status | Preview URL |
|---|---|---|---|---|
| WOW Homepage Hero — Baseline | hero | `4h3OJejiKENyRPI5JFeZLN` | published | `http://localhost:3000/preview/hero/4h3OJejiKENyRPI5JFeZLN` |
| WOW Homepage Hero — Fiber Variant | hero | `2ADR7Zm0tkRMHNt9CsNVNg` | published | `http://localhost:3000/preview/hero/2ADR7Zm0tkRMHNt9CsNVNg` |
| WOW Homepage Hero — Streaming Variant | hero | `4KE32PoxYPzW4c1IbtJ4T2` | published | `http://localhost:3000/preview/hero/4KE32PoxYPzW4c1IbtJ4T2` |
| WOW Homepage Banner — Baseline | banner | `1aEhC9vmXW1JEe1ntpO99E` | published | `http://localhost:3000/preview/banner/1aEhC9vmXW1JEe1ntpO99E` |
| WOW Homepage Banner — Fiber Variant | banner | `6RRkJHSi0APCcTgJrW5uKe` | published | — |
| WOW Homepage Banner — Streaming Variant | banner | `21VP1LQWPhjWfA0gHlRwjI` | published | — |
| WOW Homepage Features | features | `17UfMWcAZmQRfm2fRo50WF` | published | — |
| WOW Home (page) | page | `4s7PoJe7jhG4K3xNcAUdn5` | published | — |
| WOW Fiber Internet (page) | page | `4q9ARlNeFson8rTWGDvBE` | published | — |
| WOW YouTube TV (page) | page | `5dWIUbFwRz6ypOfqZ4EIN2` | published | — |
| NT Exp: Homepage Hero — Fiber Market | nt_experience | `45G7sC84eOrsF0rdPYsPwg` | published | — |
| NT Exp: Homepage Hero — Streaming Market | nt_experience | `1jOGs27R6WaeUtYF2XYFew` | published | — |
| NT Exp: Homepage Banner — Fiber Market | nt_experience | `15jSzl3WIcljcMMPtOAokz` | published | — |
| NT Exp: Homepage Banner — Streaming Market | nt_experience | `5KiJ7yebewc8OwuwtwUoKr` | published | — |
| NT Audience: Fiber Interest | nt_audience | `56oWuinrUlYervWj6b5GlO` | published | — |
| NT Audience: Streaming Interest | nt_audience | `2MxaCdhm7yYUfx7K2CkxSW` | published | — |

---

## Reset Checklist

- [ ] Dev server running at `localhost:3000` from `/Users/casey.lisak/Dev/metafi-worktrees/demo-wow-personalization-2026-04`
- [ ] NT overlay ⚙️ visible on homepage (confirms NT is connected and running)
- [ ] Homepage hero shows baseline: "Price-Locked Fiber Internet"
- [ ] Homepage banner shows baseline: "See what's available at your address"
- [ ] To reset personalization: open NT overlay → clear profile, or open an incognito window
- [ ] Images: Casey needs to upload WOW hero image to wow env assets and link to homepage hero (current entry has no media)
