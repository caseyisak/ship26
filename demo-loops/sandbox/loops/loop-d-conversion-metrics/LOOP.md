---
id: loop-d-conversion-metrics
customer: sandbox
build_type: sandbox
promotion_status: sandbox
personas:
  - Growth Marketer
  - CRO Specialist
  - Revenue Leader
  - VP Marketing
  - CMO
industries:
  - All
pain_signals:
  - "we can't prove personalization is working"
  - "we don't know which variant is winning"
  - "we're guessing at what's driving conversions"
  - "we don't have the data to justify more personalization investment"
  - "we can't tell if the banner is noise or signal"
  - "our CMO wants ROI proof before we scale this"
  - "we have impressions but no downstream conversion data"
contentful_features:
  - Ninetailed Insights / Metrics
  - Ninetailed A/B Testing
  - Ninetailed Personalization
content_types:
  - id: hero
    status: existing
    note: Hero CTA tracked via Hero CTA Clicked event — primary signal for A/B test winner declaration
  - id: banner
    status: existing
    note: Banner CTA and dismissal tracked — signal-to-noise ratio for nurture and discount banners
  - id: pricing
    status: existing
    note: Pricing component fires Pricing Page Visited on mount — #1 B2B intent signal
components:
  - hero (src/cms-components/hero/hero.tsx)
  - banner (src/cms-components/banner/banner.tsx)
  - pricing (src/cms-components/pricing/pricing.tsx)
  - newsletter-form (src/cms-components/form/newsletter-form.tsx)
  - navbar (src/components/layout/navbar.tsx)
  - persona-buttons (src/app/login/persona-buttons.tsx)
  - page-content-live (src/app/page/[slug]/page-content-live.tsx)
  - block-renderer (src/block-renderer/block-renderer.tsx)
  - dashboard-top-bar (src/app/dashboard/_components/dashboard-top-bar.tsx)
setup_minutes: 20
---

**What this shows:** Personalization without measurement is just decoration. This loop shows how Ninetailed Insights closes the loop — every experience, audience, and variant is connected to downstream conversion data. Your team can declare A/B winners, prove personalization ROI to a CMO, and know whether a banner is signal or noise. All from the same platform that runs the experiences.

---

## Tell — Reflect Their Pain

"Most teams running personalization have the same problem: they can see that visitors are being bucketed into variants, but they can't see what those variants actually did. Did the Velocity headline drive more demo requests than the Proof headline? Did the discount banner convert or just annoy people? Without conversion metrics attached to your experiences, you're flying blind.

What you're about to see is how Ninetailed closes that loop. Every personalized block fires a track event. Those events become metrics. Those metrics attach to your experiences. Now you have a dashboard that tells you not just which variant was shown — but which variant won, which offer converted, and which banner should be turned off."

---

## Show — Click Path

### Part 1 — Metric setup in NT dashboard

1. **[Browser]** Log in as Persona B (Returning Visitor) → `http://localhost:3000/page/home?preview=true`
   - Hero variant renders, nurture banner appears
   - *"Now watch what happens in NT."*

2. **[Browser]** Open the NT debug panel via **⚙️** gear icon
   - Show: `activeAudiences`, `experienceVariantIndexes`
   - *"NT knows which variant this visitor is seeing. What we're adding is the downstream — what did they do next?"*

3. **[NT Dashboard]** Open Organization Settings → Optimization tab
   `https://app.ninetailed.io/`
   - Show the metrics list (after setup: Hero CTA Clicked, Banner CTA Clicked, etc.)
   - *"Each of these is an event your app fires. NT counts them and attributes them back to the experience that was active when the visitor converted."*

4. **[NT Dashboard]** Open the **Hero — 3-Way Messaging A/B/C Test** experience
   - Show: Metrics tab → Hero CTA Clicked + Pricing Page Visited attached
   - Show: Variant breakdown — CTR per variant
   - *"This is the two-metric gate for declaring a winner. CTA click rate tells you the headline worked. Pricing page visit tells you the intent was real. You need both."*

5. **[Browser]** Click the hero CTA
   - *"That just fired a Hero CTA Clicked event with ctaText, segment, and entryId. NT attributed it to Variant A — Velocity."*

### Part 2 — Banner signal/noise

6. **[Browser]** Scroll to the nurture banner → click the X dismiss button
   - *"Banner Dismissed event just fired. If dismiss rate is 3:1 over CTA clicks, the message is wrong. Your editor knows to rewrite the copy — no dev ticket."*

7. **[NT Dashboard]** Show the Banner NT experience → Metrics tab → Banner CTA Clicked vs Banner Dismissed
   - *"This ratio is the signal-to-noise test for every banner you ship. If dismissals dominate, the offer or the audience match is wrong. One field change in Contentful, re-measure."*

### Part 3 — The CMO metric

8. **[Browser]** Log in as Persona B → complete sign-up → Auth Completed fires
   - *"This is the macro-conversion. Returning visitors who saw the Proof variant converted to free trial at 3.2x the baseline. That's the one slide that gets personalization budget approved."*

9. **[NT Dashboard]** Show Auth Completed metric attached to the returning visitor experience
   - *"Attribution window is 7 days. Any Auth Completed within 7 days of an experience impression is counted. This is how you prove ROI — not just engagement."*

---

## Tell — Tie to Outcomes

- **For Growth Marketers:** "You now have a feedback loop. Variant goes live, metrics collect, winner is clear, editor promotes the winning content entry. No sprint. No dev ticket. Test velocity just tripled."
- **For CRO Specialists:** "You can declare a winner on two signals — CTA click rate AND pricing page visits. Not time-on-page, not scroll depth alone. The signals that actually predict conversion."
- **For CMOs / VP Marketing:** "Auth Completed attributed back to the experience variant is the number you put in the board deck. Personalization contributed X% of MQLs this quarter — here's the variant breakdown."

**Urgency line:** *"Every week without conversion metrics is a week your personalization is running blind. You're optimizing for impressions when you should be optimizing for revenue."*

---

## Visual Test

**Setup:** Server running, logged in as Persona B → `http://localhost:3000/page/home?preview=true`

1. Open browser DevTools → Network tab → filter by `ninetailed` or `track`
2. Click hero CTA button
3. Dismiss the nurture banner (X button)
4. Navigate to `/page/pricing?preview=true`
5. Log in as Persona C → complete sign-up
6. Navigate to `/dashboard`

**Pass:**
- [ ] Network shows `track` call with event `Hero CTA Clicked` after step 2 — includes `ctaText`, `segment`, `entryId`
- [ ] Network shows `track` call with event `Banner Dismissed` after step 3 — includes `entryId`, `segment`
- [ ] Network shows `track` call with event `Pricing Page Visited` after step 4 — includes `segment`
- [ ] Network shows `track` call with event `Auth Completed` after step 5 — includes `authType: 'signup'`, `segment: 'premium'`
- [ ] Network shows `track` call with event `Dashboard Activated` after step 6 — fires only once per session
- [ ] Scroll to 60%+ on homepage → `Scroll Depth Reached` with `depth: 60` fires once
- [ ] NT dashboard (after metrics are created): trigger counts increment in real time

---

## NT Metrics Setup

**Critical:** Create metrics in NT AFTER firing each event at least once in dev — event names appear in autocomplete, reducing setup errors. **Metric config cannot be edited after creation** (only name/description).

### Step-by-step

1. Start dev server: `bun run dev:https`
2. Trigger each event manually (see Visual Test above)
3. Go to NT: Organization Settings → Optimization → + New Metric
4. Create each metric below
5. Attach each metric to the relevant experiences (see Metrics per Experience table)

### All 10 metrics

| Metric name | NT type | Event name | Key properties | Attribution window |
|---|---|---|---|---|
| Hero CTA Clicked | Binary | `Hero CTA Clicked` | `ctaText`, `segment`, `entryId` | 30 min |
| Banner CTA Clicked | Binary | `Banner CTA Clicked` | `entryId`, `segment`, `ctaText` | 30 min |
| Banner Dismissed | Count | `Banner Dismissed` | `entryId`, `segment` | 7 days |
| Pricing Page Visited | Binary | `Pricing Page Visited` | `segment` | 1 day |
| Auth Modal Opened | Count | `Auth Modal Opened` | `triggerSource` | 30 min |
| Auth Completed | Binary | `Auth Completed` | `authType`, `segment` | 7 days |
| Dashboard Activated | Binary | `Dashboard Activated` | `segment` | 3 days |
| Scroll Depth Reached | Binary | `Scroll Depth Reached` | `depth` (60), `segment` | 30 min |
| Personalized Experience Viewed | Count | `Personalized Experience Viewed` | `entryId`, `experienceCount`, `experienceIds` | 30 min |
| Newsletter Form Submitted | Binary | `Newsletter Form Submitted` | `email` | 7 days |

### Metrics per experience

| Experience | Attach these metrics | Why |
|---|---|---|
| Hero — 3-Way Messaging A/B/C Test (`6gZyrNnCaLymz0Azi7OvIL`) | Hero CTA Clicked, Pricing Page Visited | Two-metric gate for winner declaration |
| Return Visitor Banner (`3GZXiJhiUA1Hid7ECMTI2n`) | Banner CTA Clicked, Banner Dismissed, Newsletter Form Submitted | Signal-to-noise ratio + nurture conversion |
| High Intent Hero (`3UMQQgfU0ukuB04rBUP5Pp`) | Hero CTA Clicked, Auth Completed, Pricing Page Visited | Macro-conversion proof for CMO |
| Discount Banner (`3Sb7DlOGStyAOCV8FbHVLc`) | Banner CTA Clicked, Banner Dismissed, Auth Completed | Offer effectiveness + funnel completion |
| Any experience | Personalized Experience Viewed, Scroll Depth Reached | Denominator + engagement depth baseline |

---

## Implementation Files

All `track()` calls are live in the codebase. Event name constants: `src/lib/nt-events.ts`.

| Event | File | Location |
|---|---|---|
| `Hero CTA Clicked` | `src/cms-components/hero/hero.tsx` | `<a>` onClick on CTA button |
| `Banner CTA Clicked` | `src/cms-components/banner/banner.tsx` | `<a>` onClick on CTA link |
| `Banner Dismissed` | `src/cms-components/banner/banner.tsx` | Both dismiss Button onClick handlers |
| `Pricing Page Visited` | `src/cms-components/pricing/pricing.tsx` | `useEffect` on mount |
| `Auth Modal Opened` | `src/components/layout/navbar.tsx` | Both `setIsLoginOpen(true)` call sites |
| `Auth Completed` | `src/app/login/persona-buttons.tsx` | `handleSignIn` after `setPersona()` |
| `Dashboard Activated` | `src/app/dashboard/_components/dashboard-top-bar.tsx` | `useEffect` on mount, sessionStorage guard |
| `Scroll Depth Reached` | `src/app/page/[slug]/page-content-live.tsx` | Scroll listener, fires once at 60% |
| `Personalized Experience Viewed` | `src/block-renderer/block-renderer.tsx` | `useEffect` when `blockExperiences.length > 0` |
| `Newsletter Form Submitted` | `src/cms-components/form/newsletter-form.tsx` | `onSubmit` before `onSuccess()` |

---

## Research Foundation

Metrics grounded in the following sources:

**B2B SaaS conversion benchmarks (2024/2025):**
- Industry median homepage-to-lead CR: 1.5–2.5%; top 10%: 8–15%
- Personalized CTAs convert 202% better (HubSpot benchmark)
- AI-driven personalization linked to 18–24% conversion lift in B2B SaaS
- Top 5-7 homepage metrics real teams track: hero CTA CTR, demo/trial form submission, pricing page visit rate, sign-up initiation, scroll depth 60%+, MQL rate, return visit rate

**A/B test winner declaration:**
- Primary signal: CTA click-through rate (fast to significance, directly tests message-to-action pull)
- Supporting signal: scroll depth 60%+ (validates whether people read the variant at all)
- Do NOT use time-on-page as primary — noisy, directionally ambiguous
- Best practice: two-metric gate — hero CTA CTR + pricing page visit

**Micro-conversions (leading indicators before form fill):**
- Pricing page dwell (strongest intent signal in B2B SaaS)
- 60%+ scroll depth on above-fold content
- Modal open events
- Content consumption count (215% higher intent signal after 3+ pieces — Northwestern 2024)

**CMO / VP Marketing justification metrics:**
- Pipeline contribution (marketing-sourced MQLs as % of pipeline)
- Demo request rate by segment
- Returning visitor conversion lift vs baseline
- Frame as: "returning visitors converting at X% vs new visitors at Y% — personalization closed that gap by Z%"

**NT-specific constraints (from Contentful docs):**
- 5 metric types: Binary, Count, Currency, Time, Other
- Attribution window: configurable per metric, affects conversion credit window
- Metric config CANNOT be edited after creation (only name/description)
- Best practice: fire `track()` events before creating NT metric so event name autocompletes
- Metrics created in: Organization Settings → Optimization tab (admin/developer role required)

---

## Entry Reference

| Entry | Content Type | ID | Status |
|---|---|---|---|
| Hero — 3-Way A/B Test | nt_experience | `6gZyrNnCaLymz0Azi7OvIL` | published |
| Return Visitor Banner XP | nt_experience | `3GZXiJhiUA1Hid7ECMTI2n` | published |
| High Intent Hero XP | nt_experience | `3UMQQgfU0ukuB04rBUP5Pp` | published |
| Discount Banner XP | nt_experience | `3Sb7DlOGStyAOCV8FbHVLc` | published |

---

## Reset Checklist

- [ ] Dev server running: `bun run dev:https` (HTTPS required for NT SDK)
- [ ] Each of the 10 events has been triggered at least once (so NT sees the event names)
- [ ] NT metrics created in Organization Settings → Optimization for all 10 events
- [ ] Each metric attached to the correct experience(s) per the Metrics per Experience table above
- [ ] NT dashboard shows non-zero trigger counts for each metric
- [ ] Attribution windows set correctly (see table above — do NOT use 30min for Auth Completed)
