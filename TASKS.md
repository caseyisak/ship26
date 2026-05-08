# Current State & Roadmap

## ✅ Completed — Current Sprint

| Stream | Issues | Branch | Status |
|--------|--------|--------|--------|
| featureSection CT | #57 icon-text/cards/integrations variants | `feat/feature-section` | ✅ PR #72 merged |
| newsWrapper CT | #5 dynamic news feed block | `feat/news-wrapper` | ✅ PR #73 merged |
| AIO/AEO/GEO demo loop | M1–M8 | `feat/aio-aeo-geo-demo` | ✅ PR #74 merged |
| Deprecate data-theme | #8 remove hardcoded CSS theme blocks | `fix/deprecate-data-theme` | ✅ PR #75 merged |
| Localization | #51 enable all CT fields | `feat/localization` | ✅ PR #76 merged |
| IconFeatureGrid CT | #55 icon+title+description 3-col grid | `feat/icon-feature-grid` | ✅ PR #77 merged |
| Form block + NT demo loop | #53 form + personalization | `feat/form-builder-app` | ✅ PR #78 merged |

---

## ✅ Completed — Current Sprint

| Stream | Issues | Branch | Status |
|--------|--------|--------|--------|
| featureSection CT | #57 icon-text/cards/integrations variants | `feat/feature-section` | ✅ PR #72 merged |
| newsWrapper CT | #5 dynamic news feed block | `feat/news-wrapper` | ✅ PR #73 merged |
| AIO/AEO/GEO demo loop | M1–M8 | `feat/aio-aeo-geo-demo` | ✅ PR #74 merged |
| Deprecate data-theme | #8 remove hardcoded CSS theme blocks | `fix/deprecate-data-theme` | ✅ PR #75 merged |
| Localization | #51 enable all CT fields | `feat/localization` | ✅ PR #76 merged |
| IconFeatureGrid CT | #55 icon+title+description 3-col grid | `feat/icon-feature-grid` | ✅ PR #77 merged |
| Form block + NT demo loop | #53 form + personalization | `feat/form-builder-app` | ✅ PR #78 merged |
| Newsletter fixes | #88 #89 #90 RT rendering, promoSlot, CtaSection, preview audit | `fix/newsletter-promo-slot` | ✅ PR #91 merged → sandbox/v4.1 |

---

## ✅ Completed — Current Sprint

| Stream | Issues | Branch | Status |
|--------|--------|--------|--------|
| Card mediaSize + colorVariant + contrast | #85 | `feat/card-media-size` | ✅ PR #85 open — ready to merge |
| Font system (fontDisplay/fontBody/fontDisplayWeight) | — | `main` | ✅ Shipped — `themeToStyle()` + globals.css + siteSettings |

---

## 🟡 Open — Follow-up To-dos

| To-do | Status | Notes |
|-------|--------|-------|
| Merge PR #85 | ⬜ ready | Card mediaSize + per-card colorVariant + contrast fixes — all verified, tsc clean |
| Persona C feature flag | ⬜ needs clarification | Does "feature flag for DataViz" mean (a) show/hide DataViz slot, or (b) replace banner with DataViz? Clarify before starting. |
| NT data bucket 409 | ⬜ Follow up with NT support | Casey emailed 2026-04-20. Follow up if no response within a few days. |
| `fix/button-hover-states` | ⬜ user decision needed | 1 unmerged commit (hover states on button variants) — merge or drop? |
| Tag `sandbox/v4.2` + README changelog | ⬜ | After PR #85 merges (v4.1 = newsletter, v4.2 = card mediaSize + font system) |

---

## 🟡 Backlog — deferred

| Issue | Why deferred |
|-------|-------------|
| #49 Tilley personalization fix | Blocked — "TBD details," nothing to fix yet |
| #2 Style override app | Separate Contentful app, big scope |
| #48 3rd-party integration simulator | ✅ Shipped — multiple PRs to main (b95f1cf, 7271fb2, 8d93db5). Close this issue. |

---

## Main branch — blocks inventory

| Block | Component | Status |
|-------|-----------|--------|
| Hero | cms-components/hero | ✅ section style editor, custom grid |
| FAQ | cms-components/faq | ✅ |
| TabbedContent | cms-components/tabbed-content | ✅ |
| CardsWrapper | cms-components/cards-wrapper | ✅ renamed from features, animation registry |
| DataViz | cms-components/data-viz | ✅ 5 chart types, interactive legend |
| Blog | cms-components/blog-post | ✅ rich text, sticky TOC, live preview |
| Banner | cms-components/banner | ✅ RT fields only, NT personalization |
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

---

## Active branches

| Branch | Purpose | CC instance |
|--------|---------|-------------|
| `main` | Sandbox, all blocks, source of truth | This CC |

---

_Completed work → [archive/tasks-archive.md](archive/tasks-archive.md)_
_Error patterns → [documentation/lessons-learned/index.md](documentation/lessons-learned/index.md)_
