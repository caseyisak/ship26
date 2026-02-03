# Migration tasks

## Current hypothesis

- Migration happens **in this repo** (metafi-nextjs-shadcnblocks). No separate fork folder.
- Contentful plumbing is copied from colorful-demo-2.0 into this repo; metafi components are adapted to be CMS-driven.
- Each milestone has a test gate; we do not move on until tests and build pass.

## Current milestone: 2 — Hero + BlockRenderer + page route (next)

**Goal**: Hero fragment, Page query, Hero CMS component, page route that renders sections via BlockRenderer. Build and tests pass; add test that BlockRenderer renders Hero with mock data.

### Next experiment

1. Add Contentful client, codegen, env config; Hero fragment and Page document; Hero CMS component and block config.
2. Add `[locale]/[slug]` page that fetches page and renders sections with BlockRenderer.
3. Add test that BlockRenderer renders Hero with mock Hero data.
4. Run `npm run test` and `npm run build`; fix until both pass.

### Results

- **Milestone 0**: Vitest added; `src/lib/utils.test.ts` (2 tests) passes; `npm run build` passes. ✓
- **Milestone 1**: BlockRenderer plumbing added (types, utils, configs, error components, logger, x-ray, personalization stub). `src/block-renderer/block-renderer.test.tsx` (3 tests) passes; `npm run build` passes. ✓

---

## Checklist (do not proceed until current milestone passes)

- [x] Milestone 0: `npm run test` and `npm run build` pass
- [x] Milestone 1: Plumbing copied; build passes; BlockRenderer import test passes
- [ ] Milestone 2: Hero + BlockRenderer + page route; build + render test pass
- [ ] Milestone 3: Draft mode + Live Preview on Hero; build + draft API test pass
- [ ] Milestone 4: Full flow from Contentful; build + manual/e2e pass
