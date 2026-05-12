---
id: loop-c-integration-simulator
customer: sandbox
build_type: net-new
promotion_status: sandbox
personas:
  - VP of Digital / Head of eCommerce
  - Director of Brand / Creative Director
  - Marketing Ops / Digital Content Manager
  - Solutions Engineer (integration story)
  - IT / Platform Architect
industries:
  - Retail / eCommerce
  - Consumer Goods / CPG
  - Healthcare (DAM use case)
  - Financial Services (DAM use case)
  - Any org with an existing PIM, Shopify, commercetools, or enterprise DAM
pain_signals:
  # eComm signals
  - "We already have Shopify / commercetools — we're not re-entering every product in Contentful"
  - "Our product catalog changes daily — there's no way to keep a CMS in sync manually"
  - "Marketing wants to build landing pages around products but they don't own the product data"
  - "We built a custom middleware to sync Shopify into our CMS and it breaks every quarter"
  - "Our dev team is the bottleneck every time we need a new product page"
  # DAM signals
  - "We've spent years building our DAM in Bynder / AEM / Brandfolder — we're not abandoning it"
  - "We're already paying for an enterprise DAM, we're not going to upload everything twice"
  - "Our brand team owns the DAM and our content team owns the CMS — they need to work together without getting in each other's way"
  - "Using Contentful's media library for large video files is too expensive at our scale"
  - "Governance and version control on assets has to stay in our DAM for compliance reasons"
contentful_features:
  - Contentful Apps (iframe field editor) — custom app SDK, field-level app configuration
  - App config screen — per content-type field mapping (no code change to switch vendors)
  - Live Preview — SKU field change reflects on PDP instantly
  - Structured content model — PDP entry stores reference to product SKU, not the product data itself
  - Dynamic Listing — array of SKUs drives a product grid block
content_types:
  - id: productDetailPage
    status: net-new
    note: PDP entry with `sku` field mapped to Integration Simulator app (ECOM mode). editorNotes RichText for marketing enrichment.
  - id: dynamicListing
    status: net-new
    note: Product grid entry with `skus` JSON array field — drives a multi-product listing block
  - id: page
    status: existing
    note: Shell page entry hosting PDP + DynamicListing blocks on /page/product-showcase
components:
  - PDP (cms-components/pdp/pdp.tsx) — product card, variant picker, editorNotes enrichment zone
  - DynamicListing (cms-components/dynamic-listing/dynamic-listing.tsx) — grid or scroll layout
  - Integration Simulator Contentful App (src/contentful-app/integration-simulator/)
setup_minutes: 8
---

**What this shows:** Contentful as the composition layer — not the source of truth for every data type. Product data lives in Shopify. Brand assets live in Bynder. Editors don't re-enter that data. They reference it, enrich it, and publish pages around it. This loop makes that model tangible in 5 minutes without needing a real vendor account.

---

## When to Use This Loop

Pull this loop when the prospect has **one or more of these situations**:

1. **Active PIM / commerce platform** (Shopify, commercetools, BigCommerce, SAP Commerce) and is worried about duplicating product data in a CMS
2. **Enterprise DAM investment** (Bynder, Adobe AEM Assets, Brandfolder) and does not want to migrate to Contentful's media library
3. **Clear ownership split** — one team owns product/asset data, a different team (marketing, content) builds the web experience around it
4. **Integration anxiety** — they've had bad experiences with brittle sync scripts and want to see how a real integration should work
5. **Scale concern** — catalog has thousands of SKUs and the idea of entering them in a CMS is a non-starter

**Do not lead with this loop** if the prospect has no existing PIM or DAM and is evaluating Contentful as their first structured content platform — the value of the integration story is lost without the contrast.

---

## Tell — Reflect Their Pain

**eComm opening:**

> "One of the most common things we hear is: 'We already have Shopify — we're not entering all our products in Contentful.' And the right answer is: you shouldn't have to. Your product catalog belongs in your commerce platform. That's where your pricing, inventory, and variants live. What Contentful provides is the layer above that — the editorial context. The headline, the campaign narrative, the call to action, the personalized recommendation. The product data comes from Shopify. The page around it comes from Contentful."

**DAM opening:**

> "Same story applies to your DAM. If you've built a governance workflow in Bynder over the past three years — version control, rights management, approval flows — Contentful isn't going to ask you to abandon that. Your editors reference assets from the DAM by URL. Contentful stores the metadata. The asset never moves."

---

## Show — Click Path

### Act 1 — The product page (~60s)

1. **[Browser]** Navigate to `http://localhost:3000/page/product-showcase`
   - Show the PDP block: product image, name, price, inventory badge, variants, "Sourced from Shopify" pill
   - *"Everything you see here — SKU, price, stock level, variants — is coming from a simulated Shopify catalog via API. None of this data is in Contentful."*

2. **[Browser]** Scroll to the `editorNotes` zone below the product card
   - *"This section — the editorial context, the campaign copy, the content an editor adds — that's in Contentful. That's the separation: product team owns the product data, content team owns the story around it."*

3. **[Browser] Inspector mode** → hover the editorNotes region → click to open in entry editor
   - *"And because it's Contentful, the editor can update this in Live Preview — they see their changes in context, next to the real product."*

---

### Act 2a — Connecting a single product (~90s)

4. **[Contentful]** Open a `productDetailPage` entry in the entry editor (e.g., UltraWide Monitor `25nMACKKb25gA64qBZrdHJ`)

5. **[Contentful]** Click into the `sku` field → **"Add Product"**
   - *"This is where the integration lives. Instead of a text box, your editor sees a product picker — this is a Contentful app running in an iframe inside the entry editor."*
   - Allow the simulated 300–800ms load to play out.
   - *"Notice the latency. That's the API round-trip. This is what a real Shopify or commercetools response feels like."*

6. **[App — eComm picker]** Walk through the picker UI:
   - Search bar: type "keyboard" → catalog filters in real time
   - Category tabs: click "Keyboards"
   - Select "Ergo Pro Mechanical Keyboard" → detail panel opens right: SKU, price, stock, tags
   - *"The editor can confirm it's the right SKU before importing — they see the full product record."*

7. **[App]** Click **"Import Product"** → 1200ms "Importing…" spinner → field chip updates

8. **[Browser — Live Preview]** PDP block refreshes with the newly selected product
   - *"Change the SKU, the product on the page updates. The source of truth stays in Shopify. Contentful just stores the reference."*

---

### Act 2b — Collection picker: selecting by category (~60s)

*Use this variant when the prospect manages large catalogs or when the conversation is about merchandising at scale, not individual PDPs.*

4. **[Contentful]** Open a `dynamicListing` entry (e.g., "Desk Accessories" `4Y0EoVfRYqBbf2uG5C1FfB`) → click the `skus` field → **"Add Products"**
   - *"This is the multi-select variant. Instead of picking products one by one, an editor picks a category — and gets everything in it."*

5. **[App — category grid]** Show the category card grid:
   - Categories displayed as cards: Monitors, Keyboards, Mice, Accessories, Cameras
   - *"Think of this like Shopify Collections. You select the collection, not individual items."*
   - Click **"Keyboards"** → card gets blue border + checkmark
   - Click **"Accessories"** → second card selected
   - Bottom bar shows: `2 categories selected · 7 products`
   - *"You can combine categories — everything is deduped. If a product appears in two categories, it shows once."*

6. **[App]** Click **"Import Collection"** → spinner → field updates to brand pill showing category names + product count

7. **[Browser — Live Preview]** DynamicListing block renders the combined product grid — all 7 products, two categories, live
   - *"The editor made one decision — which categories — and got a fully populated product grid. No SKU list to maintain. When new products are added to Keyboards in Shopify, they show up here automatically on next publish."*

---

### Act 3 — The listing (~45s)

9. **[Browser]** Scroll to the DynamicListing block ("Complete Your Setup")
   - *"This is a product grid. It renders an array of SKUs — same catalog, same client-side fetch."*

10. **[Contentful]** Open the DynamicListing entry → show the `skus` JSON array field
    - *"An editor — or an automation, or an integration — writes SKUs here. The block renders whatever's in the array. A merchandising team can drive this without touching the component."*

11. **[Contentful]** Toggle `displayVariant` from `scroll` → `grid` in Live Preview
    - *"Layout is a content decision, not a code decision."*

---

### Act 4 — DAM variant (~60s, optional — pull in when DAM is the primary pain)

12. **[Contentful]** Navigate to an entry with a DAM-mapped field → click **"Add Asset"**
    - *"Same interaction model. Different skin — Bynder branding instead of Shopify. Same separation of concerns: assets are governed in Bynder, referenced in Contentful."*

13. **[App — DAM picker]** Walk through the picker:
    - Folder tabs: "Brand", "Marketing", "Product"
    - File type badges: PNG, JPEG, SVG, PDF, MP4 — non-image files show file icons
    - Select an image → detail panel: dimensions, file size, folder path, uploaded-by, tags
    - *"Every piece of metadata your DAM governance team cares about is surfaced right here in the Contentful editor. The asset never leaves Bynder."*

14. **[App]** Click **"Use Asset"** → field updates
    - *"The editor confirmed the right asset, with the right rights, from the right folder. Governance stayed in Bynder. The reference lives in Contentful."*

---

## Tell — Tie to Outcomes

**VP of Digital / Head of eCommerce:**
> "You get marketing velocity without touching your commerce stack. Your product team manages the catalog in Shopify. Your marketing team builds pages around it in Contentful. No sync script to maintain. No data duplication. If a product price changes in Shopify, the page reflects it instantly — without anyone touching the CMS."

**Director of Brand / Creative Director:**
> "Your DAM investment is protected. Governance, rights management, versioning — all of it stays in Bynder. Contentful stores the reference. Your editors get a clean, native-feeling picker inside the CMS they're already using. Two tools, one workflow."

**Marketing Ops / Content Manager:**
> "You don't need a developer to build a product page. Pick the SKU from the picker, write your campaign copy in the RichText field, hit publish. The product data is always fresh because it's coming from the source. You own the editorial layer, not the product data."

**IT / Platform Architect:**
> "The integration point is a Contentful app — a sandboxed iframe that calls your existing API. You swap the adapter, not the UI. Going from Shopify to commercetools is a config change in the app's mapping table, not a rebuild. And because the app is version-controlled and deployed alongside your front end, it follows your normal release process."

**Urgency line:**
> *"Most teams solve this with a sync script — a cron job that copies product data from Shopify into the CMS every night. That script breaks. It goes stale. Someone has to maintain it. The Contentful App model eliminates the sync entirely: you're reading from the source at render time. There's nothing to sync."*

---

## Value to the Prospect's Business

| Dimension | Without This Pattern | With This Pattern |
|-----------|---------------------|-------------------|
| Product page time-to-publish | Days (dev ticket to wire new SKU) | Minutes (editor self-serves from picker) |
| Data accuracy | Dependent on sync frequency — stale | Always live from source system |
| Ownership clarity | Ambiguous — product data bleeds into CMS | Clear — commerce team owns catalog, content team owns composition |
| DAM governance | Assets duplicated or governance broken | Assets stay in DAM, governance intact |
| Integration maintenance | Brittle sync scripts owned by eng | Contentful App — versioned, deployed, owned by content platform team |
| Vendor flexibility | Hard-coded to one platform | Config change to swap from Shopify → commercetools (no code) |

---

## Assets Required in the Sandbox Space

### Contentful App
- **Integration Simulator App Definition** installed in `uumzxfocy3ef`
  - URL: `http://localhost:3000/contentful-app/integration-simulator`
  - Locations: `app-config`, `entry-field`
- **App config mapping** set up: `productDetailPage → sku → SHOPIFY`

### Content Entries (master environment)

| Entry | Content Type | ID | Notes |
|-------|-------------|-----|-------|
| Page — product-showcase | page | `4PvPoOLYZ4qeh6qvzs7KiG` | Shell page hosting PDP + DynamicListing blocks |
| PDP — Ergo Pro Keyboard | productDetailPage | `7ksaC6TQcIucFeJCsDMoqL` | Pre-linked SKU for Act 2 |
| PDP — ANC Headset Pro | productDetailPage | `1vKjueXB2MQ9PoDzgYWUn8` | Alternative for live change demo |
| PDP — UltraWide Monitor | productDetailPage | `25nMACKKb25gA64qBZrdHJ` | |
| DynamicListing — Desk Accessories | dynamicListing | `4Y0EoVfRYqBbf2uG5C1FfB` | `displayVariant: scroll` for toggle demo |
| DynamicListing — Audio Collection | dynamicListing | `Ro5OfeZTZK9k25KitLhLl` | |

### Catalog seed data
- 15 products across 5 categories (Monitors, Keyboards, Mice, Accessories, Cameras) in `src/lib/integration-adapters/seed-data.ts`
- 8 DAM assets across folders (Marketing, Brand, Events, Product, Video) in same file
- Served via `GET /api/catalog` — no external account needed

---

## Reset Checklist

- [ ] `bun run dev` running at `http://localhost:3000`
- [ ] Integration Simulator App Definition installed + configured (`productDetailPage → sku → SHOPIFY`)
- [ ] `product-showcase` page entry published and accessible at `/page/product-showcase`
- [ ] At least one PDP entry has a SKU field value set (for the "already linked" demo state)
- [ ] At least one PDP entry has **no** SKU set (for the "empty → picker → linked" live demo)
- [ ] DynamicListing entry `displayVariant` set to `scroll` before demo (to show the toggle)
- [ ] Live preview configured for `productDetailPage` CT in Contentful: `http://localhost:3000/preview/pdp/{entry.sys.id}`
- [ ] No console errors on `/page/product-showcase`

---

## Modularity Story

This loop is fully self-contained and swappable:

| Swap | How |
|------|-----|
| Different eComm vendor | Change app config mapping to `COMMERCETOOLS` or `BIGCOMMERCE` — picker UI re-themes, no code change |
| Different DAM vendor | Change app config mapping to `BYNDER`, `ADOBE`, or `BRANDFOLDER` — same picker, different brand |
| Real Shopify catalog | Swap `contentfulCatalogAdapter` for a real Shopify Storefront API adapter — same `ProductRecord` interface |
| Real Bynder / AEM | Swap `getAssets()` for a real DAM SDK call — same `AssetRecord` interface |
| Different product field | Update the Integration Simulator app config mapping in Contentful UI — zero code change |
| Customer-branded demo | Point the App Definition URL at a deployed preview environment — runs from Contentful production |

---

## Building a Real 3P Integration

*For IT / Platform Architect conversations. Use after the demo when the question shifts from "can Contentful do this?" to "how would we actually build this?"*

The Integration Simulator uses a simple postMessage protocol. Replacing the simulated adapter with a real one requires two things: a hosted picker page and a backend API call. No Contentful SDK changes.

### How it works

```
Contentful entry editor
  └─ Contentful App (iframe) ← runs at your App Definition URL
       └─ openCurrentApp({ parameters: { mode, pickerMode } })
            └─ Dialog iframe ← loads your picker URL
                 └─ postMessage({ type: 'SELECTION', payload }) → back to field
```

The field app opens a dialog. The dialog loads your picker. When the user confirms a selection, your picker posts a message back. The field stores whatever shape you return.

### Picker contract

Your picker page must handle one incoming message and send one outgoing:

```ts
// 1. Receive invocation params from the field app
window.addEventListener('message', (e) => {
  const { mode, pickerMode } = e.data; // 'SHOPIFY' | 'BYNDER' etc., 'single' | 'multi'
  // initialize your picker UI
});

// 2. On user confirmation, post selection back
window.parent.postMessage({
  type: 'SELECTION',
  payload: pickerMode === 'multi'
    ? { categories: ['Keyboards'], items: ProductRecord[] }  // ProductCollection
    : { sku: 'KB-001', name: 'Ergo Pro', price: 149, ... }  // ProductRecord
}, '*');
```

### What the field stores

```ts
// Single mode — ProductRecord stored directly on the JSON field
{ sku: 'KB-001', name: 'Ergo Pro Keyboard', price: 149, images: [...], inStock: true }

// Multi mode — ProductCollection
{ categories: ['Keyboards', 'Accessories'], items: [ ...ProductRecord[] ] }
```

The `DynamicListing` block detects the shape and renders accordingly — no content type changes needed.

### Adapter swap (no code)

The app config screen maps content type fields to vendor connectors. Swapping from Shopify to commercetools is a config change in the Contentful UI:

1. Apps → Integration Simulator → Configure
2. Connectors tab: add a new connector (label, brand color, picker URL, seed data URL)
3. Mappings tab: point the field to the new connector
4. Save

The field app reads the active mapping and opens the correct picker. No component rebuild. No deployment.

### What to build

| Piece | Description | Effort |
|-------|-------------|--------|
| Picker page | React SPA hosted anywhere (Vercel, your CDN) — talks to your real API | 1–2 days |
| Backend adapter | Thin proxy: receive `{ query, category }` → call Shopify/commercetools → return `ProductRecord[]` | 1 day |
| Auth | OAuth token exchange handled server-side in your adapter — picker never sees credentials | part of adapter |
| Contentful App Definition | Point `entryField` location URL at your deployed picker | 15 min |

The sandbox ships a TypeScript interface (`ProductRecord`, `AssetRecord`, `ProductCollection`) in `src/app/contentful-app/integration-simulator/connector-types.ts` that your real adapter must match. That's the only contract.

---

## AI / Personalization Hook

- **Ninetailed + PDP**: Identify the visitor's role (developer, marketer, buyer) → show different `editorNotes` variants on the PDP using NT personalization. Same product, different editorial narrative per persona.
- **SKU-driven recommendations**: The `skus` array on DynamicListing could be written by a CDP segment (logged-in users see SKUs from their purchase history as recommendations — no component change needed).
- **AI-assisted enrichment**: An AI action on the `productDetailPage` entry could auto-generate `editorNotes` copy from the product record pulled via `/api/catalog` — editor reviews and publishes, AI does the first draft.

---

## Opp Context (Demo-OS)

**Primary use case:** Mid-market to enterprise prospects who are evaluating Contentful alongside or after a commerce or DAM platform investment. The core objection this loop addresses is *"we don't want to duplicate our data in a CMS."*

**Integration story framing for Demo-OS:**

This loop establishes the mental model that Contentful is a **composition layer**, not a replacement for existing systems. Every prospect with a PIM, DAM, CDP, or data warehouse has this concern. Loop C is the canonical answer. It should be the default response when a prospect says "we already have X."

**eComm variant** is most relevant to: Retail, CPG, DTC brands, B2B companies with product catalogs.
**DAM variant** is most relevant to: Healthcare, Financial Services, Media, any brand-heavy org with existing content governance.

**Promotion status:** Sandbox-ready. Candidate for promotion to a standalone demo template once a real Shopify adapter is wired in as an optional toggle (low-lift: 1-2 day implementation behind a feature flag).
