# LL-045: PreviewLinkInterceptor must use capture phase + router.push

## Symptom

Internal links lose `?preview=true` when navigating in Contentful live preview iframe. Draft mode stops working after clicking any link.

## Root cause (two parts)

1. **Next.js `<Link>` fires its click handler before a normal listener** — by the time a bubbling-phase handler runs, Next.js has already started navigation without the preview param.
2. **`window.location.href` destroys NT profile state** — a full page load wipes the in-memory Ninetailed profile, breaking personalization until the next `identify()` call.

## Fix

Use **capture phase** (`true` as third arg to `addEventListener`) so the interceptor fires before Next.js Link's handler. Use `router.push()` for client-side navigation to preserve NT state:

```ts
document.addEventListener('click', handler, true); // capture phase

// Inside handler:
e.preventDefault();
e.stopPropagation();
router.push(`${href}${separator}preview=true`);
```

Also skip links that already have `preview=true`, API routes (`/api/`), and asset routes (`/_next/`).

## Related files

- `src/components/preview-link-interceptor.tsx`
- `src/app/layout.tsx` — registers `<PreviewLinkInterceptor />` in root layout
