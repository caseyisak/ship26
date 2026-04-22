# Contentful App Iframe Height Locked at 150px

**Symptom:** A Contentful field editor app renders content correctly inside the iframe (product card, metadata, etc.) but the iframe stays permanently at 150px — content is clipped and `sdk.window.startAutoResizer()` / `useAutoResizer()` have no effect.

**Root cause:** The Next.js root layout had `<body className="h-screen ...">`. Inside a Contentful field editor iframe, the iframe starts at 150px (Contentful's default minimum). `h-screen = height: 100vh` — so inside a 150px iframe, `100vh = 150px`. The Contentful auto-resizer measures `document.documentElement.scrollHeight` to determine the new height to report. With `body { height: 100vh = 150px }`, `scrollHeight = 150px`. The auto-resizer dutifully sends 150px to Contentful on every mutation, locking the iframe at its initial height forever — regardless of actual content size.

**Diagnosis path:**
1. Confirm iframe exists: `document.querySelectorAll('iframe')` → find `localhost:3002` src
2. Check height: `iframe.style.height` — stuck at `150px` despite content being taller
3. The app IS rendering (product card visible in screenshot after 10s wait) — this is NOT a rendering bug
4. The bug is that `scrollHeight` inside the iframe equals the iframe height (not content height) due to `h-screen` on body

**Fix:** In `contentful-app.css` (loaded only for the `/contentful-app/**` routes), override:
```css
html,
body {
  height: auto !important;
  min-height: 0 !important;
}
```

This removes the `h-screen` constraint for the Contentful app routes only, so `scrollHeight` reflects actual content height. The auto-resizer then correctly reports the content height to Contentful.

**Also:** Call `sdk.window.updateHeight(N)` explicitly on mount before `startAutoResizer()` to set an initial height immediately, rather than waiting for the first mutation:
```tsx
useEffect(() => {
  sdkAny?.window?.updateHeight?.(380);
  sdkAny?.window?.startAutoResizer?.();
  return () => sdkAny?.window?.stopAutoResizer?.();
}, []);
```

**Files changed:** `src/app/contentful-app/contentful-app.css`, `src/app/contentful-app/integration-simulator/page.tsx`

**Applies to:** Any Next.js app hosting a Contentful field/sidebar editor app where the root layout sets a fixed or viewport-relative height on `body` or `html`.
