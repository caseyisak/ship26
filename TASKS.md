# Migration tasks

## Current hypothesis

- Migration happens **in this repo** (metafi-nextjs-shadcnblocks). No separate fork folder.
- Contentful plumbing is copied from colorful-demo-2.0 into this repo; metafi components are adapted to be CMS-driven.
- Each milestone has a test gate; we do not move on until tests and build pass.

## Current milestone: 3 — Draft mode + Live Preview (next)

**Goal**: enable-draft/disable-draft API routes; Live Preview wiring on Hero. Build passes; test that draft API returns 400 without params.

### Next experiment

1. Add `app/api/enable-draft/route.ts` and `app/api/disable-draft/route.ts`.
2. Add live-preview lib and wire Live Preview on Hero (getPreviewProps, field highlighting).
3. Add test: draft API returns 400 without secret/redirect params.
4. Run `npm run test` and `npm run build`; fix until both pass.

### Results

- **Milestone 0**: Vitest added; `src/lib/utils.test.ts` (2 tests) passes; `npm run build` passes. ✓
- **Milestone 1**: BlockRenderer plumbing added (types, utils, configs, error components, logger, x-ray, personalization stub). `src/block-renderer/block-renderer.test.tsx` (3 tests) passes; `npm run build` passes. ✓
- **Milestone 2**: Hero + BlockRenderer + page route; mock getPageBySlug; `src/block-renderer/block-renderer.test.tsx` (4 tests) passes; `npm run build` passes. ✓

---

## Checklist (do not proceed until current milestone passes)

- [x] Milestone 0: `npm run test` and `npm run build` pass
- [x] Milestone 1: Plumbing copied; build passes; BlockRenderer import test passes
- [x] Milestone 2: Hero + BlockRenderer + page route; build + render test pass
- [ ] Milestone 3: Draft mode + Live Preview on Hero; build + draft API test pass
- [ ] Milestone 4: Full flow from Contentful; build + manual/e2e pass
