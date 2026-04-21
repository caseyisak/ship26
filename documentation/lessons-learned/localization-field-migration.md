# LL: Localization Field Migration — Enabling localized: true Across All Sandbox CTs

**Date:** 2026-04-21
**Issue:** #51

## What Was Done

Enabled `localized: true` on all text and media fields across 26 sandbox content types in Contentful master (`uumzxfocy3ef`). This unlocks multi-market demo scenarios where content can be served in different locales.

## Content Types Updated

| CT | Fields Localized |
|---|---|
| `hero` | headlineRt, subheadlineRt, ctaText, ctaUrl, background, media |
| `banner` | headlineRt, subheadlineRt, ctaText, ctaUrl, media |
| `twoAcross` | eyebrowRt, headingRt, body, ctaLabel, ctaUrl, media, mediaAltText |
| `faq` | titleRt, descriptionRt |
| `faqitem` | questionRt, answerRt |
| `tabbedcontent` | taglineRt, titleRt, descriptionRt |
| `tabbedcontentitem` | label, labelRt, body, bodyRt, image, imageAlt, href, buttonLabel, buttonLabelRt |
| `dataViz` | titleRt, descriptionRt, csvData |
| `blogPost` | title, titleRt, excerpt, excerptRt, heroImage, body |
| `iconGrid` | label, title, description |
| `iconGridItem` | icon, title, description |
| `featureShowcase` | label, title, description |
| `featureShowcaseItem` | title, description, media |
| `mediaCardGrid` | label, title, description |
| `mediaCard` | title, description, media |
| `featureSection` | label, title, description |
| `featureSectionItem` | icon, title, description |
| `newsWrapper` | label, title, description |
| `ctaSection` | headlineRt, subheadlineRt, ctaPrimaryLabelRt, ctaPrimaryUrl, ctaSecondaryLabelRt, ctaSecondaryUrl, backgroundImage |
| `pricing` | label, title, description |
| `pricingPlan` | name, blurb, monthlyPrice, annualPrice, perUnitMonthly, perUnitAnnual, badge, ctaLabel, ctaUrl |
| `pricingPlanFeature` | label |
| `navLink` | label, url |
| `cardsWrapper` | labelRt, titleRt, descriptionRt |
| `card` | titleRt, descriptionRt, media |

## Fields NOT Localized (by design)

- `internalName` on all CTs — UI-only identifier, never rendered on frontend
- `slug` on `blogPost` and `page` — would break routing
- Boolean fields (`showToggle`, `showLegend`, `showDottedPattern`)
- Integer/Number fields (`columns`, `maxItems`, etc.)
- Symbol fields used as enum keys (`variant`, `colorVariant`, `chartType`, `style`, etc.)
- All Link fields to other entries (references), NT experiences, and navigation
- `page` CT `slug` — explicitly excluded to preserve routing

## Key Notes

1. **One-step update was safe** — all these CTs had no existing locale-specific data that could conflict. The simpler single-step approach (update + publish) worked cleanly.

2. **`pricingFeature` CT does not exist** — the issue listed it, but the actual CT is `pricingPlanFeature`. Updated that instead.

3. **No code changes needed** — GraphQL queries already pass `locale: $locale` where applicable. The CT-level localization flag is the only change required for locale variants to be stored per-field.

4. **Demo env workflow** — When creating a demo branch with a new Contentful env, clone entries and set locale-specific values (e.g., `fr-FR`) to demonstrate multi-market content without duplicating entries.

## Pattern for Future CTs

When creating any new content type, set `localized: true` on all text (Symbol, RichText, Text) and media (Link→Asset) fields at creation time. Never add new content types with `localized: false` on visible fields.
