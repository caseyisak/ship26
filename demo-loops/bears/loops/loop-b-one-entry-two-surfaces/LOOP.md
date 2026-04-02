---
id: loop-b-one-entry-two-surfaces
customer: bears
build_type: sandbox
promotion_status: candidate
personas:
  - Web Designer
  - Digital Operations Manager
  - VP Digital
industries:
  - Sports
  - Media & Entertainment
  - Any org with web + app surfaces
pain_signals:
  - "We have separate teams managing web and app content"
  - "When the banner changes on the site someone has to manually update the app"
  - "Our designers build one-off templates for every new surface"
  - "We're building more surfaces but our content workflow doesn't scale"
  - "Keeping web and app in sync is a constant coordination problem"
  - "We want to add a new channel but we don't want to rebuild everything"
contentful_features:
  - Live Preview
  - Content References
  - Media Library
content_types:
  - id: banner
    status: net-new
    note: Drives both web homepage and mobile app preview — same entry, different renderers
  - id: game
    status: net-new (bears env only)
    note: Provides context line (Week 1 · Apr 5 · 11:00 AM CT) that auto-formats on both surfaces
  - id: mediaWrapper
    status: net-new
    note: Background image used in banner, delivered via CDN
components:
  - banner (web renderer)
  - device-frame (mobile preview shell — 5 device options)
setup_minutes: 2
---

**What this shows:** The `banner` entry is one structured object. Web renders it as a full-width hero. The mobile app preview renders the same entry as a native promotional card inside a phone mockup. One edit — both surfaces update. Design once, apply many times.

---

## Tell — Reflect Their Pain

> "Right now, your web team owns the homepage and your app team owns the app. When a narrative shift happens mid-week, you update it in one place and both are in sync. That's not a workflow — that's just how the model works."

- For **Austin** (Designer): "Design once, apply many times. You're creating patterns instead of bespoke one-offs."
- For **Pooja** (VP Digital): "Brand coherence without extra meetings — the structure enforces it."

---

## Show — Click Path

1. **[Browser]** Navigate to homepage — scroll to the gameday banner
   [http://localhost:3000/page/bears-home](http://localhost:3000/page/bears-home)
   → Show the banner on web: headline, auto-formatted game context, CTA

2. **[Contentful]** Open **Gameday Banner — Bears vs Rams**
   [https://app.contentful.com/spaces/uumzxfocy3ef/environments/bears/entries/2CbmCSNNaI4R7Y9UzMX11y](https://app.contentful.com/spaces/uumzxfocy3ef/environments/bears/entries/2CbmCSNNaI4R7Y9UzMX11y)
   → Point to: `game` reference, `headline`, `ctaText`, `variant: dark`
   > "This is the same entry driving both surfaces. One object. Two renderers."

3. **[Preview]** Open the mobile app preview
   [http://localhost:3000/preview/banner/2CbmCSNNaI4R7Y9UzMX11y](http://localhost:3000/preview/banner/2CbmCSNNaI4R7Y9UzMX11y)
   → Show the phone frame — Bears app chrome, nav icons, banner as a native card
   → Use device selector to switch between iPhone SE, iPhone 15, Galaxy S24

4. **[Contentful]** Edit the `headline` field → save (don't publish)
   → Mobile preview updates in real-time
   > "This is live preview. Edit the headline — it shows up in the phone frame before you publish."

5. **[Contentful]** Point to `game` reference → "If kickoff moves, we update the game entry once. Web context line and app context line both update automatically — no one has to coordinate."

6. **[Browser]** Back on `/page/bears-home` — scroll to show the banner AND the sections below it
   > "Every section on this page is an independent entry. The banner can be reused on a landing page, an email preview, or another team's microsite — same component, different content."

---

## Tell — Tie to Outcomes

> "When a narrative shift happens mid-week, you update it in one place. Site, app, and any content that references this banner are all in line."

- For **Austin**: "Design once, apply many times. You're creating patterns instead of bespoke one-offs."
- For **Pooja**: "That's governance and brand coherence without extra meetings."

---

## Entry Reference

| Entry | Content Type | ID | Status | Preview URL |
|---|---|---|---|---|
| Gameday Banner — Bears vs Rams | banner | `2CbmCSNNaI4R7Y9UzMX11y` | Published | http://localhost:3000/preview/banner/2CbmCSNNaI4R7Y9UzMX11y |
| vs Rams — Apr 5, 2026 | game | `TYETGb6hX6rdVekjohYqW` | Published | — |
| Bears Home Page | page | `7vABihhvTvztqy75YMUFwQ` | Published | http://localhost:3000/page/bears-home |

---

## Reset Checklist

- [ ] Dev server running at `http://localhost:3000` from `demo-bears-banner-v2` worktree
- [ ] `/page/bears-home` loads 200 — gameday banner visible in first scroll
- [ ] `/preview/banner/2CbmCSNNaI4R7Y9UzMX11y` loads 200 — mobile frame renders
- [ ] Live preview: editing headline in Contentful updates phone frame without page reload
