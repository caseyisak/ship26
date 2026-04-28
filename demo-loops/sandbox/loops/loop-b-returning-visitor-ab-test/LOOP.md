---
id: loop-b-returning-visitor-ab-test
customer: sandbox
build_type: sandbox
promotion_status: sandbox
personas:
  - Growth Marketer
  - CRO Specialist
  - Digital Experience Lead
industries:
  - All
pain_signals:
  - "we're guessing what messaging works"
  - "we can't run tests without dev involvement"
  - "A/B testing takes months"
  - "repeat visitors see the same thing every time"
  - "our experimentation tool is completely disconnected from our CMS"
  - "we have no idea which homepage message is driving conversions"
contentful_features:
  - Ninetailed A/B Testing
  - Content Modeling
  - Live Preview
content_types:
  - id: hero
    status: existing
    note: Three hero variant entries (Velocity, Proof, Control) wired into the NT experience. Same component, different content per variant.
  - id: banner
    status: existing
    note: Return Visitor Nurture banner — visible only to returning visitor audience, no merge tags required.
  - id: nt_experience
    status: existing
    note: "Hero — 3-Way Messaging A/B/C Test" — 33/33/34 traffic split, three hero variants, returning visitor audience rule. Plus a separate experience for the nurture banner.
  - id: nt_audience
    status: existing
    note: "Customer Type — Returning" — matches customer_type trait = 'returning', fires on identify().
components:
  - hero (src/cms-components/hero/hero.tsx)
  - banner (src/cms-components/banner/banner.tsx)
  - login-modal (fires ninetailed.identify on sign-in)
  - nt-preview-panel (⚙️ gear icon — shows active audience + variant)
setup_minutes: 10
---

**What this shows:** Returning visitors are automatically split across three hero messaging variants — Velocity, Proof, and Control — with no engineering involvement. Contentful editors control the copy, the split, and the variants. The winner gets promoted by swapping a content entry, not a code deploy. A nurture banner also appears for this audience, shifting the experience from acquisition to nurture automatically.

---

## Tell — Reflect Their Pain

"Here's the problem most teams run into: they want to test messaging, but running an A/B test means filing a ticket, waiting for dev to instrument the test, then waiting weeks for statistical significance — while randomly splitting ALL your traffic. First-time visitors, return visitors, high-intent buyers, all mixed into the same pool. VWO and Optimizely require 6–12 months from purchase to first test. And the test is completely disconnected from your CMS.

What you're about to see is a 3-way messaging test running exclusively on return visitors — the segment most likely to tell you which message breaks through their hesitation. Your editors created all three variants in Contentful. No Jira ticket. No sprint. When the winner is clear, they promote it by changing one reference field."

---

## Show — Click Path

1. **[Browser]** Log in as Persona B (Returning Customer) via the login modal
   `http://localhost:3000/page/home?preview=true`
   - Click **Login** → sign in as Returning Customer (customer_type: `returning`)
   - *"This fires the same NT identify() call your app would make on a real login."*

2. **[Browser]** Show the hero variant currently active for this persona
   - Observe which of the three variants is displayed (varies by session/traffic split)
   - *"This visitor is in the returning audience. They're being shown one of three hero variants — we'll see exactly which one in a moment."*

3. **[Browser]** Click the **⚙️** gear icon (bottom of page)
   - NT preview panel opens — confirm: **Return Visitor — Low Engagement** audience highlighted (green dot)
   - Show: active variant name + experience name
   - *"This is the NT debug overlay. In production this is hidden from real visitors — you'd see this in your analytics."*

4. **[Contentful]** Open the **Hero — 3-Way Messaging A/B/C Test** NT experience entry
   `https://app.contentful.com/spaces/uumzxfocy3ef/environments/master/entries/6gZyrNnCaLymz0Azi7OvIL`
   - Show: audience linked (`Customer Type — Returning` — ID `6G8BGn5d1B8yhU2EHsSBtk`)
   - Show: 3 variants in the variants array — 33% / 33% / 34% traffic split
   - *"Three variants. One experience entry. Your editor set the split by typing a number."*

5. **[Contentful]** Click into **Variant A — Velocity**
   - Show: `headline` = "Already exploring? See how teams like yours move from idea to live in days, not sprints."
   - Show: `subheadline`, `ctaText`
   - *"Speed-to-market angle. One-third of your returning visitors see this right now."*

6. **[Contentful]** Navigate to **Variant B — Proof**
   - Show: `headline` = "Not ready to commit? Join 4,000+ teams who ditched the dev queue — start free."
   - *"Social proof with low-friction CTA. Works for prospects who are evaluating and need reassurance."*

7. **[Contentful]** Navigate to **Variant C — Control**
   - Show: `headline` = "Your content team in the driver's seat. No tickets. No waiting. See it live."
   - *"Marketer ownership angle. Speaks directly to the pain of depending on engineering for every change."*

8. **[Contentful]** Use the NT preview plugin to switch between variants — browser hero updates live
   - *"When the data comes back, say Variant B is winning — you promote it by updating the baseline reference. One save. No deploy. The experiment is over."*

### Return Visitor Banner

9. **[Browser]** Scroll down — a nurture banner is visible (return visitor audience only)
   - Banner reads: "Still exploring your options? Here's what teams like yours found most helpful → Read the guide"
   - *"No merge tags here — NT doesn't need to know their name. It just needs to know they've been here before. The banner shifts from acquisition to nurture automatically. That one swap moves them one step further down the funnel."*

10. **[Contentful]** Open the **Banner — Return Visitor Nurture** entry
    `https://app.contentful.com/spaces/uumzxfocy3ef/environments/master`
    - Show headline field: "Still exploring your options? Here's what teams like yours found most helpful"
    - *"Written once. Served to every return visitor. No merge tags required — the personalization is the audience swap itself."*

---

## Tell — Tie to Outcomes

- **For Growth Marketers:** "You just ran a 3-way messaging experiment without touching a single line of code. Your experimentation velocity just tripled."
- **For CRO Specialists:** "The split is controlled by a number field in Contentful. When the winner is clear, you retire the test by swapping a reference — not by filing a dev ticket."
- **For Digital Experience Leads:** "The hero component is the same for every variant. Personalization and testing happen at the content layer, not the code layer. That's how you scale without accumulating technical debt."

**Urgency line:** *"Every week you're running one homepage for all returning visitors is a week you're leaving conversion data on the table. This test is live in minutes."*

---

## Variant Reference

| Variant | Headline | Angle | Traffic |
|---|---|---|---|
| A — Velocity | "Already exploring? See how teams like yours move from idea to live in days, not sprints." | Speed-to-market | 33% |
| B — Proof | "Not ready to commit? Join 4,000+ teams who ditched the dev queue — start free." | Social proof / low friction | 33% |
| C — Control | "Your content team in the driver's seat. No tickets. No waiting. See it live." | Marketer ownership | 34% |

---

## Metrics

Loop B is an A/B test. Metrics here declare the winner and measure whether the nurture banner is converting or creating noise.

| Metric | NT event | Attach to | What it measures |
|---|---|---|---|
| Hero CTA Clicked | `Hero CTA Clicked` | `6gZyrNnCaLymz0Azi7OvIL` (Hero A/B/C Test) | Primary winner declaration signal — CTR per variant |
| Pricing Page Visited | `Pricing Page Visited` | `6gZyrNnCaLymz0Azi7OvIL` (Hero A/B/C Test) | Two-metric gate — intent downstream of hero CTA |
| Scroll Depth Reached | `Scroll Depth Reached` | `6gZyrNnCaLymz0Azi7OvIL` (Hero A/B/C Test) | A/B support signal — did the variant hold attention below fold? |
| Personalized Experience Viewed | `Personalized Experience Viewed` | `6gZyrNnCaLymz0Azi7OvIL` (Hero A/B/C Test) | Impression denominator — needed to calculate CTR |
| Banner CTA Clicked | `Banner CTA Clicked` | `3GZXiJhiUA1Hid7ECMTI2n` (Nurture Banner XP) | Measures whether nurture offer is compelling |
| Banner Dismissed | `Banner Dismissed` | `3GZXiJhiUA1Hid7ECMTI2n` (Nurture Banner XP) | Signal-to-noise — dismiss:CTA ratio above 3:1 = message is wrong |
| Newsletter Form Submitted | `Newsletter Form Submitted` | `3GZXiJhiUA1Hid7ECMTI2n` (Nurture Banner XP) | Nurture conversion — lower-friction funnel entry for undecided visitors |
| Auth Completed | `Auth Completed` | `6gZyrNnCaLymz0Azi7OvIL` (Hero A/B/C Test) | Macro-conversion — free trial / sign-up completion per variant |

**Winner declaration gate:** Hero CTA Clicked rate **and** Pricing Page Visited rate both favor the same variant → declare winner, promote to baseline, retire the other two.

**Full metrics setup and implementation:** See `demo-loops/sandbox/loops/loop-d-conversion-metrics/LOOP.md`

---

## Visual Test

**Setup:** Open incognito (or clear localStorage + cookies) → `http://localhost:3000/page/home?preview=true`

1. Confirm logged-out state — navbar shows **Login** button, no persona dot
2. Observe hero → should be baseline ("Content powers every experience" or current baseline copy)
3. Confirm no nurture banner on the page
4. Click **Login** → sign in as **Returning Customer** (emerald dot, `customer_type: returning`)
5. Page stays on `/page/home?preview=true` — observe hero section
6. Click **⚙️** gear icon → NT panel opens
7. Scroll down — observe area above/below hero for the nurture banner

**Pass:**
- [ ] Before login: hero shows baseline copy, no nurture banner visible
- [ ] After login: hero headline is one of the 3 variants (NOT baseline) — Velocity / Proof / Control copy
- [ ] After login: nurture banner appears — "Still exploring your options?"
- [ ] NT panel → **Customer Type — Returning** audience active (green dot); `experienceVariantIndexes` shows entry for `6gZyrNnCaLymz0Azi7OvIL`
- [ ] Navbar shows persona name + emerald dot as a dropdown trigger (not Login button)

---

## Entry Reference

| Entry | Content Type | ID | Status | Preview URL |
|---|---|---|---|---|
| Hero — 3-Way Messaging A/B/C Test (NT Experience) | nt_experience | `6gZyrNnCaLymz0Azi7OvIL` | published | — |
| Customer Type — Returning (NT Audience) | nt_audience | `6G8BGn5d1B8yhU2EHsSBtk` | published | — |
| Hero Variant A — Velocity | hero | `5pdG6JX0w0zDQXglNXtied` | published | — |
| Hero Variant B — Proof | hero | `3wSboq7HQdfRPDxDhrYQY4` | published | — |
| Hero Variant C — Control | hero | `5mSd9AR203wvqRDjEz9arO` | published | — |
| Banner — Return Visitor Nurture | banner | `41KxMXPBKJkRpgws96LYo4` | published | `http://localhost:3000/page/home?preview=true` |
| NT Experience — Return Visitor Banner | nt_experience | `3GZXiJhiUA1Hid7ECMTI2n` | published | — |

---

## Reset Checklist

- [ ] Dev server running at `http://localhost:3000` from `main` worktree
- [ ] Logged out before starting — `/page/home?preview=true` shows default (new visitor) hero
- [ ] 3 hero variant entries published: A=`5pdG6JX0w0zDQXglNXtied` B=`3wSboq7HQdfRPDxDhrYQY4` C=`5mSd9AR203wvqRDjEz9arO`
- [ ] NT experience `6gZyrNnCaLymz0Azi7OvIL` has all 3 variants linked with 33/33/34 split
- [ ] NT audience `6G8BGn5d1B8yhU2EHsSBtk` rule: `customer_type equal returning`
- [ ] Login modal available — click Login → sign in as Returning Customer → persona fires `identify({ customer_type: 'returning' })`
- [ ] ⚙️ NT panel visible after login — shows "Return Visitor — Low Engagement" audience active
- [ ] `.env.local` has `NEXT_PUBLIC_NINETAILED_API_KEY` and `NEXT_PUBLIC_NINETAILED_ENVIRONMENT=main`
- [ ] Return visitor banner entry published and linked to home page sections
- [ ] NT experience for return visitor banner created and linked to audience 6G8BGn5d1B8yhU2EHsSBtk
