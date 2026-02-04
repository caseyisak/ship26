<!--
SYNC IMPACT REPORT
==================
Version change: [TEMPLATE] → 1.0.0
Modified principles: N/A (initial ratification)
Added sections:
  - I. Demo-First Development
  - II. Contentful-Driven Content
  - III. Component Registry Pattern
  - IV. Simplicity Over Sophistication
  - V. AI Comprehension
  - VI. Live Preview Reliability
  - Technology Standards
  - Content Model Standards
  - Development Workflow
  - Governance
Removed sections: None
Templates requiring updates:
  ✅ plan-template.md - Constitution Check section compatible
  ✅ spec-template.md - Requirements align with principles
  ✅ tasks-template.md - Task phases compatible
Follow-up TODOs: None
-->

# Contentful Demo Factory Constitution

## Project Purpose

This project is a **demo-only website** used by Solutions Engineers to showcase Contentful capabilities.

**Primary Goals:**
- Rapidly spin up prospect-specific demo variants
- Showcase Contentful Live Preview, Personalization (Ninetailed), Localization, and Timelines
- Enable AI agents to understand the content model and propose demo flows
- Reuse shadcnblocks components without major rework

**Non-Goals:**
- Production traffic or SEO optimization
- High availability or performance at scale
- Long-term public deployment
- Perfect replication of prospect websites

---

## Core Principles

### I. Demo-First Development

All decisions MUST prioritize demo reliability and developer speed over architectural purity.

- Features that increase cognitive load without improving demo impact MUST NOT be added
- Demo reliability during localhost preview is the primary success metric
- This site is a **stage prop**, not a production system
- If it works in Live Preview, it works

**Rationale**: The only audience is SEs running localhost demos. Nothing else matters.

### II. Contentful-Driven Content

All displayable content MUST be managed in Contentful, not hardcoded in React components.

- Text, images, and configuration MUST come from Contentful entries
- Hardcoded content MUST only exist as fallbacks during development
- The Contentful content model MUST match React components 1:1 via the registry
- GraphQL MUST be used for data fetching (required for inspector mode)

**Rationale**: The demo showcases Contentful's editing capabilities. Hardcoded content cannot be edited.

### III. Component Registry Pattern

All React components MUST be registered in a centralized registry that maps `typename` → component.

- Each content type in Contentful MUST have exactly one registered React component (with variant support)
- Component variants MUST be controlled by a `variant` field in Contentful, not separate content types
- The `BlockRenderer` pattern from colorful-demo-2.0 MUST be adopted
- No nested Collection → Layout wrappers; sections reference components directly

**Rationale**: Enables AI to understand the mapping and propose content changes. Simplifies content model.

### IV. Simplicity Over Sophistication

When choosing between approaches, ALWAYS choose the simpler one.

- **REST over GraphQL**: Except GraphQL is required for Content Source Maps (inspector mode)
- **Direct references over nesting**: `Page → Component`, not `Page → Collection → Component`
- **Variants over new types**: Add a `variant` field rather than creating new content types
- **JSON configs over Contentful entries**: For theme MVP, use JSON files (migrate to Contentful later)
- **Pages Router patterns in App Router**: Avoid RSC complexity where possible

**Rationale**: Low complexity budget. Every abstraction must justify its existence.

### V. AI Comprehension

The codebase MUST be structured so AI agents can understand and modify it.

- Component files MUST have clear, consistent naming: `{name}.tsx`
- Content types MUST match component names: `hero` content type → `Hero` component
- The component registry MUST be the single source of truth for mapping
- GraphQL fragments MUST be co-located or clearly organized
- Documentation MUST explain patterns, not just code

**Rationale**: Meta-goal is AI-assisted demo generation. The system must be machine-readable.

### VI. Live Preview Reliability

Contentful Live Preview MUST work flawlessly in development.

- All components MUST support inspector mode via `getPreviewProps()` pattern
- Draft content MUST always render correctly in preview
- Real-time live updates are optional; page refresh is acceptable
- Preview token MUST NOT be exposed to client-side code

**Rationale**: Live Preview is the primary demo workflow. It must never fail during a demo.

---

## Technology Standards

### Framework
- **Next.js 15** with App Router (hybrid approach - avoid RSC complexity)
- **React 19** with TypeScript strict mode
- **Tailwind CSS 4** for styling
- **shadcn/ui** components as base

### CMS Integration
- **Contentful** as headless CMS
- **GraphQL** for data fetching (required for Content Source Maps)
- **@contentful/live-preview** for preview mode
- **urql** as GraphQL client
- **graphql-codegen** for TypeScript generation

### Personalization (Verified from colorful-demo-2.0)
- **Ninetailed** via `@ninetailed/experience.js-react` (NOT `@ninetailed/experience.js-next`)
- `@ninetailed/experience.js-utils` for ExperienceMapper
- `@ninetailed/experience.js-plugin-preview` for Contentful preview integration
- Custom App Router integration (copy pattern from colorful-demo-2.0)
- Client-side personalization only
- Personalization scope: hero, CTA, feature sections

### Theming
- **CSS variables** for design tokens
- **JSON files** for theme configuration (MVP)
- **next-themes** for light/dark mode
- Future: migrate themes to Contentful `SiteSettings` entries

---

## Content Model Standards

### Content Type Naming
- Use lowercase singular nouns: `hero`, `testimonial`, `faq`
- Match React component names (without prefix): `MetafiHero` → `hero`
- Personalization types use `nt` prefix: `ntAudience`, `ntExperience`

### Field Conventions
- `internalName`: Required on all section types (for CMS organization)
- `variant`: Controls visual style, maps to component variants
- `ntExperiences`: Reference field for personalization on section types
- Use `Symbol` for short text, `Text` for long text, `RichText` for formatted content

### Reference Structure
```
Page
  └── sections (References) → [hero, features, testimonials, cta, faq]
                                  └── ntExperiences → [ntExperience]
                                                         └── nt_variants → [hero variant]
```

### No Nested Collections
Instead of: `Page → Collection(layout: grid) → [Component, Component]`
Use: `Page → Component(variant: grid)` with internal `items` field

---

## Development Workflow

### Data Fetching
- Use `createQuery({ document, selector })` pattern from colorful-demo-2.0
- Organize queries by page type in `src/services/contentful/documents/`
- Use fragment separation: base fragments for deferred entries, personalized fragments for root queries

### Component Development
1. Create component in `src/components/sections/`
2. Create content type in Contentful with matching name
3. Create GraphQL fragment in `src/services/contentful/fragments/`
4. Register in component registry
5. Add inspector mode support via `getPreviewProps()`

### Preview Mode
- Use Next.js Draft Mode for preview
- All preview routes use SSR (not static)
- Preview token passed via cookies, never in URL

### Local Development
- `npm run dev` starts Next.js with Turbopack
- `npm run codegen` regenerates GraphQL types
- Preview URL: `http://localhost:3000?preview=true` (or via Contentful preview button)

---

## What We Explicitly Avoid

- ❌ Pages Router (would require migration, not worth it)
- ❌ React Server Components for data fetching (complexity not justified)
- ❌ Streaming/Suspense patterns (demo doesn't need them)
- ❌ Edge runtime (no benefit for localhost)
- ❌ REST API for Contentful (loses inspector mode)
- ❌ Collection/Layout content types (use variants instead)
- ❌ Multi-environment deployment (localhost only)
- ❌ Automated testing (manual preview testing is sufficient)
- ❌ SEO optimization (not a goal)
- ❌ Analytics (not a goal)

---

## Governance

This constitution governs all development decisions for the Contentful Demo Factory.

**Amendment Procedure:**
1. Proposed changes MUST be documented with rationale
2. Changes MUST be reviewed for impact on existing code
3. Version MUST be incremented according to semver:
   - MAJOR: Principle removals or incompatible redefinitions
   - MINOR: New principles or expanded guidance
   - PATCH: Clarifications and typo fixes

**Compliance:**
- AI agents MUST verify alignment with constitution principles before making changes
- Violations MUST be explicitly justified if necessary
- Periodic reviews SHOULD assess constitution relevance as project evolves

**Guiding Principle:**
> This site is a **stage prop**, not a production system.
> If a feature increases cognitive load without improving demo impact, it should not exist.

---

**Version**: 1.0.0 | **Ratified**: 2026-02-02 | **Last Amended**: 2026-02-02
