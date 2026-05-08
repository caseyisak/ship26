# Beckons — Brand Research Document

> **Purpose:** Theme a demo site and write a demo script for a Beckons customer demo.
> **Source:** Scraped from beckons.com on 2026-04-28. Pages covered: homepage, /about/, /contact-us/, /reservations/, /trade-media/, /journal/, success stories, and 10+ blog/journal posts.

---

## 1. Visual Identity

### Primary Colors

| Role | Hex | Usage |
|------|-----|-------|
| Primary Burgundy | `#5f0002` | CTAs, buttons, active nav, section backgrounds |
| Cream / Off-white | `#fff9ed` | Page background, hero backgrounds |
| Light Warm Gray | `#f6f1e6` | Card backgrounds, form inputs, alternate section BG |
| Near-Black Charcoal | `#1d1d1d` | Body text, headlines on light BG |
| Mid Gray | `#707070` | Secondary text, captions |
| Light Gray | `#888` / `#bbb` | Tertiary text, disabled states |

**Accent:** `#007bff` appears in links (likely a residual Bootstrap default; not a brand accent — use burgundy for accents in demo).

### Secondary / Contextual Colors
- Gradient overlays on lodge imagery: dark-to-transparent black gradients over hero images (lodge slider)
- Warm cream tint consistent across all sections — the site reads distinctly "warm luxury" not "cold white"

### Gradient Usage
- Lodge slider section: bottom-to-top dark gradient over full-bleed photography (`rgba(0,0,0,0.4)` to transparent)
- CTA banner: solid `#5f0002` background (no gradient)
- No vivid gradients — brand aesthetic avoids them

### Border Radius
- Buttons: minimal/no radius — sharp rectangular edges (luxury restraint)
- Cards: subtle rounding, ~4–6px estimated
- Form inputs: same minimal radius pattern

### Button Styles
- **Primary CTA:** `background: #5f0002`, white text, 12px uppercase, wide letter-spacing (~0.03em–0.1em), padding ~10px 17px
- **Animated underline links:** Burgundy text with SVG `link-arrow` decoration, hover reveals animated underline
- **Nav "Contact" button:** Dark burgundy pill/rectangle, uppercase 12px
- No outlined or ghost button variants visible — solid fills only

---

## 2. Typography

### Font Families

| Font | Source | Role | Weights |
|------|--------|------|---------|
| **Reckless** | Custom/Adobe (NOT Google Fonts) | Display / headlines | 400 (regular) |
| **Josefin Sans** | Google Fonts | Navigation, labels, eyebrows | 400 (uppercase) |
| **Inter** | Google Fonts / system | Body text | 400, 500 |
| **Playfair Display** | Google Fonts | Serif fallback (secondary) | — |

> **Note for theming:** Reckless is a paid typeface from Displaay Type Foundry. For the demo, substitute **DM Serif Display** or **Cormorant Garamond** from Google Fonts to approximate the refined serif headline style.

### Typography Scale
- H1/H2: 36–60px, line-height 100–110% (very tight — luxury editorial style)
- Body: 14–18px, line-height 140%
- Navigation: 12–13px, ALL CAPS, letter-spacing ~0.03em
- Eyebrow labels: uppercase, 11–12px, wide tracking

### Typography Character
- Headlines feel editorial and restrained — not bold/loud
- Body text is understated, generous line height
- All-caps usage is consistent for navigation and category labels (never headlines)

---

## 3. Properties / Lodge Portfolio

### Full Portfolio (9 Lodges, 4 Countries)

#### Australia (5 properties)
| Lodge | Location | Region |
|-------|----------|--------|
| **Capella Lodge** | Lord Howe Island | New South Wales |
| **Longitude 131°** | Uluru-Kata Tjuta | Northern Territory |
| **Silky Oaks Lodge** | Daintree Rainforest | North Queensland |
| **Southern Ocean Lodge** | Kangaroo Island | South Australia |
| **The Louise** | Barossa Valley | South Australia |

#### New Zealand (1 property)
| Lodge | Location | Region |
|-------|----------|--------|
| **Huka Lodge** | Taupō | North Island |

#### Canada (1 property)
| Lodge | Location | Region |
|-------|----------|--------|
| **Clayoquot Wilderness Lodge** | Vancouver Island | British Columbia |

#### Chile (2 properties)
| Lodge | Location | Region |
|-------|----------|--------|
| **Tierra Atacama** | Atacama Desert | Norte Grande |
| **Tierra Patagonia** | Torres del Paine National Park | Patagonia |

### Property Descriptions (from journal/blog content)

**Southern Ocean Lodge** — Kangaroo Island, South Australia
- Positioned as a design icon; rebuilt after the 2019-20 Kangaroo Island bushfires ("SOL 2.0: A Tale of Hope")
- Sleep experience marketed around coastal views, luxury bedding, restorative rest
- "The rebirth of Southern Ocean Lodge" — redemption narrative
- Indigenous/conservation angle: Ligurian honey, seal bay wildlife, student aquaponics programs

**Longitude 131°** — Uluru-Kata Tjuta, Northern Territory
- Indigenous cultural partnerships: Ernabella Arts collaboration (tiles, painting)
- "Field of Light" experiences in the desert
- Red Centre helicopter tours
- Guides profiled for immersive storytelling (Caroline Haden-Smith)
- Capella Spa newly opened

**Silky Oaks Lodge** — Daintree Rainforest, QLD
- Tropical Christmas programming
- Indigenous Daintree guides (First Nations Adventures)
- Chef's Table BBQ events, local chef Juan Walker
- Rainforest + river setting

**Clayoquot Wilderness Lodge** — Vancouver Island, Canada
- Double award winner (awards not specified in scraped content)
- "Call to the Wild" positioning
- Salmon conservation programs, wildlife (dogs of Clayoquot)
- 2020 season had pandemic-era disruption

**The Louise** — Barossa Valley, South Australia
- Wine country destination ("The Barossa Beckons")
- Chef's wine cellar experience
- South Australian food and wine positioning

**Capella Lodge** — Lord Howe Island, NSW
- UNESCO World Heritage area island setting
- Mount Gower hiking challenge
- Providence Petrel birdwatching
- Golf on Lord Howe Island
- Managers Mark McKillop and Libby Grant (from profile article)

**Huka Lodge** — Taupō, New Zealand
- Lake Taupō cruising activities

**Tierra Atacama / Tierra Patagonia** — Chile
- Part of "Tierra Hotels" brand absorbed into Beckons rebrand
- Torres del Paine National Park (Tierra Patagonia) and Atacama Desert (Tierra Atacama)

### Imagery Themes
- Vast wilderness landscapes (outback, rainforest, ocean cliffs, glacial mountains, desert)
- Intimate human-in-nature scale — figures dwarfed by environment
- Wildlife: echidnas, Providence petrels, seals, salmon, bees
- Indigenous art and cultural partnership imagery
- Lodge architecture embedded in landscape — not standalone
- Food/dining photography (chef's table, local produce, fine dining)
- Warm golden-hour lighting dominant; soft naturalistic grading
- Color grading: **warm, naturalistic** — earthy tones, desaturated highlights, film-like quality (not clean/crisp white)

---

## 4. Navigation Structure

### Primary Navigation (Desktop)
1. **Lodges** (dropdown — all 9 properties)
2. **About Beckons**
3. **Packages**
4. **Careers**
5. **Trade & Media**
6. **Giving Back**
7. **Journal**
8. **Social**
9. **Contact** (CTA button, burgundy)

### Secondary / Utility Navigation
- Language / country selector (`th-lang-selector`)
- "Reserve Now" button in nav
- Mobile: Hamburger → slide-out panel (375px wide)
- Sticky header at 50–120px height

### Page Inventory (from sitemap)
- `/` — Homepage
- `/about/` — About Beckons / portfolio overview
- `/reservations/` — Booking hub (links to property-specific booking systems)
- `/contact-us/` — General, career, event inquiry sub-pages
- `/trade-media/` — Trade and press resources (gated)
- `/journal/` — Blog hub (filterable by lodge, by year 2018–2026)
- `/success-stories/` — Staff/guest stories
- `/social/` — Social media aggregation
- `/careers/` — Jobs
- `/downloads/` — Assets / brochures
- `/privacy-policy/` and `/terms-conditions/`

---

## 5. Content & Tone / Brand Voice

### Brand Identity
- **Official name:** Beckons
- **Former names:** Baillie Lodges (Australia) + Tierra Hotels (Chile) — unified in 2023/2024 rebrand
- **Founded:** 1996
- **Tagline:** *"A World that Calls to You"*
- **Meta descriptor:** "Pioneers in sustainable, experiential travel since 1996"

### Repeated Words & Phrases
- "Luxury wilderness lodges"
- "Exceptional" (used frequently — "exceptional sleep experience," "exceptional luxury lodges")
- "Curated" / "curated travel experiences"
- "Experiential travel"
- "Sustainable" / "sustainability"
- "Collection" — properties referred to as a *collection*, not a *chain*
- "Exclusive"
- "Extraordinary journeys"
- "Place-based experiences"
- "Conservation"
- "Indigenous"
- "Pioneering"
- "Remote" / "wilderness"
- "Immersive"
- "Restorative"

### Sample Headlines & Taglines
- *"A World that Calls to You"* — primary brand tagline
- *"Luxury Lodges & Exclusive Travel Experiences"* — homepage H1
- *"Discover extraordinary luxury lodges and curated travel experiences"* — homepage subhead
- *"Contact Our Travel Specialists"* — contact page H1
- *"SOL 2.0: A Tale of Hope"* — Southern Ocean Lodge rebuild narrative
- *"Clayoquot's Call to the Wild"* — Clayoquot blog headline
- *"In Bed With Southern Ocean Lodge: A Sleep Experience"* — editorial content headline
- *"The Barossa Beckons: Wine Country Adventures"* — The Louise blog headline
- *"A Colourful Partnership"* — Indigenous arts collaboration
- *"New Name, Same Purpose"* — rebrand announcement

### Brand Voice Characteristics
- **Sophisticated, aspirational, understated** — never shouts
- Narrative/editorial tone, not transactional
- Conservation and Indigenous culture are genuine brand pillars, not greenwashing footnotes
- Storytelling through staff profiles and guest narratives (not just property listings)
- Accessible but refined — written for high-net-worth travelers who are also intellectually curious
- Strong sense of *place* — every property has a distinct character tied to landscape

### Brand Values (stated and demonstrated)
1. **Sustainability** — founding commitment, 1996; conservation programs at every property
2. **Experiential / immersive** — guests don't just stay, they *discover*
3. **Indigenous cultural respect** — partnerships with Ernabella Arts, First Nations Daintree guides, etc.
4. **Wilderness stewardship** — salmon programs, Ligurian bee conservation, student aquaponics
5. **Exclusivity through limitation** — small lodge counts, remote locations
6. **Luxury through authenticity** — local chefs, local produce, local guides

---

## 6. Homepage Section Architecture

Based on DOM analysis of the homepage:

1. **Sticky Header** — Logo, navigation, "Reserve Now" CTA, language selector (50–120px, transforms on scroll)
2. **Hero / Visual Area** — Full-viewport (100vh minus header), likely video/image hero with headline overlay
3. **Experience Carousel** — Image with overlay info panel; lodge/experience discovery
4. **Lodge Slider** — 800px height, full-bleed lodge photography with gradient overlay, lodge names
5. **Journey / Destination Section** — Geographic/country-based content organization
6. **CTA Banner** — Solid `#5f0002` burgundy background, white headline + button
7. **Social Proof Area** — Award logos, testimonial/blockquote section
8. **Instagram Feed Integration** — Social proof / lifestyle imagery
9. **Newsletter Signup Form** — Multi-stage (intro → form → thank-you confirmation)
10. **Footer** — Navigation, sign-up module, legal links

---

## 7. Existing FAQ / Q&A Content

No dedicated FAQ page exists at `/faq/` or `/help/`. FAQ-type content is distributed through:

- **Contact page sub-pages:** `/contact-us/general-inquiry/`, `/contact-us/event-inquiry/`
- **Reservations page:** Implicit Q&A via "Reserve your stay below or contact us to speak with the Beckons Reservations team"
- **Blog/Journal:** Many how-to and "what to know" posts that function as FAQ content:
  - "Ten Fun Facts About Lord Howe Island"
  - "Hiking Mount Gower" — practical experience guide
  - "Valley of the Winds" — Uluru experience guide
  - "Golf on Lord Howe Island"
  - "Green Light on the Green Season" — seasonal travel FAQ equivalent
  - "Protecting Paradise: Howe to Make a Difference" — conservation + visitor impact
  - "Discover the Red Centre by Heli" — activity guide
  - "Walk Among the Locals at Seal Bay" — activity + wildlife guide

### Implied FAQ Seeds for AEO Demo
These are the questions a luxury traveler would ask (and Beckons' content implicitly answers):

- *What is the best time of year to visit [lodge]?* → "Green Light on the Green Season"
- *What activities are available at Longitude 131°?* → heli tours, Valley of the Winds, Ernabella Arts
- *How do I get to Lord Howe Island?* → island logistics implied in multiple posts
- *What makes Southern Ocean Lodge unique?* → cliffside design, rebuild story, coastal wildlife
- *Is Beckons sustainable?* → yes, explicitly — 1996 founding principle
- *What Indigenous experiences are available?* → Ernabella Arts, First Nations Daintree
- *How far in advance should I book?* → not stated directly
- *What is the Capella Spa at Longitude 131°?* → newly opened, featured in journal

---

## 8. Social Proof

### Awards & Recognition
- **Robb Report Top 50 Greatest Luxury Hotels on Earth** — multiple Beckons properties listed
- **Clayoquot Wilderness Lodge** — double award winner (specific awards not captured in scrape)
- **Longitude 131°** — artists featured in Wynne Prize 2018 (Indigenous partnership recognition)

### Press Mentions (inferred from journal)
- Robb Report (confirmed)
- "Luxury Traveller" — founder Hayley Baillie featured interview
- Multiple staff/chef profiles suggest ongoing press presence

### Guest Social Proof
- Success Stories section (`/success-stories/`) contains staff journey narratives (Sara Williams, Nat Lang, Mandy McMillan, Lucky Legong, Bridie Bush, Matt Atkins) — these are staff stories, not guest testimonials
- Blog: "Tales From a Guest: Reflecting on Time Well Spent at Baillie Lodges" (326 words, 2019) — guest story exists but content is dynamically rendered (not captured in scrape)
- Instagram feed integrated on homepage — visual social proof

---

## 9. Technology Stack

| Technology | Signal | Purpose |
|-----------|--------|---------|
| WordPress + Yoast SEO | Sitemap XML generated by Yoast; `page-sitemap.xml` pattern | CMS |
| Gravity Forms | Form ID 4 visible; `GF_AJAX_POSTBACK` | Contact / inquiry forms |
| HubSpot | Portal ID `19601451`; form scripts on contact pages | CRM / lead capture |
| Google Tag Manager | Container `GTM-PC3TL92D` | Analytics orchestration |
| Facebook Pixel | ID `633710700486705` | Paid social retargeting |
| NitroPack | Performance optimization scripts, lazy loading | Page speed / CDN |
| Bootstrap (responsive grid) | Breakpoints at 601px, 901px, 1201px, 1321px | Layout framework |
| Property-specific booking systems | `reservations.southernoceanlodge.com.au` and similar per-lodge domains | Booking engine (not centralized) |
| HTML5 Video | Mute control, volume toggle | Homepage hero video |
| Instagram embed | Social feed on homepage | UGC / social proof |

### No ChatBot / Live Chat Detected
No Intercom, Drift, or Zendesk widget signals found.

### Booking Engine Architecture
Each lodge has its own booking domain (no centralized Beckons booking engine). This is a meaningful content management and personalization pain point — relevant for Contentful demo angles.

---

## 10. Demo Theming Tokens

Use these directly in the Metafi siteSettings `theme` JSON:

```json
{
  "primaryColor": "#5f0002",
  "backgroundColor": "#fff9ed",
  "cardBackgroundColor": "#f6f1e6",
  "textColor": "#1d1d1d",
  "secondaryTextColor": "#707070",
  "fontDisplay": "Cormorant Garamond",
  "fontDisplayWeight": "400",
  "fontBody": "Josefin Sans",
  "brandName": "Beckons",
  "tagline": "A World that Calls to You"
}
```

> **Font substitution rationale:** Reckless (Displaay) is a paid typeface. Cormorant Garamond is the closest free Google Fonts equivalent — same high-contrast didone-adjacent serif feel, editorial weight. Josefin Sans matches the nav/label usage exactly (already identified on site).

---

## 11. Demo Script Hooks

Key narratives that map to Contentful demo capabilities:

| Pain Point | Beckons Evidence | Demo Angle |
|-----------|-----------------|------------|
| 9 lodges, inconsistent content | Each lodge has its own booking domain; no centralized CMS visible | Structured content model, one source of truth |
| Multi-market / multi-region | AU, NZ, CA, CL — different audiences, languages, regulations | Localization / environment per region |
| Brand rebrand complexity | Baillie Lodges + Tierra Hotels → Beckons 2023 | Content migration, brand governance |
| Seasonal content (green season, Christmas events) | Multiple seasonal blog posts, no obvious automation | Scheduled publishing, releases |
| Indigenous cultural content sensitivity | Ernabella Arts, First Nations Daintree — must be correct | Approval workflows, governance |
| Social proof at scale | Success stories, guest testimonials, Robb Report | Content collections, dynamic assembly |
| Trade/media gated assets | `/trade-media/` requires form fill to access | Audience segmentation, personalization |
| AEO / AI search readiness | No dedicated FAQ page — Q&A buried in blog posts | Structured FAQ content type → AEO demo |

---

*Scraped 2026-04-28. Re-scrape before demo if site has been updated.*
