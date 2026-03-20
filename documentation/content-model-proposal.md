# Content Model Proposal: Metafi Demo Factory

*Generated: 2026-02-02*
*Based on: Current Metafi codebase components*

## Design Philosophy

### Simplified vs colorful-demo-2.0

| colorful-demo-2.0 | This Proposal |
|-------------------|---------------|
| `Page → Collection → Component` nesting | `Page → Component` direct |
| Layout as separate content type | `variant` field on component |
| 43 content types | ~26 content types |

### Field type conventions (new content types)

- **Rich Text:** User-facing content that may need formatting or embedded entries (headlines, subheadlines, body copy, excerpts, descriptions that render on the front end).
- **Short Text (Symbol):** Internal names, slugs, identifiers, labels, short UI strings (e.g. button label, nav label), categories, tags.
- **Avoid Long Text:** Use Short Text for identifiers and Rich Text for content; do not use Long Text for new types unless there is a documented exception.

---

### Key Simplification: Variants Instead of Nesting

Instead of:
```
Page.sections → Collection(layout: grid) → [CTA, CTA, CTA]
```

We use:
```
Page.sections → [CTA(variant: grid-card), CTA(variant: grid-card), CTA(variant: grid-card)]
```

Or for grouped sections:
```
Page.sections → Features(variant: 2x2-grid, items: [Feature, Feature, Feature, Feature])
```

---

## Content Types (26 total)

### Page Types (2)

#### `page`
Generic page with sections.

| Field | Type | Notes |
|-------|------|-------|
| `internalName` | Symbol | Required, for CMS organization |
| `title` | Symbol | Page title (localized) |
| `slug` | Symbol | URL path, unique |
| `sections` | References (Many) | → Any section component |
| `seo` | Reference | → `seo` |

#### `blogPost`
Blog article (replaces current MDX).

| Field | Type | Notes |
|-------|------|-------|
| `title` | Symbol | Article title |
| `slug` | Symbol | URL path |
| `excerpt` | Rich Text | Short description (supports embedded entries) |
| `content` | Rich Text | Article body |
| `featuredImage` | Asset | Hero image |
| `author` | Reference | → `author` |
| `publishedDate` | Date | Publication date |
| `category` | Symbol | Category tag |
| `seo` | Reference | → `seo` |

---

### Section Components (15)

Many sections have a `variant` field (List/dropdown with layout-based or semantic values) for visual variations. Parent sections that accept only specific child entries use the naming pattern **Wrapper - [Content Type]** (e.g. Wrapper - FAQ, Wrapper - Features).

#### `hero`
Main hero section. Explicit **background** and **media** (or **image**) fields for editors; the Section Style Editor (styling app) edits **`sectionStyle`** (JSON) for layout, overlay, blur, and presentation—not for defining whether assets exist.

| Field | Type | Notes |
|-------|------|-------|
| `internalName` | Symbol | CMS organization |
| `variant` | List (dropdown) | `heroStacked`, `heroSideBySide`, `heroOverlay`, `heroSplit` (layout-based) |
| `eyebrow` | Symbol | Small text above headline |
| `headline` | Rich Text | Main headline (localized) |
| `subheadline` | Rich Text | Supporting text (localized) |
| `primaryCta` | Reference | → `button` |
| `secondaryCta` | Reference | → `button` |
| `background` | Asset | Hero background image |
| `media` (or `image`) | Asset | Hero foreground/media image |
| `sectionStyle` | JSON | Layout and styling (edited by Section Style Editor app) |
| `ntExperiences` | References | → `ntExperience` (personalization) |

#### `cta`
Call to action section.

| Field | Type | Notes |
|-------|------|-------|
| `internalName` | Symbol | CMS organization |
| `variant` | List (dropdown) | `default`, `banner`, `card`, `mission` |
| `headline` | Rich Text | CTA headline |
| `subheadline` | Rich Text | Supporting text |
| `primaryCta` | Reference | → `button` |
| `secondaryCta` | Reference | → `button` |
| `ntExperiences` | References | → `ntExperience` |

#### Wrapper - Features (`features`)
Feature grid section. Accepts only `feature` items.

| Field | Type | Notes |
|-------|------|-------|
| `internalName` | Symbol | CMS organization |
| `variant` | List (dropdown) | `2x2`, `1-3`, `cards`, `benefits`, `included-list` |
| `eyebrow` | Symbol | Section label |
| `headline` | Rich Text | Section headline |
| `subheadline` | Rich Text | Supporting text |
| `features` | References | → `feature` items |
| `ntExperiences` | References | → `ntExperience` |

#### `feature`
Individual feature card. Animation/display options (e.g. animation key) are configured via the **Section Style Editor (styling app)** or a feature-style config field edited by that app—not on the content type.

| Field | Type | Notes |
|-------|------|-------|
| `title` | Symbol | Feature title |
| `description` | Rich Text | Feature description |
| `icon` | Asset | Icon or illustration |
| `image` | Asset | Feature image |

#### Wrapper - Testimonials (`testimonials`)
Testimonials section. Accepts only `testimonial` items.

| Field | Type | Notes |
|-------|------|-------|
| `internalName` | Symbol | CMS organization |
| `variant` | List (dropdown) | `grid`, `carousel`, `featured` |
| `eyebrow` | Symbol | Section label |
| `headline` | Rich Text | Section headline |
| `subheadline` | Rich Text | Supporting text |
| `testimonials` | References | → `testimonial` items |
| `ntExperiences` | References | → `ntExperience` |

#### `testimonial`
Individual testimonial.

| Field | Type | Notes |
|-------|------|-------|
| `quote` | Rich Text | Testimonial quote |
| `name` | Symbol | Person's name |
| `role` | Symbol | Job title |
| `company` | Symbol | Company name |
| `avatar` | Asset | Profile photo |

#### Wrapper - FAQ (`faq`)
FAQ section. Accepts only `faqItem` items.

| Field | Type | Notes |
|-------|------|-------|
| `internalName` | Symbol | CMS organization |
| `eyebrow` | Symbol | Section label |
| `headline` | Rich Text | Section headline |
| `subheadline` | Rich Text | Supporting text |
| `items` | References | → `faqItem` |
| `ntExperiences` | References | → `ntExperience` |

#### `faqItem`
Individual FAQ item.

| Field | Type | Notes |
|-------|------|-------|
| `question` | Symbol | Question text |
| `answer` | Rich Text | Answer text |

#### `logos`
Partner/customer logos section.

| Field | Type | Notes |
|-------|------|-------|
| `internalName` | Symbol | CMS organization |
| `variant` | List (dropdown) | `row`, `grid`, `marquee` |
| `headline` | Symbol | Optional headline |
| `logos` | Assets | Logo images |
| `ntExperiences` | References | → `ntExperience` |

#### Wrapper - Pricing (`pricing`)
Pricing section. Accepts only `pricingPlan` items.

| Field | Type | Notes |
|-------|------|-------|
| `internalName` | Symbol | CMS organization |
| `eyebrow` | Symbol | Section label |
| `headline` | Rich Text | Section headline |
| `subheadline` | Rich Text | Supporting text |
| `plans` | References | → `pricingPlan` |
| `showToggle` | Boolean | Show monthly/yearly toggle |
| `ntExperiences` | References | → `ntExperience` |

#### `pricingPlan`
Individual pricing plan.

| Field | Type | Notes |
|-------|------|-------|
| `name` | Symbol | Plan name |
| `description` | Rich Text | Plan description |
| `monthlyPrice` | Symbol | e.g., "$22.99" |
| `yearlyPrice` | Symbol | e.g., "$15.99" |
| `priceUnit` | Symbol | e.g., "Per user / billed monthly" |
| `features` | Array (Symbols) | Feature list |
| `ctaLabel` | Symbol | Button text |
| `ctaUrl` | Symbol | Button URL |
| `highlighted` | Boolean | Is this the featured plan? |
| `badge` | Symbol | Optional badge text |

#### Wrapper - Team (`team`)
Team section. Accepts only `teamMember` items.

| Field | Type | Notes |
|-------|------|-------|
| `internalName` | Symbol | CMS organization |
| `eyebrow` | Symbol | Section label |
| `headline` | Rich Text | Section headline |
| `subheadline` | Rich Text | Supporting text |
| `members` | References | → `teamMember` |

#### `teamMember`
Individual team member.

| Field | Type | Notes |
|-------|------|-------|
| `name` | Symbol | Person's name |
| `role` | Symbol | Job title |
| `bio` | Rich Text | Short bio |
| `photo` | Asset | Profile photo |
| `socialLinks` | JSON | Social media links |

#### `contact`
Contact form section.

| Field | Type | Notes |
|-------|------|-------|
| `internalName` | Symbol | CMS organization |
| `headline` | Rich Text | Section headline |
| `subheadline` | Rich Text | Supporting text |
| `formFields` | JSON | Form configuration |
| `ntExperiences` | References | → `ntExperience` |

#### Wrapper - Integrations (`integrations`)
Integrations grid section. Accepts only `integration` items.

| Field | Type | Notes |
|-------|------|-------|
| `internalName` | Symbol | CMS organization |
| `eyebrow` | Symbol | Section label |
| `headline` | Rich Text | Section headline |
| `subheadline` | Rich Text | Supporting text |
| `integrations` | References | → `integration` |

#### `integration`
Individual integration card.

| Field | Type | Notes |
|-------|------|-------|
| `name` | Symbol | Integration name |
| `description` | Rich Text | Integration description |
| `logo` | Asset | Integration logo |
| `category` | Symbol | Integration category |
| `url` | Symbol | Link URL |

---

### System Types (7)

#### `author`
Author for blog posts (referenced by `blogPost`).

| Field | Type | Notes |
|-------|------|-------|
| `name` | Symbol | Author name |
| `bio` | Rich Text | Author bio (or Symbol if short only) |
| `picture` | Asset | Profile photo |

#### `siteSettings`
Global site configuration.

| Field | Type | Notes |
|-------|------|-------|
| `siteName` | Symbol | Site name |
| `logo` | Asset | Site logo |
| `logoDark` | Asset | Logo for dark mode |
| `favicon` | Asset | Favicon |
| `colorTokens` | JSON | Theme color tokens |
| `fontConfig` | JSON | Font configuration |
| `navigation` | Reference | → `navigation` |
| `footer` | Reference | → `navigation` |

#### `navigation`
Navigation structure.

| Field | Type | Notes |
|-------|------|-------|
| `internalName` | Symbol | CMS organization |
| `items` | References | → `navigationItem` |

#### `navigationItem`
Individual nav item.

| Field | Type | Notes |
|-------|------|-------|
| `label` | Symbol | Link text |
| `url` | Symbol | Link URL |
| `children` | References | → `navigationItem` (for dropdowns) |

#### `seo`
SEO metadata.

| Field | Type | Notes |
|-------|------|-------|
| `title` | Symbol | Meta title |
| `description` | Symbol | Meta description (short) |
| `ogImage` | Asset | Open Graph image |
| `noIndex` | Boolean | Block indexing |

#### `button`
Reusable button/link.

| Field | Type | Notes |
|-------|------|-------|
| `label` | Symbol | Button text |
| `url` | Symbol | Link URL |
| `variant` | List (dropdown) | `primary`, `secondary`, `outline`, `ghost` |
| `openInNewTab` | Boolean | Target _blank |

---

### Personalization Types (2)

#### `ntAudience`
Ninetailed audience definition.

| Field | Type | Notes |
|-------|------|-------|
| `nt_name` | Symbol | Audience name |
| `nt_description` | Rich Text | Audience description (or Symbol if short) |
| `nt_audience_id` | Symbol | Ninetailed audience ID |
| `nt_rules` | JSON | Audience rules |

#### `ntExperience`
Ninetailed experience/variant.

| Field | Type | Notes |
|-------|------|-------|
| `nt_name` | Symbol | Experience name |
| `nt_description` | Rich Text | Experience description (or Symbol if short) |
| `nt_type` | Symbol | `nt_personalization` or `nt_experiment` |
| `nt_audience` | Reference | → `ntAudience` |
| `nt_variants` | References | → Any section component |
| `nt_config` | JSON | Experience configuration |

---

## Component ↔ Content Type Mapping

Layout-based variant values (e.g. `heroStacked`, `heroSideBySide`) describe **how** the section looks and are reusable across pages. One content type per section; React components branch on `contentType + variant`.

| Content Type | Variant (dropdown) | Layout / use |
|--------------|--------------------|--------------|
| `hero` | `heroStacked` | Stacked layout (headline above media) |
| `hero` | `heroSideBySide` | Headline and media side by side |
| `hero` | `heroOverlay` | Media with overlay text |
| `hero` | `heroSplit` | Split layout (e.g. 50% / 33%) |
| `cta` | `default` | Default CTA layout |
| `cta` | `banner` | Banner-style CTA |
| `cta` | `card` | Card-style CTA |
| `cta` | `mission` | Mission-style CTA |
| `features` | `2x2` | 2×2 grid |
| `features` | `1-3` | 1–3 column layout |
| `features` | `cards` | Card layout |
| `features` | `benefits` | Benefits layout |
| `features` | `included-list` | Included list layout |
| `testimonials` | `grid` | Grid of testimonials |
| `testimonials` | `carousel` | Carousel |
| `testimonials` | `featured` | Featured testimonial |
| `faq` | (single variant) | FAQ section |
| `logos` | `row` | Row of logos |
| `logos` | `grid` | Grid of logos |
| `logos` | `marquee` | Marquee/scrolling |
| `team` | (single variant) | Team section |
| `contact` | (single variant) | Contact form |
| `integrations` | `grid` | Integrations grid |
| `integrations` | `full` | Full integrations list |
| `pricing` | (single variant) | Pricing section |

---

## Summary

**Total Content Types: 26**

- 2 Page types
- 15 Section components
- 7 System types (including `author`)
- 2 Personalization types

**Key Simplifications:**
1. No Collection/Layout wrapper - variants handle visual differences
2. Direct Page → Component references
3. Consistent `variant` field pattern
4. Smaller, focused content types
