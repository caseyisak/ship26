---
id: loop-a-one-game-all-channels
customer: bears
build_type: net-new
promotion_status: candidate
personas:
  - Social Brand Manager
  - Digital Operations Manager
industries:
  - Sports
  - Media & Entertainment
pain_signals:
  - "Every time something breaks we open six tabs"
  - "We copy-paste the same info into every platform"
  - "Consistency across channels is a constant problem on game day"
  - "We re-export the same image at three different sizes"
  - "We can't tell which version of an asset went to which platform"
  - "Our social team spends 10-15 minutes per announcement just formatting"
contentful_features:
  - Media Library
  - Live Preview
  - Content References
content_types:
  - id: game
    status: net-new (bears env only)
    note: Single source of truth for matchup — week, opponent, kickoff, home/away
  - id: banner
    status: net-new
    note: Gameday hero references game entry for auto-formatted context line
  - id: mediaWrapper
    status: net-new
    note: One asset + channels array + aspect ratios array — the bridge to native publishing
  - id: socialPost
    status: net-new (bears env only)
    note: Channel-specific post linked to game + mediaWrapper
components:
  - social-card-preview (X, IG, FB pixel-accurate cards)
  - banner component
setup_minutes: 5
---

**What this shows:** One `game` entry is the single source of truth. A banner, a media wrapper, and 3 social posts all reference it. Change kickoff time once — everything stays consistent. From the mediaWrapper, copy a CDN URL or download an exact-crop asset with one click.

---

## Tell — Reflect Their Pain

> "Right now, every time something big breaks, your team runs a six-lane relay race: open six tabs, copy-paste, tweak for each platform, attach assets, and hope every version says the same thing."

- For **Megan** (Social Manager): execution load and error risk on game day.
- For **Pooja** (VP Digital): brand coherence and speed under pressure.

---

## Show — Click Path

1. **[Contentful]** Content → filter by `game` → open **vs Rams — Apr 5, 2026**
   [https://app.contentful.com/spaces/uumzxfocy3ef/environments/bears/entries/TYETGb6hX6rdVekjohYqW](https://app.contentful.com/spaces/uumzxfocy3ef/environments/bears/entries/TYETGb6hX6rdVekjohYqW)
   → Point to fields: `week`, `kickoffDateTime`, `homeAway`, `opponentName`
   > "This is the matchup. Week, opponent, home/away, kickoff. Everything else you're about to see points here."

2. **[Contentful]** Content → filter by `socialPost` → show 3 rows, all linked to the same game
   → Open **Wk 1 — X — Gameday Hype**
   [https://app.contentful.com/spaces/uumzxfocy3ef/environments/bears/entries/2jFNTxovaWjtmphbaw4S4E](https://app.contentful.com/spaces/uumzxfocy3ef/environments/bears/entries/2jFNTxovaWjtmphbaw4S4E)
   → Show: `game` reference, `channel: x`, `copy`, `hashtags`

3. **[Preview]** Open social card preview for X
   [http://localhost:3000/preview/social-post/2jFNTxovaWjtmphbaw4S4E](http://localhost:3000/preview/social-post/2jFNTxovaWjtmphbaw4S4E)
   → X card renders with Bears branding, copy, hashtags

4. **[Contentful]** Back → open **Wk 1 — IG — Gameday Hype**
   [https://app.contentful.com/spaces/uumzxfocy3ef/environments/bears/entries/7dHr6nKLd50aEOdPnGiLbO](https://app.contentful.com/spaces/uumzxfocy3ef/environments/bears/entries/7dHr6nKLd50aEOdPnGiLbO)
   → Same game reference, longer caption with emoji

5. **[Preview]** Open social card preview for IG
   [http://localhost:3000/preview/social-post/7dHr6nKLd50aEOdPnGiLbO](http://localhost:3000/preview/social-post/7dHr6nKLd50aEOdPnGiLbO)
   → IG card renders (different layout — two-col desktop, single-col mobile)

6. **[Contentful]** Open **Wk 1 — FB — Gameday Hype**
   [https://app.contentful.com/spaces/uumzxfocy3ef/environments/bears/entries/3Dj2nGX1fyuqcccGUbmYYi](https://app.contentful.com/spaces/uumzxfocy3ef/environments/bears/entries/3Dj2nGX1fyuqcccGUbmYYi)

7. **[Preview]** Open FB card
   [http://localhost:3000/preview/social-post/3Dj2nGX1fyuqcccGUbmYYi](http://localhost:3000/preview/social-post/3Dj2nGX1fyuqcccGUbmYYi)

8. **[Contentful]** Open the `mediaWrapper` linked from any social post → **Wk 1 — Gameday Media**
   [https://app.contentful.com/spaces/uumzxfocy3ef/environments/bears/entries/1JOz65PHC9SUSz9kKyMC5M](https://app.contentful.com/spaces/uumzxfocy3ef/environments/bears/entries/1JOz65PHC9SUSz9kKyMC5M)
   → Show: `asset`, `channels: [x, instagram, facebook]`, `aspectRatios: [1:1, 16:9, 4:5]`
   > "From here, one click copies the CDN URL or downloads the exact crop. No hunting through a shared drive."

9. **[Preview]** Back on the X card — click **Copy Media URL** button (top right) → paste into browser to verify asset URL

10. **[Contentful]** Edit copy on the X entry → save → social card preview auto-refreshes
    > "Today: 10–15 minutes per multi-channel announcement. With this: fill one entry, paste once per channel."

---

## Tell — Tie to Outcomes

> "Today: 10–15 minutes per multi-channel announcement. With this: fill one entry, open your native tabs, paste once per channel. The image is right there. Realistic improvement: 6–10 minutes saved every time something breaks."

- For **Megan**: "Less retyping. One voice is baked in because everything starts from the same entry."
- For **Pooja**: "Brand coherence without extra meetings — the structure enforces it."

---

## Entry Reference

| Entry | Content Type | ID | Status | Preview URL |
|---|---|---|---|---|
| vs Rams — Apr 5, 2026 | game | `TYETGb6hX6rdVekjohYqW` | Published | — |
| Wk 1 — X — Gameday Hype | socialPost | `2jFNTxovaWjtmphbaw4S4E` | Draft | http://localhost:3000/preview/social-post/2jFNTxovaWjtmphbaw4S4E |
| Wk 1 — IG — Gameday Hype | socialPost | `7dHr6nKLd50aEOdPnGiLbO` | Draft | http://localhost:3000/preview/social-post/7dHr6nKLd50aEOdPnGiLbO |
| Wk 1 — FB — Gameday Hype | socialPost | `3Dj2nGX1fyuqcccGUbmYYi` | Draft | http://localhost:3000/preview/social-post/3Dj2nGX1fyuqcccGUbmYYi |
| Wk 1 — Gameday Media | mediaWrapper | `1JOz65PHC9SUSz9kKyMC5M` | Published | — |
| Gameday Banner — Bears vs Rams | banner | `2CbmCSNNaI4R7Y9UzMX11y` | Published | http://localhost:3000/preview/banner/2CbmCSNNaI4R7Y9UzMX11y |

---

## Reset Checklist

- [ ] Dev server running at `http://localhost:3000` from `demo-bears-banner-v2` worktree
- [ ] All 3 social post entries are in draft state (not published) — shows workflow story
- [ ] Social card previews return 200: test each URL above
- [ ] MediaWrapper `1JOz65PHC9SUSz9kKyMC5M` is published
- [ ] Game entry `TYETGb6hX6rdVekjohYqW` is published
