---
id: loop-d-personalized-banner
customer: bears
build_type: net-new
promotion_status: candidate
personas:
  - VP Digital / Brand
  - Web Designer
  - Social Brand Manager
industries:
  - Sports
  - Media & Entertainment
  - Retail (loyalty/membership programs)
  - Any org with identified users and a loyalty tier
pain_signals:
  - "Our homepage is one-size-fits-all"
  - "We know who our fans are but the site doesn't"
  - "Logged-in users see the same thing as anonymous visitors"
  - "We want to personalize but we don't have dev bandwidth"
  - "We tried personalization before but it required a full engineering project"
  - "We want to reward our loyalty members with a different experience"
  - "Our members log in and there's nothing different for them"
  - "We have CRM data but we can't activate it on the site"
contentful_features:
  - Contentful Personalization (Ninetailed)
  - Live Preview
  - Content References
content_types:
  - id: banner
    status: net-new
    note: Baseline banner (anonymous) + variant banner (STM member) — same component, different content
  - id: nt_experience
    status: sandbox
    note: Wires baseline → variant → audience rule. One entry configures the entire personalization.
  - id: nt_audience
    status: sandbox
    note: Rule: isLoggedIn === true (trait-based, fires on identify() call)
  - id: settings
    status: net-new
    note: loggedInMetadata JSON provides pre-filled login form + NT identify traits (firstName, isLoggedIn, tier)
components:
  - banner (with NT Experience wrapper)
  - login-modal (fires ninetailed.identify on sign-in)
  - navbar LoginButton (opens modal, shows avatar when logged in)
setup_minutes: 5
---

**What this shows:** Homepage loads with the default gameday banner (anonymous state). Click Login → sign in → banner immediately swaps to "Welcome Back, Season Ticket Member" variant. The NT experience entry in Contentful shows exactly how it's wired: baseline, variant, audience. Edit the variant headline → live preview updates instantly.

---

## Tell — Reflect Their Pain

> "Right now your homepage is one-size-fits-all. A season ticket holder logging in Friday sees the same hero as an out-of-market fan who's never been to Soldier Field. Those two fans want — and deserve — very different first impressions."

- For **Pooja**: Brand coherence. The homepage is the organizational hub — it should know who it's talking to.
- For **Austin**: Design once. Personalization just swaps the content; the component stays the same.
- For **Megan**: Unlocks social storytelling — "Already a member? Log in to see your Week 1 perks" — and the site actually backs it up when they do.

**Benchmark (if relevant):** Ruggable reference — personalized hero banners for ad traffic segments → 7× higher CTR, 25% conversion uplift.

---

## Show — Click Path

1. **[Browser]** Open homepage — show default banner: **"Gameday: Bears vs Rams"** / "Get Tickets" CTA / navy background (anonymous state)
   [http://localhost:3000/page/bears-home](http://localhost:3000/page/bears-home)

2. **[Browser]** Click **Login** in the navbar → modal opens → credentials pre-filled → click **Sign In**
   → Button flips to initials avatar + "Log Out"
   → **Banner immediately swaps** to: "Welcome Back, Season Ticket Member" + "Your Week 1 member perks are live." + "View Member Benefits" CTA

3. **[Browser]** Click the **⚙️** personalization icon (bottom-left of page)
   → NT preview overlay opens — shows: audience matched (`Logged In - Season Ticket Holder`), variant active, `isLoggedIn: true` trait

4. **[Browser]** Click **Log Out** → banner returns to default gameday state

5. **[Contentful]** Open **Gameday Banner — Bears vs Rams** → scroll to `nt_experiences` field → click through to linked experience
   [https://app.contentful.com/spaces/uumzxfocy3ef/environments/bears/entries/2CbmCSNNaI4R7Y9UzMX11y](https://app.contentful.com/spaces/uumzxfocy3ef/environments/bears/entries/2CbmCSNNaI4R7Y9UzMX11y)

6. **[Contentful]** Open **Season Ticket Member Personalization** experience
   [https://app.contentful.com/spaces/uumzxfocy3ef/environments/bears/entries/1TrQ6AqHrBEFZYxKavnX6b](https://app.contentful.com/spaces/uumzxfocy3ef/environments/bears/entries/1TrQ6AqHrBEFZYxKavnX6b)
   → Point to: audience (`Logged In - Season Ticket Holder`), variant banner linked, `nt_config` showing baseline → variant swap

7. **[Contentful]** Open variant banner → edit `headline` → save
   [https://app.contentful.com/spaces/uumzxfocy3ef/environments/bears/entries/6GMgz5XJicxCkUoBSwzMd1](https://app.contentful.com/spaces/uumzxfocy3ef/environments/bears/entries/6GMgz5XJicxCkUoBSwzMd1)

8. **[Browser]** Click Login again → banner headline shows the live edit
   > "One audience, one variant, one linked experience — that's the entire setup you just saw."

---

## Tell — Tie to Outcomes

> "This doesn't need a full fan-data integration to start. You can begin with logged-in vs anonymous, then layer in membership tier, home market, or game-week context as you go. Contentful Personalization is built to let your team stand up these experiences without a developer."

- For **Austin**: "You design the banner module once. Personalization swaps the content. No one-off pages."
- For **Megan**: "It unlocks a social loop: 'Already a member? Log in to see your Week 1 perks' — and when they do, the site actually delivers it."
- For **Pooja**: "The same content model feeds every audience. That's brand coherence at scale."

---

## Entry Reference

| Entry | Content Type | ID | Status | Preview URL |
|---|---|---|---|---|
| Gameday Banner — Bears vs Rams (baseline) | banner | `2CbmCSNNaI4R7Y9UzMX11y` | Published | http://localhost:3000/preview/banner/2CbmCSNNaI4R7Y9UzMX11y |
| Banner — Season Ticket Member (variant) | banner | `6GMgz5XJicxCkUoBSwzMd1` | Published | — |
| Season Ticket Member Personalization | nt_experience | `1TrQ6AqHrBEFZYxKavnX6b` | Published | — |
| Logged In - Season Ticket Holder | nt_audience | `4MYsSZa7EkYttD0hIU9gGW` | Published | — |
| Settings (login metadata) | settings | `6OnGCaR9KYecV1ZWbij2Ks` | Published | — |
| Bears Home Page | page | `7vABihhvTvztqy75YMUFwQ` | Published | http://localhost:3000/page/bears-home |

---

## Reset Checklist

- [ ] Dev server running at `http://localhost:3000` from `demo-bears-banner-v2` worktree
- [ ] NT SDK connecting — check for ⚙️ overlay on homepage (bottom-left or bottom-right)
- [ ] Anonymous state: homepage shows "Gameday: Bears vs Rams" banner (navy, "Get Tickets")
- [ ] Login test: click Login → Sign In → banner swaps to STM variant → ⚙️ overlay shows `isLoggedIn: true`
- [ ] Logout test: click Log Out → banner returns to gameday state
- [ ] `.env.local` has `NEXT_PUBLIC_NINETAILED_API_KEY` and `NEXT_PUBLIC_NINETAILED_ENVIRONMENT=main`
