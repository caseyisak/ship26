## LL-015 — Draft entries return 404 in Contentful live preview iframe

- **Exact error / symptom:** `/preview/[type]/[entryId]` returns 404 when opened from Contentful's live preview iframe. Same URL returns 200 after going through `/api/enable-draft` manually.
- **Root cause:** Contentful's live preview iframe loads the URL directly without triggering `/api/enable-draft`. `draftMode().isEnabled` is false so the delivery token is used — which won't fetch unpublished/draft entries.
- **Solution:** For any service function called exclusively from `/preview/*` routes, ignore `draftMode()` and always use the preview token:
  ```ts
  // In *ByEntryId service functions:
  const usePreview = draftMode().isEnabled || true; // always true for preview routes
  ```
- **Prevention:** Any route under `/preview/*` is preview-only. Never gate on `draftMode().isEnabled` there. Audit all `*ByEntryId` services when adding new preview routes.
- **Related files:** `src/services/contentful/social-post.ts` (fixed here); all `*ByEntryId` service functions
