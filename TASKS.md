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

## 🟡 Open — Follow-up To-dos

| To-do | Status | Notes |
|-------|--------|-------|
| Persona C feature flag | ⬜ needs clarification | Does "feature flag for DataViz" mean (a) show/hide DataViz slot, or (b) replace banner with DataViz? Clarify before starting. |
| NT data bucket 409 | ⬜ Follow up with NT support | Casey emailed 2026-04-20. Follow up if no response within a few days. |

---

## 🟡 Backlog — deferred

| Issue | Why deferred |
|-------|-------------|
| #49 Tilley personalization fix | Blocked — "TBD details," nothing to fix yet |
| #53 Visual form builder app | Simplified to Form CT + 3 variants — shipped as PR #78 |
| #48 3rd-party integration simulator | Needs design decisions |
| #2 Style override app | Separate Contentful app, big scope |

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

---

## Active branches

| Branch | Purpose | CC instance |
|--------|---------|-------------|
| `main` | Sandbox, all blocks, source of truth | This CC |

---

_Completed work → [archive/tasks-archive.md](archive/tasks-archive.md)_
_Error patterns → [documentation/lessons-learned/index.md](documentation/lessons-learned/index.md)_
