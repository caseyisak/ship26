# Live Preview Field Name Mismatch (Raw vs Mapped)

**Symptom:** Images don't update in live preview when changed; removed background persists; component shows stale data despite Contentful sending updates.

**Root cause:**
1. `useLiveUpdates` returns **raw Contentful field names** (e.g. `media`), not the mapped names the service layer uses (e.g. `image`). Mappers in `hero.ts`/`page.ts` only run on the initial server fetch — live updates bypass them.
2. Fallback logic (`imageUrl ?? data.media?.url`) means when Contentful sends `null` for a removed field, the code falls back to stale data instead of treating it as removed.
3. Visual elements rendered unconditionally (e.g. `<GridBackground />`) show even when data is absent.

**Fix:**
```typescript
// Check BOTH the mapped name (from initial data) and raw name (from live updates)
type RawLiveData = HeroFragment & { media?: { url?: string } | null };

const imageUrl =
  (liveData as HeroFragment).image?.url ??
  (liveData as RawLiveData).media?.url ??
  undefined;

// Never fall back to stale `data` — if liveData.field is null, it was removed
// ❌ const bg = liveData.backgroundImage?.url ?? data.backgroundImage?.url;
// ✅ const bg = liveData.backgroundImage?.url ?? undefined;

// Render conditionally — let missing fields render nothing
{imageUrl && <Image src={imageUrl} ... />}
{backgroundUrl && <GridBackground />}
```

**Prevention:** In every component using `useLiveUpdates`, check both the mapped and raw field name. Never fall back to `data` for fields that should update. Let empty fields render nothing.

**Related files:** `src/cms-components/hero/hero.tsx`, `src/lib/live-preview.tsx`, `src/services/contentful/hero.ts`
