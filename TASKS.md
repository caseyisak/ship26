# Migration tasks

## Current hypothesis

- Migration happens **in this repo** (metafi-nextjs-shadcnblocks). No separate fork folder.
- Contentful plumbing is copied from colorful-demo-2.0 into this repo; metafi components are adapted to be CMS-driven.
- Each milestone has a test gate; we do not move on until tests and build pass.

## Current milestone: 1 — Copy Contentful plumbing (next)

**Goal**: Copy block-renderer, contentful client, live-preview, draft API, config from colorful-demo-2.0 into this repo. Build and tests pass; add test that BlockRenderer can be imported.

### Next experiment

1. Copy plumbing (see migration-plan.md Milestone 1). Add minimal config/env so build does not require Contentful .env for type-check.
2. Add a test that imports BlockRenderer (or a stub) and passes.
3. Run `bun run test` and `bun run build`; fix until both pass.

### Results

- **Milestone 0**: Vitest added; `src/lib/utils.test.ts` (2 tests) passes; `bun run build` passes. ✓

---

## Checklist (do not proceed until current milestone passes)

- [x] Milestone 0: `bun run test` and `bun run build` pass
- [ ] Milestone 1: Plumbing copied; build passes; BlockRenderer import test passes
- [ ] Milestone 2: Hero + BlockRenderer + page route; build + render test pass
- [ ] Milestone 3: Draft mode + Live Preview on Hero; build + draft API test pass
- [ ] Milestone 4: Full flow from Contentful; build + manual/e2e pass
