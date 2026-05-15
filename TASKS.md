# Current State & Roadmap

## ✅ Completed — sandbox/v4.2 (current)

| Stream | Issues | Branch/PR | Status |
|--------|--------|-----------|--------|
| featureSection CT | #57 | PR #72 | ✅ merged |
| newsWrapper CT | #5 | PR #73 | ✅ merged |
| AIO/AEO/GEO demo loop | — | PR #74 | ✅ merged |
| Deprecate data-theme | #8 | PR #75 | ✅ merged |
| Localization | #51 | PR #76 | ✅ merged |
| IconFeatureGrid CT | #55 | PR #77 | ✅ merged |
| Form block + NT demo loop | #53 | PR #78 | ✅ merged |
| Newsletter fixes | #88 #89 #90 | PR #91 | ✅ merged → sandbox/v4.1 |
| Card mediaSize + colorVariant | #85 | PR #85 | ✅ merged |
| Font system (fontDisplay/fontBody/fontDisplayWeight) | — | main | ✅ shipped |
| NT merge tag system + identify spread | — | PR #94→squash | ✅ merged |
| AEO demo panel promotion to sandbox | #92 | PR #93 | ✅ merged |
| Button hover states + CSS var theming | — | PR #83 + PR #95 | ✅ merged → sandbox/v4.2 |
| ProductListing block | #86 #87 | PR #87 | ✅ merged 2026-05-15 |
| PAGE_BY_SLUG query oversize fix | — | main | ✅ fixed 2026-05-15 (was 8228→7943 bytes) |
| GraphQL two-pass page fetch | — | PR #104 | ✅ merged 2026-05-14 — shell + parallel BY_ID fetch |
| ProductListing standalone route | — | main | ✅ merged 2026-05-14 — /products/[[...slug]] catch-all |
| PLP: Hero + NT callout cards | — | main | ✅ merged 2026-05-14 — hero renders, Card in blockConfigs for NT |

---

## 🟡 Open — GH Issues

| Issue | Title | Priority | Notes |
|-------|-------|----------|-------|
| #101 | feat(integration-sim): single/multi mode toggle for product + asset picker | 🔴 high | Active — worktree `feat-integration-sim-multi-select`, CODER running |
| #96 | research: use master env alias for all demos instead of per-demo envs | 🔴 high | New (2026-05-08) — could simplify demo setup significantly |
| #79 | feat(dynamic-listing): search, facets & filters | 🔵 backlog | Large scope |
| #49 | fix(demo/tilley): personalization issues | 🔵 blocked | TBD details — nothing actionable yet |
| #2 | feat: style override app | 🔵 backlog | Separate Contentful app, big scope |

---

## 🟡 Open — PRs

| PR | Title | Branch | Notes |
|----|-------|--------|-------|

---

## 🟡 Open — Follow-up To-dos

| To-do | Status | Notes |
|-------|--------|-------|
| Investigate #96 — master env alias pattern | ⬜ new | Could replace per-demo env creation with an alias pointing at master — major workflow simplification |
| Persona C feature flag | ⬜ paused | Does "feature flag for DataViz" mean (a) show/hide slot, or (b) swap banner for DataViz? Clarify before starting. |

---

## Main branch — blocks inventory

| Block | Component | Status |
|-------|-----------|--------|
| Hero | cms-components/hero | ✅ section style editor, custom grid |
| FAQ | cms-components/faq | ✅ AEO demo loop wired |
| TabbedContent | cms-components/tabbed-content | ✅ |
| CardsWrapper | cms-components/cards-wrapper | ✅ renamed from features, animation registry |
| DataViz | cms-components/data-viz | ✅ 5 chart types, interactive legend |
| Blog | cms-components/blog-post | ✅ rich text, sticky TOC, live preview |
| Banner | cms-components/banner | ✅ RT fields, NT personalization, merge tags |
| CtaSection | cms-components/cta-section | ✅ 5 color variants, dotted pattern, page refs |
| TwoAcross | cms-components/two-across | ✅ optional form slot |
| Pricing | cms-components/pricing | ✅ |
| IconGrid | cms-components/icon-grid | ✅ |
| FeatureShowcase | cms-components/feature-showcase | ✅ |
| MediaCardGrid | cms-components/media-card-grid | ✅ |
| FeatureSection | cms-components/feature-section | ✅ 3 display variants |
| NewsWrapper | cms-components/news-wrapper | ✅ dynamic news feed |
| IconFeatureGrid | cms-components/icon-feature-grid | ✅ 3-col icon grid |
| Form | cms-components/form | ✅ newsletter/contact/message, NT personalization |
| Newsletter | cms-components/newsletter | ✅ Gmail preview, lead story, promo slot, RTE embeds, live preview |
| ProductListing | cms-components/product-listing | ✅ |

---

## Active branches

| Branch | Purpose | CC instance | GH |
|--------|---------|-------------|-----|
| `main` | Sandbox, all blocks, source of truth | This CC | — |
| `feat/integration-sim-multi-select` | Integration Sim single/multi mode toggle | Worktree — CODER active | #101 |
| `feat/graphql-two-pass` | Two-pass page fetch — eliminates PAGE_BY_SLUG byte limit | ✅ merged | PR #104 |

---

_Completed work → [archive/tasks-archive.md](archive/tasks-archive.md)_
_Error patterns → [documentation/lessons-learned/index.md](documentation/lessons-learned/index.md)_
