# Metafi Component Reference

This document provides a detailed reference for all components in the Metafi codebase.

---

## Layout Components

### Navbar (`src/components/layout/navbar.tsx`)

**Type:** Client Component (`'use client'`)

Responsive navigation header with:
- Logo linked to homepage
- Desktop horizontal nav (Features, Integrations, About Us, Pricing, Blog, Contact)
- Login/Get Started buttons
- Theme toggle
- Animated mobile hamburger menu with slide-down panel

**Key Features:**
- Uses `usePathname()` for active link highlighting
- Mobile menu fills remaining viewport height
- Smooth height transition animation (320ms cubic-bezier)
- Body scroll lock when mobile menu is open

---

### Footer (`src/components/layout/footer.tsx`)

Dark-themed footer with:
- Logo
- Three link columns: Product, Company, Legal & Access
- Social icons (LinkedIn, Twitter, Facebook)
- Copyright notice

**Styling:** Uses `.force-light-vars` class to ensure consistent light-theme colors against dark background.

---

### Banner (`src/components/layout/banner.tsx`)

Top promotional banner with dismiss functionality. Links to shadcnblocks.com template page.

---

## Section Components

All section components follow the `metafi-*.tsx` naming convention and are located in `src/components/sections/`.

### Homepage Sections

#### MetafiHero (`metafi-hero.tsx`)

Full-width hero section featuring:
- Gradient background image
- Grid overlay pattern
- Centered headline and subtext
- CTA buttons (Get Started, Contact Us)
- Dashboard preview image

---

#### MetafiLogos (`metafi-logos.tsx`)

Partner/client logo strip. Typically displays trusted brand logos for social proof.

---

#### MetafiFeatures (`metafi-features.tsx`)

Feature highlights section for homepage. Showcases key product capabilities.

---

#### MetafiIntegrations (`metafi-integrations.tsx`)

Integration showcase section. Used on homepage and features page.

---

#### MetafiTestimonials (`metafi-testimonials.tsx`)

Customer testimonial carousel built with Embla Carousel.

---

#### MetafiFaq (`metafi-faq.tsx`)

Accordion-based FAQ section using Radix UI Accordion. Used on homepage and pricing page.

---

#### MetafiFeaturedBlogPosts (`metafi-featured-blog-posts.tsx`)

Displays latest blog posts as cards. Accepts `posts` prop of type `FeaturedCard[]`:

```typescript
type FeaturedCard = {
  slug: string;
  title: string;
  intro: string;
  tagline: string;
  author: string;
  date: string;
  coverImage: string;
};
```

---

#### MetafiCta (`matafi-cta.tsx`)

Call-to-action section with headline and action buttons. Used as page footer across multiple pages.

---

### About Page Sections

#### MetafiAboutHero (`metafi-about-hero.tsx`)

About page hero section with company mission statement.

---

#### MetafiThroughYears (`metafi-trough-years.tsx`)

Company timeline/milestone visualization showing growth over years.

---

#### MetafiTeam (`metafi-team.tsx`)

Team member grid with photos, names, and roles.

---

#### MetafiPartnerLogos (`metafi-partner-logos.tsx`)

Partner logo showcase specific to about page.

---

### Features Page Sections

#### MetafiFeaturesSection (`metafi-features-section.tsx`)

Features page hero with gradient background.

---

#### MetafiFeatureBenefits (`metafi-feature-benefits.tsx`)

Benefit cards with interactive animations. Uses Motion library.

---

#### MetafiTabs (`metafi-tabs.tsx`)

Tabbed interface showcasing different feature categories. Built on Radix Tabs.

---

#### MetafiFeaturePricing (`metafi-feature-pricing.tsx`)

Pricing preview within features page context.

---

### Pricing Page Sections

#### MetafiPricingHero (`metafi-pricing-hero.tsx`)

Pricing tier cards with feature lists and CTAs.

---

#### MetafiFeaturesIncluded (`metafi-features-included.tsx`)

Feature comparison table showing what's included in each tier.

---

### Blog Sections

#### MetafiBlogGrid (`metafi-blog-grid.tsx`)

Grid layout for blog listing page. Displays all posts as cards.

---

#### MetafiBlogFeatured (`metafi-blog-featured.tsx`)

Featured blog post highlight.

---

#### MetafiBlogPost (`metafi-blog-post.tsx`)

Single blog post layout component. Props:

```typescript
{
  tagline: string;
  title: string;
  intro: string;
  image: string;
  author: string;
  published: string;
  children: React.ReactNode; // MDX content
}
```

---

### Other Sections

#### MetafiContactSection (`metafi-contact-section.tsx`)

Contact form section with form fields and validation.

---

#### MetafiCareersHero (`metafi-careers-hero.tsx`)

Careers page hero section.

---

#### MetafiJobOpenings (`metafi-job-openings.tsx`)

Job listings display.

---

#### MetafiPerks (`metafi-perks.tsx`)

Employee perks/benefits display for careers page.

---

#### MetafiMission (`metafi-mission.tsx`)

Company mission statement component.

---

#### MetafiAllIntegrations (`metafi-all-integrations.tsx`)

Comprehensive integrations grid for dedicated integrations page.

---

#### MetafiIntegrationsHero (`metafi-integrations-hero.tsx`)

Integrations page hero section.

---

#### LegalArticle (`legal-article.tsx`)

Layout wrapper for legal content pages (Privacy, Terms, Cookie Policy).

---

## UI Components

Located in `src/components/ui/`, these are shadcn/ui primitives customized for Metafi.

### Core Components

| Component | File | Base |
|-----------|------|------|
| Accordion | `accordion.tsx` | Radix Accordion |
| Button | `button.tsx` | Radix Slot with variants |
| Card | `card.tsx` | Custom div wrapper |
| Carousel | `carousel.tsx` | Embla Carousel |
| Checkbox | `checkbox.tsx` | Radix Checkbox |
| Collapsible | `collapsible.tsx` | Radix Collapsible |
| Input | `input.tsx` | HTML input |
| Label | `label.tsx` | Radix Label |
| Navigation Menu | `navigation-menu.tsx` | Radix Navigation Menu |
| Select | `select.tsx` | Radix Select |
| Switch | `switch.tsx` | Radix Switch |
| Tabs | `tabs.tsx` | Radix Tabs |
| Textarea | `textarea.tsx` | HTML textarea |

### Custom UI Components

#### GridBackground (`grid-background.tsx`)

Grid pattern overlay used in hero sections. Creates a subtle grid effect.

---

#### ThemeToggle (`theme-toggle.tsx` / `ui/theme-toggle.tsx`)

Sun/moon toggle button for switching between light and dark themes.

---

#### ShadowRootHost (`shadow-root-host.tsx`)

Utility for rendering content in a Shadow DOM context.

---

### Animation Components

Interactive animated UI elements using Motion:

| Component | Description |
|-----------|-------------|
| `animation-checkout.tsx` | Checkout flow animation |
| `animation-invoicing.tsx` | Invoice animation |
| `animation-payment-link.tsx` | Payment link animation |
| `animation-recurring-bill.tsx` | Recurring billing animation |

---

## Theme Provider

### ThemeProvider (`theme-provider.tsx`)

Wraps the app with `next-themes` provider:

```tsx
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

Configuration in `layout.tsx`:
- `attribute="class"` - applies theme via CSS class
- `defaultTheme="light"` - light mode default
- `enableSystem` - respects OS preference
- `disableTransitionOnChange` - prevents flash on toggle

---

## Component Composition Patterns

### Page Composition

Pages are composed by stacking section components:

```tsx
// src/app/page.tsx (Homepage)
export default function Home() {
  return (
    <>
      <MetafiHero />
      <MetafiLogos />
      <MetafiFeatures />
      <MetafiIntegrations />
      <MetafiTestimonials />
      <MetafiFaq />
      <MetafiFeaturedBlogPosts posts={cards} />
      <MetafiCta />
    </>
  );
}
```

### Shared Layout

Root layout (`src/app/layout.tsx`) provides:
- Theme provider wrapper
- Banner
- Navbar
- Main content area (`<main>{children}</main>`)
- Footer

---

## Styling Patterns

### Class Merging

All components use the `cn()` utility for conditional classes:

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  variant === 'primary' && 'primary-variant'
)} />
```

### Responsive Design

Components use Tailwind breakpoint prefixes:
- `sm:` - 640px+
- `md:` - 768px+
- `lg:` - 1024px+

Mobile-first approach with progressive enhancement.

---

## Import Aliases

Configured in `tsconfig.json`:

| Alias | Path |
|-------|------|
| `@/components` | `src/components` |
| `@/lib` | `src/lib` |
| `@/` | `src/` |
