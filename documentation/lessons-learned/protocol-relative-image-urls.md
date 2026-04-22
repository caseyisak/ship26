## LL-013 — `next/image` rejects Contentful protocol-relative asset URLs

- **Exact error / symptom:** Image renders as a broken icon wherever `next/image` is used with a Contentful asset URL.
- **Root cause:** Contentful GraphQL returns asset `url` as protocol-relative (`//images.ctfassets.net/...`). `next/image` requires an absolute `https://` URL and silently fails instead of throwing.
- **Solution:** Use a plain `<img>` tag for Contentful-sourced assets, or prepend `https:`:
  ```tsx
  // ✅ Option 1 — plain img (recommended for external assets with unknown dimensions)
  <img src={url.startsWith('//') ? `https:${url}` : url} alt="..." className="h-10 w-auto" />

  // ✅ Option 2 — fix URL and pass to next/image (requires known width/height)
  <Image src={`https:${url}`} alt="..." width={40} height={40} />
  ```
- **Prevention:** Any time you use a Contentful asset URL, always guard for `//` prefix. The `images.remotePatterns` for `images.ctfassets.net` is already configured in `next.config.ts`.
- **Related files:** `src/components/layout/navbar.tsx` — fixed here; any component using Contentful asset URLs
