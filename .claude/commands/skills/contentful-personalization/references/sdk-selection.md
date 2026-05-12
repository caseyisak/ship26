# SDK Selection

## TL;DR for This Project

**Use:** `@ninetailed/experience.js-next`  
**Current state:** `@ninetailed/experience.js-react` (needs upgrade)  
**Why it matters:** The `-next` package auto-tracks `page()` on every Next.js navigation. Without it, NT never gets page view events → audience resolution degrades for page-based targeting.

## SDK Comparison

| Package | Tracks page views | App Router support | Server components | Use when |
|---------|------------------|--------------------|------------------|----|
| `@ninetailed/experience.js-next` | ✅ Auto on nav | ✅ | ✅ | **This project** |
| `@ninetailed/experience.js-react` | ❌ Manual `page()` | ✅ (with workarounds) | ❌ | Plain React apps |
| `@ninetailed/experience.js` | ❌ Manual | ✅ | ❌ | Headless/vanilla |

## Upgrade Path

```bash
# Remove wrong package
bun remove @ninetailed/experience.js-react

# Install correct package
bun add @ninetailed/experience.js-next

# Also ensure these are present
bun add @ninetailed/experience.js-insights  # analytics
bun add @ninetailed/experience.js-preview   # preview bar
```

Then update all imports from:
```typescript
import { NinetailedProvider } from '@ninetailed/experience.js-react';
```
to:
```typescript
import { NinetailedProvider } from '@ninetailed/experience.js-next';
```

## Companion Packages

| Package | Purpose | Required? |
|---------|---------|----------|
| `@ninetailed/experience.js-next` | Core SDK | ✅ |
| `@ninetailed/experience.js-insights` | Analytics tracking | For demo analytics |
| `@ninetailed/experience.js-preview` | Preview bar UI | For demo mode |
| `@ninetailed/experience.js-contentful` | Contentful integration helpers | Optional |
