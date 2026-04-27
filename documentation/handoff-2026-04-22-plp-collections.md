# Handoff — PLP + Collections Feature
**Date:** 2026-04-22
**Branch to create:** `feat/plp-collections`
**Status:** Planning complete — ready to build

---

## What We're Building

A **Product Listing Page (PLP)** that displays a collection of products or assets pulled from the Integration Simulator catalog, with a left-side filter panel — the same pattern you'd see on Amazon or a Shopify storefront.

This requires changes across four areas:
1. Seed data JSON (add `collections` + `damCollections`)
2. Integration Simulator picker — collection picker mode
3. New `productListingPage` content type
4. New PLP page component + route

---

## Context You Need

### Current catalog architecture
The product/asset catalog lives in a **Contentful Settings CT JSON field** (not code). It was moved there in `cde2bb9` so editors can update it without a deploy.

- Settings entry: look up the `settings` content type in Contentful master env
- Current fields: `catalog` (JSON) with `products[]` and `assets[]`
- The integration simulator reads this at runtime via GraphQL

### Current Integration Simulator
- **Config screen** (`src/app/contentful-app/integration-simulator/config-screen.tsx`): editors activate a CT + pick a field + choose a simulator type (Shopify, Bynder, etc.)
- **Field editor** (`field-editor.tsx`): renders "Add Product" / "Add Asset" button on the activated field
- **Dialog** (`dialog.tsx`): the picker UI — currently returns ONE product or asset
- **App params**: saved as `{ mappings: [{ contentTypeId, fieldId, simulatorType }] }`

### Current single-item flow
1. Editor opens a PDP entry
2. Clicks "Add Product" on the SKU field
3. Dialog opens → picks one product → value saved as `{ sku, name, price, ... }`

### What's changing
- Dialog gets a **Collection mode** that returns `{ collectionId, name, simulatorType, itemCount }`
- New content type `productListingPage` stores a collection reference
- New PLP component fetches the collection's products from catalog JSON and renders them with filters

---

## Terminology by Platform

| Platform | Term for "collection of products" |
|----------|-----------------------------------|
| Shopify | Collections |
| commercetools | Categories |
| BigCommerce | Categories |
| Bynder | Collections |
| Brandfolder | Brandfolders / Collections |
| Adobe AEM Assets | Collections / Folders |

Use "collection" as the generic term in our data model. Each collection has a `simulatorType` that determines which platform label to show.

---

## Data Model Changes

### 1. Settings CT — add `collections` and `damCollections`

Update the existing `catalog` JSON field in the Settings entry to add:

```json
{
  "products": [ ...existing... ],
  "assets": [ ...existing... ],
  "collections": [
    {
      "id": "monitors",
      "name": "Monitors",
      "handle": "monitors",
      "simulatorType": "SHOPIFY",
      "description": "All monitor products",
      "image": "https://images.ctfassets.net/...",
      "productSkus": ["MF-MON-001", "MF-MON-002"],
      "availableFilters": ["category", "price", "brand", "tags"]
    },
    {
      "id": "all-products",
      "name": "All Products",
      "handle": "all-products",
      "simulatorType": "SHOPIFY",
      "description": "Full product catalog",
      "productSkus": ["MF-MON-001", "MF-MON-002", "MF-KEY-001"],
      "availableFilters": ["category", "price", "brand", "tags"]
    }
  ],
  "damCollections": [
    {
      "id": "brand-photography",
      "name": "Brand Photography",
      "handle": "brand-photography",
      "simulatorType": "BYNDER",
      "description": "All brand photography assets",
      "assetIds": ["asset-001", "asset-002"],
      "availableFilters": ["type", "tags", "channel"]
    }
  ]
}
```

### 2. New content type: `productListingPage`

| Field | Type | Notes |
|-------|------|-------|
| `internalName` | Symbol | Required, display field |
| `slug` | Symbol | Unique, for routing |
| `heading` | RichText | Page heading |
| `collection` | Object (JSON) | Stores `{ collectionId, simulatorType }` — set via Integration Simulator picker |
| `filtersEnabled` | Boolean | Show/hide left filter panel |
| `filterFields` | Array[Symbol] | Which filters to expose, e.g. `["category", "price", "brand"]` |
| `sections` | Array[Entry] | Optional content blocks above/below the grid |

### 3. Integration Simulator — collection picker mode

The dialog needs a **mode toggle**: "Single item" vs "Collection".

- **Single item** (existing): returns `{ sku, name, price, ... }` or `{ assetId, name, ... }`
- **Collection** (new): returns `{ collectionId, name, simulatorType, itemCount, handle }`

The field editor detects which mode based on the stored value shape and renders accordingly:
- Single item → shows product card with "Change" / "Remove"
- Collection → shows collection card with "Edit Collection" / "Remove"

---

## PLP Page Architecture

### Route
`/plp/[handle]` — handle comes from the `slug` field on `productListingPage`

### Layout
```
┌─────────────────────────────────────────────────────┐
│  [Heading from CT]                                   │
│  [Collection name badge — e.g. "Shopify Collection"] │
├──────────────┬──────────────────────────────────────┤
│  FILTERS     │  PRODUCT GRID                        │
│              │                                      │
│  Category    │  [Card] [Card] [Card]                │
│  □ Monitors  │  [Card] [Card] [Card]                │
│  □ Keyboards │                                      │
│              │  Showing 6 of 12                     │
│  Price       │  [Load more]                         │
│  $0 – $500   │                                      │
│  $500 – $1k  │                                      │
│              │                                      │
│  Brand       │                                      │
│  □ MetaFi   │                                      │
│  □ UltraWide│                                      │
└──────────────┴──────────────────────────────────────┘
```

### Data flow
1. Page loads `productListingPage` entry by slug → gets `collection.collectionId`
2. Fetches catalog JSON from Settings CT
3. Finds matching collection → resolves `productSkus` → matches against `products[]`
4. Renders product grid, extracts filter options from product metadata
5. Client-side filtering — no backend calls needed (catalog is small)

### Component structure
```
/src/app/plp/[handle]/
  page.tsx              ← server component, fetches CT entry + catalog
  plp-client.tsx        ← client component, owns filter state
  
/src/cms-components/plp/
  plp.tsx               ← layout wrapper
  filter-sidebar.tsx    ← left panel with checkboxes
  product-grid.tsx      ← responsive grid
  product-card.tsx      ← individual card (reuse/extend from ecomm picker)
  collection-badge.tsx  ← "Shopify Collection" / "Bynder Collection" badge
```

---

## Implementation Order

1. **Update Settings CT JSON** — add `collections` + `damCollections` with sample data
2. **Update catalog service** — add `getCollections()` and `getCollectionProducts(id)` helpers
3. **Create `productListingPage` CT** in Contentful via MCP
4. **Update Integration Simulator dialog** — add mode toggle, collection picker UI
5. **Update field editor** — detect collection vs single-item, render collection card
6. **Build PLP route + components** — server page → client filter → grid
7. **Create sample PLP entry** in Contentful
8. **Playwright verify** — all routes 200, filters work, live preview opens

---

## Files to Read First

```
src/app/contentful-app/integration-simulator/config-screen.tsx
src/app/contentful-app/integration-simulator/field-editor.tsx
src/app/contentful-app/integration-simulator/dialog.tsx
src/app/contentful-app/integration-simulator/config-screen.tsx   ← BRAND_CONFIG, SimulatorType, AppParams
```

Check the Settings CT entry in Contentful for the current catalog JSON shape before modifying it.

---

## Related Commits
- `cde2bb9` — catalog moved to Settings CT JSON
- `92fbf83` — integration simulator port migration + field picker
- `b95f1cf` — save bug fixed (onConfigure pattern)
- `c41071a` — original integration simulator (ecomm picker field app)

---

## Next Session Start

1. Create worktree: `bash scripts/worktree-add.sh feat/plp-collections`
2. Open new Claude Code: `claude /Users/casey.lisak/Dev/metafi-worktrees/feat-plp-collections`
3. Read this doc + `TASKS.md`
4. Prime with the files listed above
5. Start with Step 1: update the Settings CT catalog JSON
