# Content Model Proposal: Metafi Demo Factory

*Generated: 2026-02-02*
*Based on: Current Metafi codebase components*

## Design Philosophy

### Simplified vs colorful-demo-2.0

| colorful-demo-2.0 | This Proposal |
|-------------------|---------------|
| `Page → Collection → Component` nesting | `Page → Component` direct |
| Layout as separate content type | `variant` field on component |
| 43 content types | ~25 content types |

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

## Content Types (25 total)

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
| `excerpt` | Text | Short description |
| `content` | Rich Text | Article body |
| `featuredImage` | Asset | Hero image |
| `author` | Symbol | Author name |
| `publishedDate` | Date | Publication date |
| `category` | Symbol | Category tag |
| `seo` | Reference | → `seo` |

---

### Section Components (15)

Each section has a `variant` field for visual variations.

#### `hero`
Main hero section.

| Field | Type | Notes |
|-------|------|-------|
| `internalName` | Symbol | CMS organization |
| `variant` | Symbol | `default`, `about`, `careers`, `features`, `integrations`, `pricing` |
| `eyebrow` | Symbol | Small text above headline |
| `headline` | Symbol | Main headline (localized) |
| `subheadline` | Text | Supporting text (localized) |
| `primaryCta` | Reference | → `button` |
| `secondaryCta` | Reference | → `button` |
| `image` | Asset | Hero image |
| `ntExperiences` | References | → `ntExperience` (personalization) |

#### `cta`
Call to action section.

| Field | Type | Notes |
|-------|------|-------|
| `internalName` | Symbol | CMS organization |
| `variant` | Symbol | `default`, `banner`, `card` |
| `headline` | Symbol | CTA headline |
| `subheadline` | Text | Supporting text |
| `primaryCta` | Reference | → `button` |
| `secondaryCta` | Reference | → `button` |
| `ntExperiences` | References | → `ntExperience` |

#### `features`
Feature grid section.

| Field | Type | Notes |
|-------|------|-------|
| `internalName` | Symbol | CMS organization |
| `variant` | Symbol | `2x2`, `1-3`, `cards` |
| `eyebrow` | Symbol | Section label |
| `headline` | Symbol | Section headline |
| `subheadline` | Text | Supporting text |
| `features` | References | → `feature` items |
| `ntExperiences` | References | → `ntExperience` |

#### `feature`
Individual feature card.

| Field | Type | Notes |
|-------|------|-------|
| `title` | Symbol | Feature title |
| `description` | Text | Feature description |
| `icon` | Asset | Icon or illustration |
| `image` | Asset | Feature image |
| `animationType` | Symbol | `checkout`, `invoicing`, `payment-link`, `recurring` or none |

#### `testimonials`
Testimonials section.

| Field | Type | Notes |
|-------|------|-------|
| `internalName` | Symbol | CMS organization |
| `variant` | Symbol | `grid`, `carousel`, `featured` |
| `eyebrow` | Symbol | Section label |
| `headline` | Symbol | Section headline |
| `subheadline` | Text | Supporting text |
| `testimonials` | References | → `testimonial` items |
| `ntExperiences` | References | → `ntExperience` |

#### `testimonial`
Individual testimonial.

| Field | Type | Notes |
|-------|------|-------|
| `quote` | Text | Testimonial quote |
| `name` | Symbol | Person's name |
| `role` | Symbol | Job title |
| `company` | Symbol | Company name |
| `avatar` | Asset | Profile photo |

#### `faq`
FAQ section.

| Field | Type | Notes |
|-------|------|-------|
| `internalName` | Symbol | CMS organization |
| `eyebrow` | Symbol | Section label |
| `headline` | Symbol | Section headline |
| `subheadline` | Text | Supporting text |
| `items` | References | → `faqItem` |
| `ntExperiences` | References | → `ntExperience` |

#### `faqItem`
Individual FAQ item.

| Field | Type | Notes |
|-------|------|-------|
| `question` | Symbol | Question text |
| `answer` | Text | Answer text (supports markdown) |

#### `logos`
Partner/customer logos section.

| Field | Type | Notes |
|-------|------|-------|
| `internalName` | Symbol | CMS organization |
| `variant` | Symbol | `row`, `grid`, `marquee` |
| `headline` | Symbol | Optional headline |
| `logos` | Assets | Logo images |
| `ntExperiences` | References | → `ntExperience` |

#### `pricing`
Pricing section.

| Field | Type | Notes |
|-------|------|-------|
| `internalName` | Symbol | CMS organization |
| `eyebrow` | Symbol | Section label |
| `headline` | Symbol | Section headline |
| `subheadline` | Text | Supporting text |
| `plans` | References | → `pricingPlan` |
| `showToggle` | Boolean | Show monthly/yearly toggle |
| `ntExperiences` | References | → `ntExperience` |

#### `pricingPlan`
Individual pricing plan.

| Field | Type | Notes |
|-------|------|-------|
| `name` | Symbol | Plan name |
| `description` | Text | Plan description |
| `monthlyPrice` | Symbol | e.g., "$22.99" |
| `yearlyPrice` | Symbol | e.g., "$15.99" |
| `priceUnit` | Symbol | e.g., "Per user / billed monthly" |
| `features` | Array (Symbols) | Feature list |
| `ctaLabel` | Symbol | Button text |
| `ctaUrl` | Symbol | Button URL |
| `highlighted` | Boolean | Is this the featured plan? |
| `badge` | Symbol | Optional badge text |

#### `team`
Team section.

| Field | Type | Notes |
|-------|------|-------|
| `internalName` | Symbol | CMS organization |
| `eyebrow` | Symbol | Section label |
| `headline` | Symbol | Section headline |
| `subheadline` | Text | Supporting text |
| `members` | References | → `teamMember` |

#### `teamMember`
Individual team member.

| Field | Type | Notes |
|-------|------|-------|
| `name` | Symbol | Person's name |
| `role` | Symbol | Job title |
| `bio` | Text | Short bio |
| `photo` | Asset | Profile photo |
| `socialLinks` | JSON | Social media links |

#### `contact`
Contact form section.

| Field | Type | Notes |
|-------|------|-------|
| `internalName` | Symbol | CMS organization |
| `headline` | Symbol | Section headline |
| `subheadline` | Text | Supporting text |
| `formFields` | JSON | Form configuration |
| `ntExperiences` | References | → `ntExperience` |

#### `integrations`
Integrations grid section.

| Field | Type | Notes |
|-------|------|-------|
| `internalName` | Symbol | CMS organization |
| `eyebrow` | Symbol | Section label |
| `headline` | Symbol | Section headline |
| `subheadline` | Text | Supporting text |
| `integrations` | References | → `integration` |

#### `integration`
Individual integration card.

| Field | Type | Notes |
|-------|------|-------|
| `name` | Symbol | Integration name |
| `description` | Text | Integration description |
| `logo` | Asset | Integration logo |
| `category` | Symbol | Integration category |
| `url` | Symbol | Link URL |

---

### System Types (6)

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
| `description` | Text | Meta description |
| `ogImage` | Asset | Open Graph image |
| `noIndex` | Boolean | Block indexing |

#### `button`
Reusable button/link.

| Field | Type | Notes |
|-------|------|-------|
| `label` | Symbol | Button text |
| `url` | Symbol | Link URL |
| `variant` | Symbol | `primary`, `secondary`, `outline`, `ghost` |
| `openInNewTab` | Boolean | Target _blank |

---

### Personalization Types (2)

#### `ntAudience`
Ninetailed audience definition.

| Field | Type | Notes |
|-------|------|-------|
| `nt_name` | Symbol | Audience name |
| `nt_description` | Text | Audience description |
| `nt_audience_id` | Symbol | Ninetailed audience ID |
| `nt_rules` | JSON | Audience rules |

#### `ntExperience`
Ninetailed experience/variant.

| Field | Type | Notes |
|-------|------|-------|
| `nt_name` | Symbol | Experience name |
| `nt_description` | Text | Experience description |
| `nt_type` | Symbol | `nt_personalization` or `nt_experiment` |
| `nt_audience` | Reference | → `ntAudience` |
| `nt_variants` | References | → Any section component |
| `nt_config` | JSON | Experience configuration |

---

## Component ↔ Content Type Mapping

| React Component | Content Type | Variant Field Values |
|----------------|--------------|---------------------|
| `MetafiHero` | `hero` | `default` |
| `MetafiAboutHero` | `hero` | `about` |
| `MetafiCareersHero` | `hero` | `careers` |
| `MetafiFeaturesSection` | `hero` | `features` |
| `MetafiIntegrationsHero` | `hero` | `integrations` |
| `MetafiPricingHero` | `hero` | `pricing` |
| `MetafiCta` | `cta` | `default` |
| `MetafiFeatures` | `features` | `2x2` |
| `MetafiFeatureBenefits` | `features` | `benefits` |
| `MetafiFeaturesIncluded` | `features` | `included-list` |
| `MetafiTestimonials` | `testimonials` | `grid` |
| `MetafiFaq` | `faq` | `default` |
| `MetafiLogos` | `logos` | `row` |
| `MetafiPartnerLogos` | `logos` | `grid` |
| `MetafiTeam` | `team` | `default` |
| `MetafiMission` | `cta` | `mission` |
| `MetafiContact` | `contact` | `default` |
| `MetafiIntegrations` | `integrations` | `grid` |
| `MetafiAllIntegrations` | `integrations` | `full` |
| `MetafiJobOpenings` | `careers` | `jobs` |
| `MetafiPerks` | `careers` | `perks` |
| `MetafiTabs` | `tabs` | `default` |

---

## Summary

**Total Content Types: 25**

- 2 Page types
- 15 Section components
- 6 System types
- 2 Personalization types

**Key Simplifications:**
1. No Collection/Layout wrapper - variants handle visual differences
2. Direct Page → Component references
3. Consistent `variant` field pattern
4. Smaller, focused content types
