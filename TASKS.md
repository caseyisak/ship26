# Migration tasks

## Current hypothesis

- Migration happens **in this repo** (metafi-nextjs-shadcnblocks). No separate fork folder.
- Contentful plumbing is copied from colorful-demo-2.0 into this repo; metafi components are adapted to be CMS-driven.
- Each milestone has a test gate; we do not move on until tests and build pass.

## Current milestone: 4 — Full flow from Contentful (next)

**Goal**: Real Contentful client + GraphQL/codegen; page from Contentful; Live Preview in browser. Build passes; manual/e2e: open preview URL and see Hero.

### Next experiment

1. Add Contentful GraphQL client, codegen, env; Page + Hero fragments.
2. Replace mock getPageBySlug with real Contentful fetch; use preview when draftMode.
3. Manual test: enable-draft → /page/[slug] → see Hero; inspector mode.
4. Run `npm run test` and `npm run build`; fix until both pass.

### Results

- **Milestone 0**: Vitest added; `src/lib/utils.test.ts` (2 tests) passes; `npm run build` passes. ✓
- **Milestone 1**: BlockRenderer plumbing added (types, utils, configs, error components, logger, x-ray, personalization stub). `src/block-renderer/block-renderer.test.tsx` (3 tests) passes; `npm run build` passes. ✓
- **Milestone 2**: Hero + BlockRenderer + page route; mock getPageBySlug; `src/block-renderer/block-renderer.test.tsx` (4 tests) passes; `npm run build` passes. ✓
- **Milestone 3**: Draft mode + Live Preview; enable-draft/disable-draft API routes; LivePreviewProvider + Hero inspector; `src/app/api/enable-draft/route.test.ts` (3 tests) passes; `npm run build` passes. ✓

---

## Checklist (do not proceed until current milestone passes)

- [x] Milestone 0: `npm run test` and `npm run build` pass
- [x] Milestone 1: Plumbing copied; build passes; BlockRenderer import test passes
- [x] Milestone 2: Hero + BlockRenderer + page route; build + render test pass
- [x] Milestone 3: Draft mode + Live Preview on Hero; build + draft API test pass
- [ ] Milestone 4: Full flow from Contentful; build + manual/e2e pass
