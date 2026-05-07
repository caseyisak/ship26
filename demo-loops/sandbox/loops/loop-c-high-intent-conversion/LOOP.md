---
id: loop-c-high-intent-conversion
customer: sandbox
build_type: sandbox
promotion_status: sandbox
personas:
  - Growth Marketer
  - Revenue Leader
  - Sales Leader
industries:
  - All
pain_signals:
  - "prospects visit pricing but don't convert"
  - "we can't act on intent signals in real time"
  - "our sales team doesn't know who's hot"
  - "we treat all visitors the same even after they show interest"
  - "we have to wait for a form fill before we can personalize"
  - "our pricing page has a terrible conversion rate and we don't know why"
contentful_features:
  - Ninetailed Personalization
  - Content Modeling
  - Live Preview
  - Releases
content_types:
  - id: hero
    status: existing
    note: High-intent hero variant — more urgent headline and CTA, triggered when customer_type = 'premium'
  - id: banner
    status: existing
    note: Discount banner with {{first_name}} merge tag — visible only to high-intent audience, resolves first name from NT profile traits
  - id: nt_experience
    status: existing
    note: Two experiences — one wires the high-intent hero variant, one wires the discount banner
  - id: nt_audience
    status: existing
    note: "Customer Type — Premium" (ID 68QIUQcYy6JtPpKt2N0Dnr) — matches customer_type trait = 'premium'
components:
  - hero (src/cms-components/hero/hero.tsx)
  - banner (src/cms-components/banner/banner.tsx)
  - login-modal (fires ninetailed.identify on sign-in)
  - nt-preview-panel (⚙️ gear icon — shows active audience + variant)
setup_minutes: 15
---

**What this shows:** The moment a visitor signals high intent — by visiting the pricing page — they get a completely different experience on the homepage: a more urgent hero AND a banner with their first name and a specific offer. No form fill. No delay. Triggered automatically by Ninetailed + Contentful, controlled entirely by your marketing team. The merge tag brings the same first-name personalization your email team uses to your website — one entry, no duplicate content per persona.

---

## Tell — Reflect Their Pain

"Pricing page visits are the clearest intent signal you have. Someone went to pricing — they're evaluating, maybe comparing. And right now, what do you do with that? Probably nothing. They leave, maybe come back tomorrow, and see the exact same homepage they saw before.

What we're showing here is how Contentful and Ninetailed let you react to that signal in real time. The moment someone hits pricing, their next homepage visit shows a completely different experience — a more urgent hero AND a banner with their first name and a specific offer. Your email team already does this with merge tags. This brings the same capability to your website. Your content team controls the template, the offer, and the urgency. Engineering is never in the loop."

---

## Show — Click Path

1. **[Browser]** Log in as Persona C (High Intent) via the login modal
   `http://localhost:3000/page/home?preview=true`
   - Click **Login** → sign in as Premium User (customer_type: `premium`)
   - *"In a real setup, this trait fires when a visitor reaches your pricing page — or hits any intent threshold you define. We're simulating it with a login for the demo."*

2. **[Browser]** Show the high-intent hero variant now visible on the homepage
   - Point to: headline (more urgent), CTA (conversion-focused)
   - *"This visitor just signaled intent. Their homepage immediately reflects that — not after a form fill, not after a sales rep calls. Now."*

3. **[Browser]** Scroll down — discount banner is visible (personalized for this audience only)
   - Banner reads: "{{first_name}}, you've been exploring — here's something to make the decision easier. Get 20% off your first year."
   - *"Notice the merge tag. When Persona C logs in, the banner resolves their first name from the NT profile traits — same mechanism your ESP uses for email personalization, now running on your site."*

4. **[Browser]** Navigate to `/page/pricing?preview=true` to show the pricing page exists
   `http://localhost:3000/page/pricing?preview=true`
   - *"In production, visiting this page is the trigger. Ninetailed matches the audience rule on the next page load."*

5. **[Browser]** Click the **⚙️** gear icon (bottom of page)
   - NT panel opens — show **High Intent** audience active (green dot, highlighted)
   - Point out: `customer_type: premium` trait showing in the debug panel
   - *"Green dot means this audience matched. That's the only configuration required — one audience rule, one trait."*

6. **[Contentful]** Open the **High Intent Hero** NT experience entry
   `https://app.contentful.com/spaces/uumzxfocy3ef/environments/master/entries/44TqmMBSfzojdSbujjqaX4`
   - Show: audience linked (`Customer Type — Premium`)
   - Show: variant hero entry linked
   - *"One experience entry. Audience → variant. That's the entire setup."*

7. **[Contentful]** Open the **Discount Banner** entry linked in the banner NT experience
   - Show: `headline` = "{{first_name}}, you've been exploring — here's something to make the decision easier. Get 20% off your first year."
   - *"Notice the merge tag. The content team wrote this once. Ninetailed fills in the name. No dev ticket, no duplicate entry per persona."*
   - Live-edit the discount percentage — change from **20%** to **30%**
   - *"Watch the banner."*

8. **[Browser]** Scroll back to the discount banner — it now reads "...Get 30% off your first year."
   - *"Your retention team just changed a live offer in 10 seconds. No deploy. If it's not converting, they change it again."*

---

## Tell — Tie to Outcomes

- **For Growth Marketers:** "You're no longer treating pricing visitors the same as homepage browsers. The moment someone signals intent, they get a different experience. That's personalization doing what it's supposed to do."
- **For Revenue Leaders:** "This offer is completely controlled by your marketing team. When a campaign ends, they update the copy and turn off the banner. No sprint. No hotfix."
- **For Sales Leaders:** "Your sales team can know exactly who hit pricing and didn't convert — and the site already gave them a reason to come back. Before they ever fill out a form."

**Urgency line:** *"Every high-intent visitor who bounces off pricing without seeing a targeted experience is a missed conversion your team could have had this week."*

---

## Metrics

Loop C measures offer effectiveness and macro-conversion for high-intent visitors. These are the metrics that prove personalization ROI to a CMO.

| Metric | NT event | Attach to | What it measures |
|---|---|---|---|
| Hero CTA Clicked | `Hero CTA Clicked` | `3UMQQgfU0ukuB04rBUP5Pp` (High Intent Hero XP) | Does the urgent headline drive more CTA engagement than the baseline? |
| Pricing Page Visited | `Pricing Page Visited` | `3UMQQgfU0ukuB04rBUP5Pp` (High Intent Hero XP) | Intent signal — high-intent visitors should visit pricing at above-baseline rate |
| Auth Completed | `Auth Completed` | `3UMQQgfU0ukuB04rBUP5Pp` (High Intent Hero XP) | **The CMO metric** — sign-up rate for high-intent segment vs baseline |
| Dashboard Activated | `Dashboard Activated` | `3UMQQgfU0ukuB04rBUP5Pp` (High Intent Hero XP) | Activation — did the sign-up lead to product engagement? Validates quality not just quantity |
| Banner CTA Clicked | `Banner CTA Clicked` | `3Sb7DlOGStyAOCV8FbHVLc` (Discount Banner XP) | Was the offer compelling? Low CTR = adjust the offer percentage or framing |
| Banner Dismissed | `Banner Dismissed` | `3Sb7DlOGStyAOCV8FbHVLc` (Discount Banner XP) | High dismiss rate = banner is noise, offer is not landing |
| Auth Completed | `Auth Completed` | `3Sb7DlOGStyAOCV8FbHVLc` (Discount Banner XP) | Did the discount banner contribute to sign-ups independent of the hero? |
| Personalized Experience Viewed | `Personalized Experience Viewed` | Both XPs | Impression denominator for CTR math |
| Auth Modal Opened | `Auth Modal Opened` | `3UMQQgfU0ukuB04rBUP5Pp` (High Intent Hero XP) | Funnel gap — high CTA clicks but low modal opens = friction on the destination page |

**The CMO story:** "High-intent visitors who saw the urgent hero + discount banner converted to free trial at X× the baseline rate. The personalization paid for itself in the first month."

**Full metrics setup and implementation:** See `demo-loops/sandbox/loops/loop-d-conversion-metrics/LOOP.md`

---

## Visual Test

**Setup:** Open incognito (or clear localStorage + cookies) → `http://localhost:3000/page/home?preview=true`

1. Confirm logged-out state — navbar shows **Login** button
2. Observe hero → should be baseline copy, no discount banner
3. Click **Login** → sign in as **Premium User** (purple dot, `customer_type: premium`)
4. Page stays on `/page/home?preview=true` — observe hero section
5. Scroll down — observe discount banner
6. Click **⚙️** gear icon → NT panel opens
7. In Contentful, open discount banner entry `5NCMzyA5b9oYgZaqM9ZoOW` → live-edit headline (e.g. change "20%" to "25%") → observe banner in browser

**Pass:**
- [ ] Before login: baseline hero, no discount banner
- [ ] After login: hero shows high-intent variant — "You've been exploring. Let's make the decision easy…"
- [ ] After login: discount banner visible — merge tag resolves to persona's first name (not raw `{{first_name}}`)
- [ ] NT panel → **Customer Type — Premium** audience active (green dot); `experienceVariantIndexes` shows entries for `3UMQQgfU0ukuB04rBUP5Pp` and `3Sb7DlOGStyAOCV8FbHVLc`
- [ ] Live edit: discount % change reflects in banner without page reload
- [ ] Navbar shows persona name + purple dot (not Login button)

---

## Entry Reference

| Entry | Content Type | ID | Status | Preview URL |
|---|---|---|---|---|
| Customer Type — Premium (NT Audience) | nt_audience | `68QIUQcYy6JtPpKt2N0Dnr` | published | — |
| High Intent Hero Variant | hero | `3Gw5z9OtOcxTMspAoNComh` | published | — |
| High Intent Hero NT Experience | nt_experience | `3UMQQgfU0ukuB04rBUP5Pp` | published | — |
| Discount Banner (High Intent only) | banner | `5NCMzyA5b9oYgZaqM9ZoOW` | published | `http://localhost:3000/page/home?preview=true` |
| Discount Banner NT Experience | nt_experience | `3Sb7DlOGStyAOCV8FbHVLc` | published | — |

---

## Reset Checklist

- [ ] Dev server running at `http://localhost:3000` from `main` worktree
- [ ] Logged out before starting — `/page/home?preview=true` shows new-visitor baseline hero, no discount banner
- [ ] High intent hero variant `3Gw5z9OtOcxTMspAoNComh` published, NT XP `3UMQQgfU0ukuB04rBUP5Pp` active
- [ ] Discount banner `5NCMzyA5b9oYgZaqM9ZoOW` published (headline includes `{{first_name}}` merge tag), NT XP `3Sb7DlOGStyAOCV8FbHVLc` active
- [ ] Login modal available — click Login → sign in as Premium User → `identify({ customer_type: 'premium' })` fires
- [ ] ⚙️ NT panel shows "High Intent" / "Customer Type — Premium" audience active (green dot) after login
- [ ] Discount banner visible on homepage scroll after login — invisible when logged out
- [ ] Pricing page renders at `/page/pricing?preview=true`
- [ ] `.env.local` has `NEXT_PUBLIC_NINETAILED_API_KEY` and `NEXT_PUBLIC_NINETAILED_ENVIRONMENT=main`
- [ ] Banner merge tag resolves correctly — after Persona C login, banner reads "Kaz, you've been exploring..." not raw {{first_name}}
