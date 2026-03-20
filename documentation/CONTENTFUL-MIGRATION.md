# Contentful Migration Plan

Tracking the migration of all static/hardcoded content to Contentful. Goal: zero hardcoded content in the codebase — everything editable in Contentful.

---

## Current State

| Area | Status |
|------|--------|
| `/page/[slug]` dynamic pages | ✅ Contentful |
| Blog (listing + detail) | ✅ Contentful |
| Hero, FAQ, Features, TabbedContent, DataViz blocks | ✅ Contentful |
| Blog posts (7 legacy MDX files) | ⚠️ MDX → needs migration |
| Homepage featured posts | ⚠️ Reads from local MDX (conflict) |
| All other pages + sections | ❌ Hardcoded |

---

## Migration Backlog

### Priority 1 — Content that changes frequently

#### Blog: Migrate MDX → Contentful
- **What:** 7 MDX files in `src/blog/` + homepage `getAllBlogs()` call
- **Action:**
  - Create matching BlogPost entries in Contentful for each MDX post (content + heroImage)
  - Update `src/app/page.tsx` root: replace `getAllBlogs()` with Contentful `getBlogPosts({ featured: true })`
  - Delete `src/blog/*.mdx`, `src/lib/blog.ts`
- **Content type:** `blogPost` (already exists)

#### FAQ
- **What:** `MetafiFaq` component has hardcoded `FAQS` array used on Homepage + Pricing pages
- **Action:** Replace with `Faq` block driven by `Page` sections in Contentful
- **Content type:** `faq` + `faqItem` (already exists)

#### Features / Feature Grid
- **What:** `MetafiFeatures` has hardcoded `FEATURES` array
- **Action:** Replace with `Features` block in Contentful
- **Content type:** `features` + `feature` (already exists)

---

### Priority 2 — Marketing content

#### Pricing Plans
- **What:** `metafi-pricing-hero.tsx` has hardcoded `PLANS` array (3 tiers, feature lists, prices)
- **Action:** Create `PricingPlan` content type; wire `MetafiPricingHero` to Contentful
- **New content type:** `pricingPlan` — fields: `name`, `price`, `billingPeriod`, `description`, `featuresCollection` (Symbol[]), `ctaLabel`, `ctaUrl`, `highlighted` (Boolean)

#### Testimonials
- **What:** `MetafiTestimonials` has hardcoded testimonial objects
- **Action:** Create `Testimonial` content type
- **New content type:** `testimonial` — fields: `quote`, `authorName`, `authorTitle`, `authorAvatar` (media), `companyLogo` (media)

#### Partner / Integration Logos
- **What:** `MetafiLogos` + `MetafiPartnerLogos` + `MetafiAllIntegrations` all have hardcoded arrays
- **Action:** Create `Integration` content type; use for both logo strips and full integrations page
- **New content type:** `integration` — fields: `name`, `logo` (media), `url`, `category`, `description`

#### Team
- **What:** `MetafiTeam` has hardcoded team member objects
- **Action:** Create `TeamMember` content type
- **New content type:** `teamMember` — fields: `name`, `title`, `bio`, `photo` (media), `linkedinUrl`

#### Job Openings
- **What:** `MetafiJobOpenings` has hardcoded `DEFAULT_JOBS` array
- **Action:** Create `JobOpening` content type
- **New content type:** `jobOpening` — fields: `title`, `department`, `location`, `type` (full-time/part-time/contract), `description` (rich text), `applyUrl`

---

### Priority 3 — Page-level migration (convert static pages to `/page/[slug]`)

Once Priority 1+2 content types exist, these pages can become Contentful-managed `Page` entries with sections:

| Static page | Sections to use |
|-------------|----------------|
| `/` (homepage) | Hero, Features, Testimonials (new), Integrations (new), FAQ, FeaturedBlogPosts (new) |
| `/about` | Hero, Team (new), Timeline (new), PartnerLogos (new) |
| `/features` | Hero, TabbedContent, Features, Integrations (new) |
| `/pricing` | Hero, PricingPlans (new), Features, FAQ |
| `/integrations` | Hero, Integrations (new) |
| `/careers` | Hero, Mission (text block), Perks (new), JobOpenings (new) |
| `/contact` | Hero, ContactForm |

Each page becomes a Contentful `Page` entry with `slug` and `sections[]` — no more static Next.js route files needed.

---

### Priority 4 — Legal pages (low priority)

Currently MDX files (`privacy.mdx`, `terms.mdx`, `cookie-policy.mdx`).

Options:
- **Keep as MDX** — legal copy rarely changes, MDX is fine
- **Migrate to Contentful** — create `LegalPage` content type with `title` + `body` (rich text)

Recommendation: migrate to Contentful for consistency; use rich text body so legal team can edit without a deploy.

---

## What stays hardcoded

- `/login`, `/signup` — auth forms, no CMS needed
- `/app` — mock mobile app viewer for demos
- `/contentful-app` — Contentful section style editor (meta, not content)

---

## Implementation order

```
1. Blog MDX → Contentful          (unblocks homepage fix)
2. FAQ, Features                   (reuse existing content types)
3. Pricing, Testimonials           (new content types)
4. Integrations, Team, Jobs        (new content types)
5. Convert static pages → /page/[slug] entries
6. Legal pages                     (optional)
```

Each migration follows the standard workflow:
- Run `contentful-block-discovery` skill first
- Use `add-contentful-block` orchestrator for new blocks
- Create feature branch + worktree: `bash scripts/worktree-add.sh feat/migrate-[name]`
