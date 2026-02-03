# Project Context Dump: Contentful Demo Site / Demo Factory

## Source
This document summarizes a multi-turn design conversation between the user and an assistant.
It is intended as **raw context input** for Cursor / SpecKit Builder to derive a formal project constitution.

This is NOT a finalized architecture or decision doc.
It captures intent, constraints, preferences, and reasoning discussed in the conversation.

---

## High-Level Goal

The user is building a **demo-only website** used for sales demos.

The core objective is to:
- Rapidly spin up **prospect-specific demo variants**
- Change **look & feel** (colors, fonts, branding, tone) per prospect
- Make the site feel “like theirs” without recreating their site exactly
- Avoid demoing the same generic site repeatedly
- Use Contentful as the CMS
- Use Contentful **Live Preview** as the primary editing/demo workflow

This site is **not** intended for:
- real traffic
- SEO
- long-term public usage
- production-level optimization

---

## Key Constraints & Priorities

### Highest Priority
- **Reliability during demos**
- **Low complexity**
- **Easy to maintain**
- **Fast iteration**
- **Works cleanly with Contentful Live Preview**

### Explicitly Lower Priority
- SEO
- performance under load
- caching sophistication
- correctness under edge cases
- production hardening

---

## Live Preview Usage Clarification

- The user clarified they will **almost never use “Live Mode”**
- They will **only demo using Contentful Live Preview**
- The preview URL can always use **draft / preview content**
- Real-time live update subscriptions are NOT required
- Refresh-based preview is acceptable

This significantly simplifies architecture.

---

## Rendering Strategy Discussion

### Initial Exploration
- CSR, SSR, and ISR were discussed conceptually
- The user wants something that:
  - feels fast
  - is simple
  - does not introduce unnecessary mental overhead

### Final Direction
- Since SEO and traffic do not matter, rendering can be optimized for simplicity
- Preview reliability is more important than static optimization
- SSR in preview mode is acceptable and preferred for correctness
- Static/ISR rendering for non-preview routes is optional and non-critical

---

## Next.js Router Decision Context

The user asked about **Pages Router vs App Router**.

### Preferences Expressed
- Wants the **easier** option
- Wants fewer “magic” behaviors
- Wants to avoid mental overhead and debugging surprises
- Wants something that “just works” with Contentful preview

### Conclusion Direction
- Pages Router is preferred due to:
  - simpler mental model
  - easier preview branching
  - more mature Contentful examples
  - less complexity around server/client semantics

App Router was not rejected outright, but was considered higher risk for this use case.

---

## Contentful Integration Preferences

### CMS Usage
- Contentful is used primarily as:
  - a demo content store
  - a way to show editing and preview workflows
- Content does not need to be exhaustive or perfectly mapped

### Data Fetching
- The user explicitly dislikes GraphQL for this use case
- GraphQL is considered:
  - annoying to maintain
  - slow to iterate with
  - overkill for a demo site
- REST / SDK-based fetching is preferred

---

## Personalization & Variants

### Core Idea
- One codebase
- Multiple “skins” or variants per prospect
- Variants are driven by **data/config**, not code forks

### Examples of Variant Dimensions
- Color scheme (e.g. red/green vs blue/yellow)
- Fonts
- Logo
- Tone of content
- Industry framing

### Personalization Tooling
- Ninetailed (9T) is expected to be used
- Personalization should be:
  - client-side
  - limited in scope (hero, CTA, messaging blocks)
- Not responsible for global theming or routing

---

## Theming Approach (Implied)

Although not fully formalized, the conversation implies:
- Themes should be represented as **design tokens**
- Tokens likely applied via CSS variables
- Components should consume tokens, not hard-coded styles
- Theme switching should be fast and deterministic

Themes may come from:
- JSON configs
- Contentful entries (e.g. SiteConfig / Theme types)

---

## Routing & URL Structure Discussion

The assistant recommended (and the user did not object to):
- Encoding the “prospect” in the route
- Avoiding heavy reliance on query parameters for core routing

Example pattern discussed:

/p/[prospectKey]/[slug]

This helps:
- deterministically apply themes
- map Contentful preview URLs cleanly
- keep demos understandable when screensharing

---

## AI-Assisted Demo Generation Idea

The user described a future/aspirational workflow:
- Use AI to scrape a prospect’s public site
- Extract:
  - visual style
  - content structure
  - tone
- Rebuild a similar-looking site using the demo template

Important clarifications:
- This is **not** expected to be a perfect replica
- The goal is “feels like theirs,” not 1:1 accuracy
- SEO and correctness are irrelevant
- Speed and demo effectiveness matter more

---

## Complexity Budget

Repeated themes in the conversation:
- “I don’t want this to be complex”
- Avoid over-engineering
- Avoid unnecessary Next.js features
- Avoid caching and rendering tricks unless they clearly help demos

This implies a **very low tolerance for architectural cleverness**.

---

## Starter Template Discussion

The user asked whether an existing starter already satisfies all requirements.

Key takeaways:
- No single starter perfectly matches the demo-factory + theming + preview + personalization use case
- Contentful marketing starters are a good base
- Ninetailed starters (even archived ones) are useful references
- Expectation: start from a base and extend, not build from scratch

---

## Summary of Explicit Preferences

- Pages Router over App Router
- Preview mode over live mode
- SSR acceptable in preview
- REST/SDK over GraphQL
- CSS variables for theming
- Client-side personalization only
- Demo reliability > architectural purity
- Simple mental model > future-proofing

---

## Meta-Intent for SpecKit / Cursor

This context is intended to allow an automated system to:
- Infer a project constitution
- Make opinionated but pragmatic architectural choices
- Avoid introducing features or patterns not justified by demo needs
- Optimize for developer speed, demo stability, and clarity

Any generated constitution should prioritize:
- simplicity
- predictability
- low maintenance
- demo effectiveness
over:
- scalability
- optimization
- theoretical best practices
