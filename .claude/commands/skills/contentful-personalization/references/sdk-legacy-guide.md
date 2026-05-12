# Legacy SDK Guide

## What to Avoid

**Contentful Experiences SDK / Studio SDK** — a DEPRECATED product. Do not use:
- `@contentful/experience-builder`
- `@contentful/experiences-sdk-react`
- Any reference to "Contentful Studio" or "Visual Editor" experiences

This SDK has nothing to do with Ninetailed personalization. Contentful confusingly named both products "Experiences" at different times. The deprecated product was a visual builder for creating page layouts in Contentful UI. It has been sunset.

## Ninetailed Branding History

Contentful acquired Ninetailed in 2023. The product was sold as:
- "Ninetailed" (pre-acquisition)
- "Contentful Personalization" (post-acquisition)
- "Contentful Experiences" (confusing rebrand — same word as deprecated Studio product)

**All of these mean the same thing:** The Ninetailed SDK (`@ninetailed/experience.js-*`).

## Migration from Old NT Versions

If you find v5 or v6 NT packages:

```bash
# Remove old
bun remove @ninetailed/experience.js

# Install v7 next package
bun add @ninetailed/experience.js-next

# Update imports — API changed in v7
# Old: import { NinetailedProvider } from '@ninetailed/experience.js'
# New: import { NinetailedProvider } from '@ninetailed/experience.js-next'
```

Breaking changes v6→v7:
- Package split: `-next`, `-react`, `-insights`, `-preview` are now separate
- `ExperienceMapper` removed — use `Experience` component directly
- Profile API updated — `useProfile()` hook signature changed

## Checking What's Installed

```bash
grep -E "ninetailed|experience.js" package.json
```

Any of these are wrong for this project:
- `@ninetailed/experience.js` (base package, use `-next` instead)
- `@ninetailed/experience.js-react` (use `-next` instead)
- `@contentful/experience-builder` (deprecated Studio SDK, unrelated)
- `@contentful/experiences-sdk-react` (deprecated)
