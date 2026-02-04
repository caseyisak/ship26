Absolutely. Below is a clean, Cursor-ready Markdown file you can drop straight into SpecKit Builder as your project constitution.
It's written to be explicit, opinionated, and implementation-oriented, not fluffy or exploratory.

You can copy-paste this verbatim into a file like:

/docs/constitution.md
or
/specs/project-constitution.md

⸻


# Project Constitution: Contentful Demo Factory (Next.js)

## Project Purpose

This project is a **demo-only website** designed to showcase Contentful (and Ninetailed) in sales demos.

The primary goal is to:
- Rapidly spin up **prospect-specific demo variants**
- Change **brand look & feel** (colors, fonts, logos, tone) per prospect
- Use **Contentful Live Preview** as the primary editing and demo mechanism
- Keep implementation **simple, reliable, and low-maintenance**
- Avoid unnecessary complexity related to SEO, traffic scaling, or production hardening

This is a **demo factory**, not a production marketing site.

---

## Non-Goals

The project explicitly does NOT aim to:
- Support real traffic or SEO optimization
- Be indexed by search engines
- Handle high performance, scale, or traffic spikes
- Perfectly replicate a prospect's real website
- Implement full real-time "Live Mode" updates
- Use GraphQL unless absolutely necessary

---

## Core Architectural Principles

1. **Simplicity beats theoretical correctness**
   - Prefer boring, well-understood patterns.
   - Avoid Next.js features that introduce cognitive overhead without demo value.

2. **Live Preview reliability > all other concerns**
   - The demo must always reflect draft content correctly.
   - No caching surprises during demos.

3. **Variants are data, not code**
   - Prospect-specific differences (colors, fonts, logos, content tone) are configuration-driven.
   - No forked repos per prospect.

4. **Fast iteration over long-term optimization**
   - This site is rebuilt, re-themed, and re-used constantly.
   - Developer speed is more important than architectural purity.

---

## Tech Stack Decisions

### Framework
- **Next.js**
- **Pages Router** (chosen over App Router for lower complexity and fewer semantic pitfalls)

Reasoning:
- Clear mental model
- Mature Contentful preview examples
- Easier SSR + preview branching
- Fewer surprises during demos

---

### CMS
- **Contentful**

Usage:
- Content modeling for demo pages and sections
- Draft content editing via Live Preview
- Optional SiteConfig / Theme entries per prospect

---

### Personalization
- **Ninetailed (9T)**

Usage:
- Client-side personalization only
- Used to swap variants of specific components (hero, CTA, messaging)
- Not responsible for global theming or routing

Personalization surface area must remain small and controlled.

---

### Data Fetching
- **Contentful REST / SDK**
- **GraphQL is explicitly avoided**

Reasoning:
- Faster iteration
- Less query maintenance
- Easier debugging
- Better fit for demo velocity

---

## Rendering Strategy

### High-Level Strategy
- **SSR in Preview Mode only**
- Static/ISR rendering is acceptable for non-preview routes but not required

### Preview Mode
- All demo URLs use **Contentful Preview / Draft Mode**
- Pages are rendered **server-side**
- Draft content is always fetched
- No aggressive caching in preview

This ensures:
- Draft content always appears correctly
- No exposure of preview tokens to the browser
- Stable demos with predictable behavior

### Live Updates
- Real-time Live Preview subscriptions are NOT required
- Page refresh is acceptable during demos
- This reduces complexity and failure points

---

## Routing Strategy

### URL Structure
Routes should encode the "prospect key" directly in the path.

Preferred pattern:

/p/[prospectKey]/[slug]

Examples:

/p/acme/home
/p/globex/pricing

Reasoning:
- Deterministic theming
- Easy Contentful preview URL mapping
- Clean mental model during demos

Avoid:
- Heavy reliance on query parameters for routing
- Dynamic routing logic hidden in middleware

---

## Theming & Variants

### Theme System
Each prospect has a **Theme Configuration**, defined as:
- Colors (primary, secondary, background, etc.)
- Font families
- Logo assets
- Optional tone or industry metadata

Themes may live in:
- JSON files (initial implementation)
- OR Contentful `SiteConfig` entries (future iteration)

Themes are applied via:
- CSS variables
- No hard-coded brand styles inside components

### Rule
**All UI components must consume design tokens only.**
No component may reference hard-coded brand values.

---

## Content Model Strategy

### Core Content Types
- `Page`
  - slug
  - sections (references)
- Section types (Hero, CTA, FeatureGrid, etc.)
- Optional `SiteConfig`
  - prospect key
  - theme tokens
  - logo

### Content Philosophy
- Demo content is intentionally generic but industry-flavored
- Content is optimized for storytelling, not accuracy
- Mapping prospect content is partial and illustrative, not exhaustive

---

## AI-Assisted Demo Generation (Optional / Future)

AI may be used to:
- Extract brand tokens (colors, fonts, tone) from a prospect's public site
- Suggest demo copy based on industry and positioning
- Populate Contentful entries programmatically

AI is NOT expected to:
- Perfectly model a prospect's site architecture
- Automatically map complex content models without review

---

## What We Avoid (On Purpose)

- Next.js App Router
- React Server Components
- Streaming rendering
- Edge runtime complexity
- GraphQL schemas
- Multi-environment caching strategies
- SEO tooling
- Analytics
- Authentication
- A/B testing infra beyond demo personalization

---

## Summary Decision Matrix

| Concern                     | Decision |
|----------------------------|----------|
| Router                     | Pages Router |
| Rendering (Demo)           | SSR (Preview Mode) |
| Live Preview               | Draft Preview Only |
| Personalization            | Client-side (Ninetailed) |
| Variants / Themes          | Data-driven (CSS variables) |
| CMS Fetching               | REST / SDK |
| SEO / Traffic              | Ignored |
| Complexity Budget          | Very low |

---

## Guiding Principle

> This site is a **stage prop**, not a production system.
>  
> If a feature increases cognitive load without improving demo impact, it should not exist.


⸻

If you want, next steps I can help with:
	•	Turning this into SpecKit stories/tasks
	•	Generating a folder structure + conventions doc
	•	Writing a Cursor system prompt tailored to this constitution
	•	Creating a Theme schema (JSON + Contentful fields)
	•	Producing a base Next.js scaffold aligned to this exactly

Just say which artifact you want next.
