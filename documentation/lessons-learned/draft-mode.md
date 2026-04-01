# Draft Mode Not Enabled

**Symptom:** Live preview shows published content only; draft entries return 404; preview iframe shows stale/published version.

**Root cause:** Draft content requires the request to carry a valid preview token AND the draft cookie (`__prerender_bypass`). HTTP app URLs in Contentful's iframe cause mixed-content blocking — cookies are never sent, draft mode never activates.

**Fix:**

1. Use HTTPS locally: `bun run dev:https`. Set the Contentful App URL to `https://localhost:3000/contentful-app`.

2. Set the Contentful Preview URL to the enable-draft endpoint:
   ```
   https://localhost:3000/api/enable-draft?secret=kaz&slug={entry.fields.slug}
   # or for ID-based preview:
   https://localhost:3000/api/enable-draft?secret=kaz&entryId={entry.sys.id}&type=hero
   ```

3. The enable-draft route sets the draft cookie and redirects. Routes using draft mode must pass `preview: true` in GraphQL variables.

4. Verify the `__prerender_bypass` cookie is set:
   ```javascript
   document.cookie  // should contain __prerender_bypass
   ```

**Prevention:** Document the exact Preview URL and App URL when adding a new block. Wire new preview routes through `enable-draft`. Always use `bun run dev:https` when testing live preview from Contentful.

**Related files:** `src/app/api/enable-draft/route.ts`, `src/app/preview/`, `package.json` (`dev:https`)
