# SDK Selection

## TL;DR for This Project

**Use:** `@ninetailed/experience.js-react`  
**Current state:** `@ninetailed/experience.js-react` v7.23.2 (stable, correct)  
**Why `-react` and not `-next`:** The `-next` package uses `next/router` (Pages Router API) internally for its auto page tracker. In App Router, `next/router` does not exist and throws at runtime. The React SDK + a custom Tracker using `usePathname()` from `next/navigation` is the correct and officially documented pattern.

## SDK Comparison

| Package | Tracks page views | App Router support | Server components | Use when |
|---------|------------------|--------------------|------------------|----|
| `@ninetailed/experience.js-react` | Manual `page()` via custom Tracker | ✅ | ❌ (client component wrapper) | **This project** (App Router) |
| `@ninetailed/experience.js-next` | ✅ Auto on nav (via `next/router`) | ❌ Pages Router only | ❌ | Pages Router Next.js apps |
| `@ninetailed/experience.js` | ❌ Manual | ✅ | ❌ | Headless/vanilla |

> **WARNING:** Previous versions of this document incorrectly recommended `-next` for App Router. That was wrong. The `-next` package's Tracker component calls `router.events.on('routeChangeComplete', ...)` from `next/router`, which is a Pages Router API that does not exist in App Router. Verified June 2026 by reading the SDK source.

## Current Install

```bash
# These are the correct packages for App Router
bun add @ninetailed/experience.js-react @ninetailed/experience.js-utils @ninetailed/experience.js-plugin-preview
```

## App Router Custom Tracker Pattern

Since `-react` doesn't auto-track page views, a custom Tracker is required:

```typescript
'use client';
import { usePathname } from 'next/navigation';
import { useNinetailed } from '@ninetailed/experience.js-react';
import { useEffect, useRef } from 'react';

function Tracker() {
  const pathname = usePathname();
  const ninetailed = useNinetailed();
  const lastFired = useRef('none');
  useEffect(() => {
    if (lastFired.current !== pathname) {
      ninetailed.page();
      lastFired.current = pathname;
    }
  }, [pathname, ninetailed]);
  return null;
}
```

This is mounted inside the NinetailedProvider in `src/personalization/ninetailed-nextjs.tsx`.

## Companion Packages

| Package | Purpose | Required? |
|---------|---------|----------|
| `@ninetailed/experience.js-react` | Core SDK | ✅ |
| `@ninetailed/experience.js-utils` | ExperienceMapper utilities | ✅ |
| `@ninetailed/experience.js-plugin-preview` | Preview bar UI | ✅ For demos |
| `@ninetailed/experience.js-plugin-ssr` | SSR support | Optional (add if needed later) |
