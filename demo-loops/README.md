# Demo Loops

A demo loop is a reusable, self-contained demo kit that can be activated for any prospect. Each loop targets a specific pain signal or capability story, comes with seed content, components, and a full SE talk track.

## What a demo loop is

A demo loop is **not** a prospect-specific demo — it is a generic, reusable module. The sandbox (`main` branch) is the source of truth. Prospect demos branch off `main`, activate one or more loops, and swap branding/copy without rebuilding the underlying capability.

## Folder structure

Every loop in `demo-loops/` must follow this layout:

```
demo-loops/<loop-name>/
├── README.md              # SE-facing: talk track, click path, discovery questions
├── AI-CONTEXT.md          # CC-facing: component paths, entry IDs, how to adapt
├── DEMO_SCRIPT.md         # Full Tell-Show-Tell script with timing
├── content-types/
│   ├── <type-id>.json     # Full content type schema for re-seeding
│   └── <type-id>-patch.json  # Field additions to existing CTs (if any)
└── seed-entries/
    ├── <entries>.json     # Seed entry data
    └── ...
```

## How CC uses bundles when planning a prospect demo

1. Read `DEMO-OS.md` for the sandbox inventory and pain signal mappings.
2. Match prospect pain signals to loop names.
3. Read the loop's `AI-CONTEXT.md` to understand component paths, entry IDs, and env requirements.
4. Run the demo setup workflow to create a branch, new Contentful env, and seed entries.
5. Swap branding via `siteSettings` entry and brand scrape.

## How to activate a loop for a new prospect

1. Create a new branch: `demo/<prospect-name>` (worktree off `main`).
2. Create a new Contentful environment scoped to the branch.
3. Add the new env to the Contentful API key (Settings > API Keys).
4. Run the loop's seed script or manually create entries from `seed-entries/`.
5. Update `NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT` (or env-level override) to point at the new env.
6. Apply brand tokens via `siteSettings` JSON entry.

## Reference implementation

The first loop is `aio-aeo-geo/` — AIO / AEO / GEO Answer Engine Optimization demo. All future loops should follow this pattern.
