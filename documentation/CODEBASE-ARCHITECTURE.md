# Metafi Next.js Codebase Architecture

## Overview

Metafi is a premium Next.js 15 marketing website template built with shadcn/ui components and Tailwind CSS 4. The project is a static-export-ready website designed for SaaS/fintech companies, featuring a modern payments-focused theme.

**Live Demo:** https://Metafi-nextjs-template.vercel.app/

---

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router) | 15.1.1 |
| Language | TypeScript | ^5.7.3 |
| Styling | Tailwind CSS | ^4.0.2 |
| UI Components | shadcn/ui (new-york style) | - |
| React | React | ^19.0.0 |
| Content | MDX | via @next/mdx |
| Animations | Motion (Framer Motion) | ^12.0.0-alpha.2 |
| Icons | Lucide React, React Icons | - |
| Forms | React Hook Form + Zod | - |
| Theming | next-themes | ^0.4.4 |

---

## Project Structure

```
metafi-nextjs-shadcnblocks/
├── public/                     # Static assets (images, SVGs, favicons)
│   └── images/
│       ├── blog/              # Blog post cover images
│       ├── homepage/          # Homepage section images
│       └── layout/            # Logo, icons
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout (banner, navbar, footer)
│   │   ├── page.tsx           # Homepage
│   │   ├── globals.css        # Global styles + CSS variables
│   │   ├── about/             # About page
│   │   ├── blog/              # Blog listing + [slug] dynamic route
│   │   ├── careers/           # Careers page
│   │   ├── contact/           # Contact page
│   │   ├── cookie-policy/     # Cookie policy (MDX)
│   │   ├── features/          # Features page
│   │   ├── integrations/      # Integrations page
│   │   ├── login/             # Login page
│   │   ├── pricing/           # Pricing page
│   │   ├── privacy/           # Privacy policy (MDX)
│   │   ├── signup/            # Signup page
│   │   └── terms/             # Terms of service (MDX)
│   ├── blog/                  # MDX blog post files
│   ├── components/
│   │   ├── layout/            # Navbar, Footer, Banner
│   │   ├── sections/          # Page section components (metafi-*)
│   │   ├── ui/                # shadcn/ui primitives
│   │   ├── theme-provider.tsx # Theme context provider
│   │   └── theme-toggle.tsx   # Dark/light mode toggle
│   ├── lib/
│   │   ├── blog.ts            # Blog post utilities
│   │   ├── mdx.tsx            # MDX helpers
│   │   ├── utils.ts           # cn() utility for classnames
│   │   └── use-css-vars.ts    # CSS variable hook
│   └── types/
│       └── post.ts            # Blog post types
├── documentation/             # Project documentation
├── next.config.ts             # Next.js configuration
├── components.json            # shadcn/ui configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
└── tailwind config            # Tailwind via CSS (v4 style)
```

---

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Homepage | Hero, logos, features, integrations, testimonials, FAQ, blog posts, CTA |
| `/about` | About Us | Company story, timeline, team, partner logos |
| `/features` | Features | Feature benefits, tabs, pricing preview, integrations |
| `/pricing` | Pricing | Pricing tiers, features included, FAQ |
| `/integrations` | Integrations | All available integrations |
| `/blog` | Blog Listing | Grid of all blog posts |
| `/blog/[slug]` | Blog Post | Individual MDX blog post |
| `/contact` | Contact | Contact form section |
| `/careers` | Careers | Career page with job openings |
| `/login` | Login | Login form |
| `/signup` | Signup | Registration form |
| `/privacy` | Privacy Policy | MDX legal content |
| `/terms` | Terms of Service | MDX legal content |
| `/cookie-policy` | Cookie Policy | MDX legal content |

---

## Component Architecture

### Layout Components (`src/components/layout/`)

| Component | Description |
|-----------|-------------|
| `Navbar` | Responsive header with logo, navigation links, theme toggle, mobile menu |
| `Footer` | Dark-themed footer with link columns and social icons |
| `Banner` | Top promotional banner linking to shadcnblocks.com |

### Section Components (`src/components/sections/`)

Section components follow the naming convention `metafi-*.tsx` and are designed to be composed together on pages:

| Component | Used On | Description |
|-----------|---------|-------------|
| `metafi-hero.tsx` | Homepage | Main hero section with gradient background |
| `metafi-logos.tsx` | Homepage | Partner/client logo carousel |
| `metafi-features.tsx` | Homepage | Feature highlights |
| `metafi-integrations.tsx` | Multiple | Integration showcase |
| `metafi-testimonials.tsx` | Homepage | Customer testimonials carousel |
| `metafi-faq.tsx` | Multiple | Accordion FAQ section |
| `metafi-featured-blog-posts.tsx` | Homepage | Latest blog post cards |
| `matafi-cta.tsx` | Multiple | Call-to-action section |
| `metafi-about-hero.tsx` | About | About page hero |
| `metafi-team.tsx` | About | Team member grid |
| `metafi-trough-years.tsx` | About | Company timeline |
| `metafi-pricing-hero.tsx` | Pricing | Pricing cards |
| `metafi-features-included.tsx` | Pricing | Feature comparison table |
| `metafi-blog-grid.tsx` | Blog | Blog post grid |
| `metafi-blog-post.tsx` | Blog [slug] | Blog post layout |
| `metafi-contact-section.tsx` | Contact | Contact form |
| `metafi-tabs.tsx` | Features | Tabbed feature showcase |
| `metafi-feature-benefits.tsx` | Features | Benefit cards with animations |

### UI Components (`src/components/ui/`)

Built on shadcn/ui (new-york style) with Radix UI primitives:

| Component | Base |
|-----------|------|
| `accordion.tsx` | @radix-ui/react-accordion |
| `button.tsx` | @radix-ui/react-slot |
| `card.tsx` | Custom |
| `carousel.tsx` | embla-carousel-react |
| `checkbox.tsx` | @radix-ui/react-checkbox |
| `collapsible.tsx` | @radix-ui/react-collapsible |
| `input.tsx` | Custom |
| `label.tsx` | @radix-ui/react-label |
| `navigation-menu.tsx` | @radix-ui/react-navigation-menu |
| `select.tsx` | @radix-ui/react-select |
| `switch.tsx` | @radix-ui/react-switch |
| `tabs.tsx` | @radix-ui/react-tabs |
| `textarea.tsx` | Custom |
| `grid-background.tsx` | Custom grid overlay |
| `animation-*.tsx` | Motion-based UI animations |

---

## Styling System

### Tailwind CSS 4

The project uses **Tailwind CSS v4** with the new CSS-first configuration approach:

- Configuration is in `src/app/globals.css` using `@theme inline`
- Uses `@plugin` for loading plugins
- Custom `@utility` and `@layer` definitions

### CSS Variables (Design Tokens)

Light and dark theme tokens defined in `:root` and `.dark`:

```css
:root {
  --background: oklch(1 0 89.88);
  --foreground: oklch(0.172 0.006 286.3);
  --primary: oklch(0.172 0.006 286.3);
  --secondary: oklch(0.9461 0 89.88);
  --muted: oklch(0.9702 0 89.88);
  --muted-foreground: oklch(0.61 0.03 270);
  --accent: oklch(0.982 0.004 230);
  --border: oklch(0.924 0.003 255.9);
  --destructive: oklch(0.6368 0.2078 25.33);
  --success: oklch(0.79 0.12 179.5);
  --tagline: oklch(0.57 0.223 275.64);
  /* ... charts, shadows, etc. */
}

.dark {
  --background: oklch(0.23 0.02 265);
  /* ... dark theme overrides */
}
```

### Key Utilities

| Utility | Description |
|---------|-------------|
| `cn()` | Tailwind class merger (`clsx` + `tailwind-merge`) |
| `.container` | Centered container with max-width 1200px |
| `.force-light-vars` | Force light theme variables |
| `.shadow-soft` / `.shadow-light` | Custom shadows |
| `.bg-features-hero` | Gradient background for feature pages |

---

## Blog/Content System

### Blog Posts

Blog posts are **MDX files** stored in `src/blog/`:

```yaml
---
tagline: Compliance
title: 'A Comprehensive Guide on Importing Customers'
description: 'Description text here...'
author: 'Savannah Nguyen'
date: '2023-10-24'
featured: true
latest: true
tags: ['Compliance']
coverImage: '/images/blog/1.webp'
---

<small>5–7 minute read</small>

Content here...
```

### Blog Utilities (`src/lib/blog.ts`)

| Function | Description |
|----------|-------------|
| `getBlogSlugs()` | Returns all `.mdx` filenames |
| `getBlogBySlug(slug)` | Parses MDX frontmatter and content |
| `getAllBlogs(limit?)` | Returns all posts sorted by date |

### Static Generation

Blog pages use `generateStaticParams()` for static generation:

```typescript
export async function generateStaticParams() {
  const slugs = getBlogSlugs();
  return slugs.map((slug) => ({ slug: slug.replace(/\.mdx$/, '') }));
}
```

### Legal Pages

Legal content (Privacy, Terms, Cookies) uses inline MDX imports within page components.

---

## Build Configuration

### next.config.ts

```typescript
const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  output: 'export',  // Static export mode
  images: {
    unoptimized: true,  // Required for static export
  },
};
```

**Key Points:**
- **Static Export:** `output: 'export'` generates static HTML
- **MDX Support:** Configured via `@next/mdx` wrapper
- **Images:** Unoptimized for static hosting compatibility

### shadcn/ui Configuration

```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  },
  "iconLibrary": "lucide"
}
```

---

## Key Dependencies

### Runtime

| Package | Purpose |
|---------|---------|
| `next` | React framework |
| `react` / `react-dom` | React 19 |
| `next-themes` | Theme provider for dark/light mode |
| `@radix-ui/*` | Accessible UI primitives |
| `embla-carousel-react` | Carousel component |
| `lucide-react` | Icon library |
| `motion` | Animation library |
| `react-hook-form` + `zod` | Form validation |
| `gray-matter` | MDX frontmatter parsing |
| `next-mdx-remote` | Server-side MDX compilation |
| `dotted-map` | Map visualization |

### Development

| Package | Purpose |
|---------|---------|
| `tailwindcss` | CSS framework |
| `@tailwindcss/typography` | Prose styling |
| `eslint` + `prettier` | Linting and formatting |
| `typescript` | Type checking |

---

## Scripts

```bash
bun run dev      # Development server with Turbopack
bun run build    # Production build (static export)
bun run start    # Serve production build
bun run lint     # ESLint check
bun run lint:fix # ESLint auto-fix
```

---

## Theming

The app supports **light** and **dark** themes via `next-themes`:

```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="light"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

Toggle component available at `src/components/ui/theme-toggle.tsx`.

---

## Deployment

Optimized for **Vercel** deployment:

1. Static export compatible
2. Edge-ready
3. Automatic preview deployments

The `output: 'export'` configuration allows hosting on any static host (Vercel, Netlify, S3, etc.).

---

## File Naming Conventions

| Pattern | Usage |
|---------|-------|
| `metafi-*.tsx` | Section components |
| `[slug]/page.tsx` | Dynamic routes |
| `*.mdx` | Content files |
| `page.tsx` | Route pages |
| `layout.tsx` | Layout wrappers |

---

## Further Reading

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [shadcnblocks Template Docs](https://docs.shadcnblocks.com/templates/getting-started)
