# Loop C — Integration Simulator

**Story:** Contentful as the integration hub. Commerce data lives in Shopify. DAM assets live in MediaVault. Editors don't own that data — they enrich it. This loop makes that tangible without needing a real Shopify or DAM account.

**Demo route:** `/page/product-showcase`  
**Duration:** ~5 minutes  
**Difficulty:** Medium (requires Contentful App installed)

---

## Setup Checklist

Before the demo, confirm:

- [ ] Integration Simulator App Definition created in Contentful:
  - Name: `Integration Simulator`
  - URL: `http://localhost:3000/contentful-app/integration-simulator` (local) or deployed URL
  - Locations: `app-config`, `entry-field`
- [ ] App installed + configured:
  - `productDetailPage` → `sku` → E-Commerce
  - (optional) any CT → any field → DAM
- [ ] `bun run dev` running locally, or deployed preview URL accessible
- [ ] `product-showcase` page entry published in Contentful master

---

## Talk Track + Click Path

### Act 1 — The Setup (~60s)

> "Most of our customers don't live in a world where all their data lives in Contentful. They have commerce data in Shopify, assets in a DAM, maybe customer data in a CDP. The question is: how do you pull all of that into one structured content layer without rebuilding your stack?"

**Click:** Navigate to `/page/product-showcase`

> "This is a product detail page. The product name, price, inventory, color options, images — none of that is in Contentful. It's coming from a simulated Shopify catalog."

**Point to:** The "Sourced from Shopify" badge on the PDP block.

> "The only thing in Contentful is the editor notes below the divider — the field an editor added to contextualize the product for their audience."

**Click:** Inspector mode → hover `editorNotes` region → rich text editor opens.

---

### Act 2 — The Magic Moment (~90s)

> "Let me show you how an editor actually connects a product."

**Navigate:** Contentful entry editor → open any `productDetailPage` entry.

**Click:** The `sku` field → "Add Product" button.

> "The picker opens directly in the entry editor — this is a Contentful app running in an iframe. The editor sees their Shopify catalog: 15 products, filterable by category."

*Let the fake loading spinner play for 300–800ms.*

> "Notice the latency. This is what a real API response feels like. The editor can search, filter by category, and pick the right product."

**Click:** "Keyboards" tab → select "Ergo Pro Mechanical Keyboard" → "Import Product".

*1200ms "Importing…" spinner plays.*

> "The field chip updates. Now in the live preview…"

**Show:** Live preview pane → PDP refreshes with the newly selected product data.

> "The product data is being read from the catalog API and rendered client-side. Change the SKU in Contentful, the product on the page updates instantly."

**Key moment to call out:** "Editors enrich the product. They don't own it. The source of truth stays in Shopify."

---

### Act 3 — The Listing (~60s)

**Scroll down to:** DynamicListing block ("Complete Your Setup").

> "This is a dynamic product listing. Instead of a single SKU, it stores an array of SKUs and renders all of them — same catalog, same client-side fetch."

**In Contentful:** Open the DynamicListing entry → show the `skus` field (JSON array).

> "An editor or an integration can write SKUs to this field — no custom code, no CMS restructure. The block renders whatever's in the array."

**Variant story:** Toggle `displayVariant` from `scroll` to `grid` → show layout change in live preview.

---

### Act 4 — DAM Variant (~60s, optional)

> "The same pattern works for your DAM."

**Navigate:** Any entry with a DAM-mapped field → "Add Asset" button.

> "Same picker UI, different skin. MediaVault branding instead of Shopify. Asset thumbnails, metadata panel, folder navigation."

**Select an asset → "Use Asset".**

> "The asset record is stored in Contentful. Your rendering layer resolves it from the DAM URL — no asset import, no re-hosting."

---

### Reset Instructions

1. Open any `productDetailPage` entry
2. Click "Remove" on the `sku` chip to clear the field
3. The PDP block shows "No product linked" placeholder

---

## Modularity Story

This loop is self-contained and reusable across demos:

| Swap | How |
|------|-----|
| Different products | Edit the seed JSON in `src/lib/integration-adapters/seed-data.ts` |
| Real Shopify | Swap `contentfulCatalogAdapter` with a real Shopify Storefront API adapter (same interface) |
| Different catalog size | Change `SEED_PRODUCTS` — up to any number |
| Real DAM | Swap `getAssets()` fetcher for a real DAM SDK call |
| Different product field | Update the Integration Simulator app config mapping (no code change) |

---

## AI / Personalization Hook

- Combine with Ninetailed: identify the user's role (developer, marketer, buyer) → show different `editorNotes` variants using NT personalization on the `productDetailPage` entry.
- The `skus` array on DynamicListing could be driven by a CDP segment — logged-in users see their purchase history as recommendations.

---

## Entry IDs (master environment)

| Entry | ID |
|-------|-----|
| Page — product-showcase | `4PvPoOLYZ4qeh6qvzs7KiG` |
| PDP — Ergo Pro Keyboard | `7ksaC6TQcIucFeJCsDMoqL` |
| PDP — ANC Headset Pro | `1vKjueXB2MQ9PoDzgYWUn8` |
| PDP — UltraWide Monitor | `25nMACKKb25gA64qBZrdHJ` |
| DynamicListing — Desk Accessories | `4Y0EoVfRYqBbf2uG5C1FfB` |
| DynamicListing — Audio Collection | `Ro5OfeZTZK9k25KitLhLl` |
