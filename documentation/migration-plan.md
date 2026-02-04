# Migration Plan: Contentful plumbing into this repo (metafi-nextjs-shadcnblocks)

## Executive Summary

This document details the migration strategy to **bring Contentful plumbing from `colorful-demo-2.0` into this repo** (metafi-nextjs-shadcnblocks). All work happens **here**; no separate fork folder.

**Goal**: A demo site in this repo using metafi's components and design, backed by Contentful Live Preview, Personalization (Ninetailed), and content management.

**Approach**: Copy infrastructure from colorful-demo-2.0 into this repo; adapt metafi section components to be CMS-driven; use new Contentful space (e.g. uumzxfocy3ef) with Page + Hero (and later) content types.

**Rule**: At each milestone, tests and build must pass before moving on. See [Milestones and test gates](#milestones-and-test-gates) below.

**Continuous improvement**: At the **end of each milestone**, follow the [continuous-improvement](../.cursor/skills/continuous-improvement/SKILL.md) skill (archive completed work to [archive/tasks-archive.md](../archive/tasks-archive.md), update [lessons-learned.md](lessons-learned.md) if a new error pattern appeared). **Before starting** implementation, read [lessons-learned.md](lessons-learned.md) and the tasks archive for relevant patterns and past outcomes.

---

## Milestones and test gates

Migration runs in **this repo** only. Each milestone has a test gate; do not proceed until it passes.

| Milestone | What’s done | Test gate |
|-----------|-------------|-----------|
| **0** | Vitest added; one smoke test; build passes | `bun run test` and `bun run build` pass |
| **1** | Contentful plumbing copied in (block-renderer, GraphQL client, live-preview, draft API, config); no CMS components yet | Build passes; test that BlockRenderer exists and can be imported |
| **2** | Hero fragment + Page query + BlockRenderer config; Hero CMS component (data-driven); page route renders sections | Build passes; test that BlockRenderer renders Hero with mock data |
| **3** | Draft mode + enable-draft route; Live Preview wiring on Hero | Build passes; test draft API returns 400 without params |
| **4** | Full flow: Page from Contentful, Hero from Contentful, Live Preview in browser | Build passes; manual or e2e: open preview URL and see Hero |

**Note**: Work previously done in `colorful-demo-2.0-1` was in the wrong place. The canonical migration is in **metafi-nextjs-shadcnblocks** (this repo).

---

## Part 1: colorful-demo-2.0 Analysis (source to copy from)

### Infrastructure to Preserve (The Plumbing)

These are the battle-tested pieces that make Contentful features work:

#### 1. GraphQL Client & Codegen
- **Location**: `/src/services/contentful/client/`
- **Key Files**:
  - `graphql-client.ts` - URQL client with query cost monitoring, deferred entry handling
  - `add-deferred-entries.ts` - Fetches embedded entries separately to manage query complexity
  - `contentful-client.ts` - REST client for specific operations
- **Config**: `/codegen.ts` - GraphQL codegen configuration
- **Why Keep**: Query cost management, type safety, Content Source Maps support

#### 2. Live Preview Integration
- **Location**: `/src/lib/live-preview.tsx`
- **Key Exports**:
  - `LivePreviewProvider` - Wraps app with ContentfulLivePreviewProvider
  - `useLiveUpdates` - Hook for real-time updates
  - `getPreviewProps` - Inspector mode field highlighting
- **Integration Points**:
  - `/src/app/[locale]/(p13n-routes)/layout.tsx` (line 46)
  - `/src/app/[locale]/(non-p13n-routes)/layout.tsx` (line 42)
- **Why Keep**: Inspector mode (click-to-edit) requires this exact setup

#### 3. Ninetailed Personalization
- **Location**: `/src/personalization/`
- **Key Files**:
  - `provider.tsx` - Server component fetching experiences/audiences
  - `ninetailed-nextjs.tsx` - **Custom App Router provider** (forked from official package)
  - `personalized-component.tsx` - Wraps components with `<Experience>`
  - `utils.ts` - `mapExperiences`, `mapAudiences`, `isPersonalized`
- **GraphQL Fragments**: 
  - `/src/services/contentful/fragments/nt-experience.ts`
  - `/src/services/contentful/fragments/nt-audience.ts`
- **Why Keep**: The custom `ninetailed-nextjs.tsx` is critical - official package doesn't support App Router well

#### 4. Draft Mode
- **Location**: `/src/app/api/`
- **Key Files**:
  - `enable-draft/route.ts` - Validates secret, enables draft mode, redirects
  - `disable-draft/route.ts` - Disables draft mode
- **Pattern**: Uses Next.js `draftMode()` API, checks in layouts
- **Why Keep**: Required for preview in Contentful sidebar

#### 5. BlockRenderer Pattern
- **Location**: `/src/block-renderer/`
- **Key Files**:
  - `block-renderer.tsx` - Main renderer, detects personalization
  - `configs/index.ts` - Component registry
  - `utils.ts` - `getComponentConfig`, `getComponent`
  - `types.ts` - TypeScript interfaces
  - `layout-renderer.tsx` - Collection layout handling
  - `layouts/` - Grid, carousel, vertical-list, etc.
- **Why Keep**: This IS the component mapping system. Adapt it, don't replace it.

#### 6. Internationalization
- **Location**: `/src/i18n/`
- **Dependencies**: `next-intl` (^4.6.0)
- **Why Keep**: Locale routing, content localization support

#### 7. Route Groups
- **Structure**:
  - `/(p13n-routes)/` - Routes WITH personalization (most pages)
  - `/(non-p13n-routes)/` - Routes WITHOUT personalization (Studio pages)
- **Why Keep**: Separates layouts with/without NinetailedProvider

### What to Delete (Old Components)

These will be replaced with metafi equivalents:

#### CMS Components (`/src/cms-components/`) - DELETE ALL
Current components (28):
- `alert/`, `asset-wrapper/`, `benefit/`, `blog-post/`
- `call-to-action/`, `collection/`, `company/`, `customer-review/`
- `data-provider/`, `default-hero/`, `dynamic-listing-page/`, `event/`
- `faq/`, `image-with-focal-point/`, `landing-page/`, `link/`
- `media-mention/`, `newsletter/`, `person/`, `policy/`
- `product/`, `product-category/`, `quote/`, `salesforce-form/`
- `stats/`, `store-location/`, `support-article/`, `support-article-category/`
- `studio-experience/`, `wistia-video/`, `youtube-video/`

#### GraphQL Fragments (`/src/services/contentful/fragments/`) - DELETE MOST
Keep only:
- `entry.ts` - Base fragment (sys, typename)
- `image.ts` - Asset handling
- `nt-experience.ts` - Personalization
- `nt-audience.ts` - Personalization
- `nt-mergetag.ts` - Personalization

Delete all component-specific fragments.

#### Queries (`/src/services/contentful/queries/`) - DELETE ALL
- `landing-page.ts`, `blog-post.ts`, `product.ts`, etc.
- Will be recreated for new content model

#### BlockRenderer Configs (`/src/block-renderer/configs/`) - DELETE ALL
- All component configs will be recreated for metafi components

### Architecture Summary

```
colorful-demo-2.0/
├── src/
│   ├── app/                           # KEEP - Route structure
│   │   ├── [locale]/
│   │   │   ├── (p13n-routes)/         # KEEP - Personalized route group
│   │   │   └── (non-p13n-routes)/     # KEEP - Non-personalized group
│   │   └── api/                       # KEEP - Draft mode routes
│   │
│   ├── block-renderer/                # KEEP - Core pattern
│   │   ├── block-renderer.tsx         # KEEP
│   │   ├── configs/                   # DELETE contents, recreate
│   │   ├── layouts/                   # KEEP - Grid, carousel, etc.
│   │   └── types.ts                   # KEEP
│   │
│   ├── cms-components/                # DELETE ALL - Replace with metafi
│   │
│   ├── components/                    # EVALUATE - Some may be useful
│   │   ├── navbar/                    # DELETE - Use metafi
│   │   ├── footer/                    # DELETE - Use metafi
│   │   └── ...                        # Review individually
│   │
│   ├── design-system/                 # EVALUATE - May merge with shadcn/ui
│   │
│   ├── lib/
│   │   ├── live-preview.tsx           # KEEP - Critical
│   │   └── ...                        # KEEP most utilities
│   │
│   ├── personalization/               # KEEP ALL - Critical
│   │
│   └── services/contentful/           # KEEP structure, update contents
│       ├── client/                    # KEEP ALL
│       ├── fragments/                 # DELETE most, keep base + NT
│       ├── queries/                   # DELETE ALL, recreate
│       └── documents/                 # KEEP structure, update
```

---

## Part 2: metafi-nextjs-shadcnblocks Analysis

### Component Inventory

All components are in `/src/components/`:

#### Layout Components (Port First)
| Component | File | Notes |
|-----------|------|-------|
| Navbar | `layout/navbar.tsx` | Responsive, mobile menu |
| Footer | `layout/footer.tsx` | Dark theme, link columns |
| Banner | `layout/banner.tsx` | Top promotional banner |

#### Section Components (30 total)
| Component | File | Purpose |
|-----------|------|---------|
| `metafi-hero` | `sections/metafi-hero.tsx` | Hero with gradient |
| `metafi-logos` | `sections/metafi-logos.tsx` | Partner logo carousel |
| `metafi-features` | `sections/metafi-features.tsx` | Feature highlights |
| `metafi-integrations` | `sections/metafi-integrations.tsx` | Integration showcase |
| `metafi-testimonials` | `sections/metafi-testimonials.tsx` | Testimonials carousel |
| `metafi-faq` | `sections/metafi-faq.tsx` | Accordion FAQ |
| `metafi-featured-blog-posts` | `sections/metafi-featured-blog-posts.tsx` | Blog cards |
| `matafi-cta` | `sections/matafi-cta.tsx` | Call-to-action |
| `metafi-about-hero` | `sections/metafi-about-hero.tsx` | About page hero |
| `metafi-trough-years` | `sections/metafi-trough-years.tsx` | Timeline |
| `metafi-team` | `sections/metafi-team.tsx` | Team grid |
| `metafi-partner-logos` | `sections/metafi-partner-logos.tsx` | Partner logos |
| `metafi-features-section` | `sections/metafi-features-section.tsx` | Features detail |
| `metafi-feature-benefits` | `sections/metafi-feature-benefits.tsx` | Animated benefits |
| `metafi-tabs` | `sections/metafi-tabs.tsx` | Tabbed content |
| `metafi-feature-pricing` | `sections/metafi-feature-pricing.tsx` | Pricing on features |
| `metafi-pricing-hero` | `sections/metafi-pricing-hero.tsx` | Pricing tiers |
| `metafi-features-included` | `sections/metafi-features-included.tsx` | Feature comparison |
| `metafi-blog-grid` | `sections/metafi-blog-grid.tsx` | Blog listing |
| `metafi-blog-featured` | `sections/metafi-blog-featured.tsx` | Featured posts |
| `metafi-blog-post` | `sections/metafi-blog-post.tsx` | Single post |
| `metafi-contact-section` | `sections/metafi-contact-section.tsx` | Contact form |
| `metafi-careers-hero` | `sections/metafi-careers-hero.tsx` | Careers hero |
| `metafi-job-openings` | `sections/metafi-job-openings.tsx` | Job listings |
| `metafi-perks` | `sections/metafi-perks.tsx` | Benefits/perks |
| `metafi-mission` | `sections/metafi-mission.tsx` | Mission statement |
| `metafi-all-integrations` | `sections/metafi-all-integrations.tsx` | Integration list |
| `metafi-integrations-hero` | `sections/metafi-integrations-hero.tsx` | Integrations hero |
| `legal-article` | `sections/legal-article.tsx` | Legal page wrapper |

#### UI Primitives (18 components in `/src/components/ui/`)
- `button.tsx`, `card.tsx`, `input.tsx`, `select.tsx`
- `tabs.tsx`, `accordion.tsx`, `carousel.tsx`, `checkbox.tsx`
- `collapsible.tsx`, `label.tsx`, `navigation-menu.tsx`, `switch.tsx`
- `textarea.tsx`, `grid-background.tsx`, `theme-toggle.tsx`
- `shadow-root-host.tsx`
- Animation components: `checkout.tsx`, `invoicing.tsx`, `payment-link.tsx`, `recurring-bill.tsx`

### Component Characteristics

**Current State**: All metafi components have **hardcoded content**. Example:

```typescript
// Current metafi-hero.tsx (simplified)
export function MetafiHero() {
  return (
    <section>
      <h1>Build & Scale Payments Infrastructure</h1>
      <p>The complete platform for payment operations...</p>
      <Button>Get Started</Button>
    </section>
  );
}
```

**Required Transformation**: Components need to accept props from Contentful:

```typescript
// After migration (simplified)
interface HeroProps {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaUrl: string;
}

export function MetafiHero({ headline, subheadline, ctaText, ctaUrl }: HeroProps) {
  return (
    <section>
      <h1>{headline}</h1>
      <p>{subheadline}</p>
      <Button href={ctaUrl}>{ctaText}</Button>
    </section>
  );
}
```

### Tech Stack Comparison

| Aspect | colorful-demo-2.0 | metafi | Action |
|--------|-------------------|--------|--------|
| Next.js | 15.5.9 | 15.1.1 | Use demo 2.0 version |
| React | 19.2.3 | 19.0.0 | Use demo 2.0 version |
| Tailwind | 4 | 4.0.2 | Compatible |
| TypeScript | 5.9.3 | 5.7.3 | Use demo 2.0 version |
| Radix UI | Various | Various | Merge as needed |
| Carousel | N/A | embla-carousel | Port to fork |
| Animation | N/A | motion (Framer) | Port to fork |
| GraphQL | urql + codegen | None | Keep from demo 2.0 |
| Contentful | Full integration | None | Keep from demo 2.0 |
| Ninetailed | Full integration | None | Keep from demo 2.0 |

---

## Part 3: Migration Phases (in this repo)

### Milestone 0: Tests and build (current)

**Objective**: Add Vitest, one smoke test, ensure build passes.

**Steps**: See TASKS.md. Run `bun run test` and `bun run build`; both must pass before Milestone 1.

### Milestone 1: Copy plumbing

Copy from colorful-demo-2.0 into this repo: `block-renderer/`, `services/contentful/` (client, fragments entry/image/nt-*), `lib/live-preview.tsx`, `app/api/enable-draft`, `app/api/disable-draft`, config (graphql, env), codegen. No CMS components yet. Tests: build + import BlockRenderer.

### Milestone 2–4: Hero then full flow

### Phase 1 (detail): Hero Component (Proof of Pattern)

**Objective**: Validate the full integration cycle with one component.

**Success Criteria**:
- [ ] Hero renders on page with content from Contentful
- [ ] Live Preview shows content updates in real-time
- [ ] Inspector mode highlights editable fields (click-to-edit)
- [ ] Personalization shows different hero variants
- [ ] Draft mode works from Contentful sidebar

**Steps**:

#### 1.1 Create Content Type in Contentful
```
Content Type: hero
Fields:
  - internalName (Symbol) - Required, for CMS organization
  - headline (Symbol) - Main headline text
  - subheadline (Text) - Supporting text
  - ctaText (Symbol) - Button label
  - ctaUrl (Symbol) - Button destination
  - variant (Symbol) - Visual variant (default, gradient, minimal)
  - ntExperiences (References) - Ninetailed experiences
```

#### 1.2 Create GraphQL Fragment
```typescript
// /src/services/contentful/fragments/hero.ts
import { graphql } from "@/graphql";

graphql(`
  fragment Hero on Hero {
    ...Entry
    headline
    subheadline
    ctaText
    ctaUrl
    variant
  }
`);

// Personalized version for root queries
graphql(`
  fragment PersonalizedHero on Hero {
    ...Hero
    ntExperiencesCollection(limit: 10) {
      items {
        ...NtExperience
      }
    }
  }
`);
```

#### 1.3 Port and Adapt Component
```typescript
// /src/cms-components/hero/hero.tsx
import { HeroFragment } from "@/graphql/graphql";
import { useLiveUpdates, getPreviewProps } from "@/lib/live-preview";
import { BlockProps } from "@/block-renderer/types";

export function Hero({ data, enclosingEntry }: BlockProps<HeroFragment>) {
  const liveData = useLiveUpdates(data);
  
  return (
    <section className="...">
      <h1 {...getPreviewProps({ entryId: data.sys.id, fieldId: "headline" })}>
        {liveData.headline}
      </h1>
      <p {...getPreviewProps({ entryId: data.sys.id, fieldId: "subheadline" })}>
        {liveData.subheadline}
      </p>
      {/* ... rest of component */}
    </section>
  );
}
```

#### 1.4 Create BlockRenderer Config
```typescript
// /src/block-renderer/configs/hero.tsx
import { BlockConfig } from "../types";
import { Hero } from "@/cms-components/hero/hero";

export default {
  typename: "Hero",
  layouts: {
    default: () => Hero,
  },
} satisfies BlockConfig;
```

#### 1.5 Register in Config Index
```typescript
// /src/block-renderer/configs/index.ts
import hero from "./hero";

export const blockConfigs = [
  hero,
  // More components added here
];
```

#### 1.6 Create Page Query
```typescript
// /src/services/contentful/queries/landing-page.ts
import { graphql } from "@/graphql";

export const GetLandingPageBySlug = graphql(`
  query GetLandingPageBySlug($slug: String!, $locale: String!, $preview: Boolean) {
    landingPageCollection(where: { slug: $slug }, locale: $locale, preview: $preview, limit: 1) {
      items {
        ...Entry
        slug
        sectionsCollection(limit: 20) {
          items {
            ...PersonalizedHero
          }
        }
      }
    }
  }
`);
```

#### 1.7 Run Codegen & Test
```bash
bun run codegen
bun run dev
```

**Hardcoded Nav/Footer**: For Phase 1, use static components:
```typescript
// /src/app/[locale]/(p13n-routes)/layout.tsx
import { MetafiNavbar } from "@/components/layout/navbar";
import { MetafiFooter } from "@/components/layout/footer";

// Use these directly without Contentful integration
```

### Phase 2: Core Components

After Phase 1 validates the pattern, migrate remaining priority components:

| Priority | Component | Content Type | Complexity |
|----------|-----------|--------------|------------|
| P1 | Features | `features` | Medium - list of items |
| P1 | CTA | `callToAction` | Low |
| P1 | FAQ | `faq` | Medium - accordion items |
| P2 | Testimonials | `testimonials` | Medium - carousel |
| P2 | Logos | `logoCloud` | Low |
| P2 | Pricing | `pricing` | High - tier structure |
| P3 | Blog | `blogPost` | High - rich text, relations |
| P3 | Contact | `contactForm` | Medium - form handling |

### Phase 3: Navigation & Footer

Once core sections work, migrate layout components:

```
Content Type: siteSettings
Fields:
  - siteName
  - logo
  - navigation (References) → navigationItem[]
  - footerLinks (References) → footerSection[]
  - socialLinks
```

### Phase 4: Polish & Additional Components

- Remaining metafi components
- New components from shadcnblocks
- Theming/variant support
- Final content population

---

## Part 4: Content Model Recommendations

### Naming Convention
- Use lowercase singular nouns: `hero`, `feature`, `testimonial`
- Match component names: `MetafiHero` → `hero`
- Personalization types: `ntAudience`, `ntExperience` (standard)

### Standard Fields (All Section Types)
```
- internalName (Symbol) - Required, unique identifier for CMS
- variant (Symbol) - Visual style variant
- ntExperiences (References) - Personalization
```

### Reference Structure
```
Page
  └── sections (References, many) → [hero, features, cta, faq, ...]
                                       └── ntExperiences → [ntExperience]
                                                              └── nt_variants → [hero variant]
```

### Avoid
- Nested Collection → Layout patterns (use `variant` field instead)
- Separate content types for visual variants
- Deep reference chains

---

## Appendix A: Key File Paths Reference

### Infrastructure (DO NOT DELETE)
```
/src/lib/live-preview.tsx
/src/personalization/*
/src/services/contentful/client/*
/src/block-renderer/block-renderer.tsx
/src/block-renderer/types.ts
/src/block-renderer/layouts/*
/src/app/api/enable-draft/route.ts
/src/app/api/disable-draft/route.ts
/src/app/[locale]/(p13n-routes)/layout.tsx
/src/app/[locale]/(non-p13n-routes)/layout.tsx
/codegen.ts
```

### Delete and Recreate
```
/src/cms-components/* (all)
/src/block-renderer/configs/* (contents only)
/src/services/contentful/fragments/* (except entry, image, nt-*)
/src/services/contentful/queries/* (all)
```

### Port from metafi
```
/src/components/sections/* → /src/cms-components/
/src/components/ui/* → /src/components/ui/ (or /src/design-system/)
/src/components/layout/* → /src/components/ (temporary hardcoded)
```

---

## Appendix B: Environment Variables

Required for new Contentful space:
```env
CONTENTFUL_SPACE_ID=<new-space-id>
CONTENTFUL_ACCESS_TOKEN=<delivery-token>
CONTENTFUL_PREVIEW_ACCESS_TOKEN=<preview-token>
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_PREVIEW_SECRET=<random-string>

# Ninetailed (if using same org)
NINETAILED_CLIENT_ID=<client-id>
NINETAILED_ENVIRONMENT=main

# GraphQL endpoint (constructed from above)
CONTENTFUL_GRAPHQL_ENDPOINT=https://graphql.contentful.com/content/v1/spaces/${SPACE_ID}/environments/${ENV}
```

---

---

**Document Version**: 1.0.0  
**Created**: 2026-02-02  
**Last Updated**: 2026-02-03  
**Status**: Migration target is this repo (metafi-nextjs-shadcnblocks). Milestone 0 in progress (tests + build).  
**Note**: Contentful space uumzxfocy3ef already has Hero and Page content types; they will be used once plumbing is in this repo.
