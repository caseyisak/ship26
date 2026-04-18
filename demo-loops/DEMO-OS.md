# Demo-OS — Metafi Sandbox Index

**Version:** 2.1 | **Last updated:** 2026-04-03 | **Maintained by:** CC on merge, SE on promotion status changes

This file is passed to the Glean Demo-OS agent. It answers: *what can the metafi sandbox demonstrate, and which demo moments are relevant for a given opportunity?*

Glean uses this file to:
1. Rank existing loops against a customer opportunity
2. Identify gaps where net-new work is needed
3. Understand what Contentful can do natively (OOTB) vs what requires custom build
4. Track what's ready to demo today vs what's queued for main sandbox

---

## How to use this file

**Pre-call planning:** Match customer pain signals in the loops table against call transcript language. Rank loops by relevance. Check `build_type` to understand setup cost.

**Gap identification:** If no loop covers the use case, check the OOTB features table first. If OOTB doesn't cover it, flag for net-new build — CC will scope and implement.

**Promotion tracking:** When a loop lands well, update `promotion_status` from `demo-only` to `candidate`. CC files a GH issue and builds it into the main sandbox for the next DEMO-OS version.

---

## Multi-Channel Story (Cross-Demo)

The sandbox can demonstrate a **full content lifecycle across channels** by combining loops from Bears and Punchbowl:

```
One story → Newsletter (Punchbowl L1) → Site article (Punchbowl L4) → Social cards (Bears LA) → Mobile app (Bears LB)
```

This is the most powerful demo for media, publishing, and brand teams with multi-channel distribution pain. Run bears + punchbowl loops back-to-back or pick the channels most relevant to the prospect.

---

## Metafi Sandbox — Capability Inventory

### What the sandbox is

A Next.js / TypeScript / Contentful demo site. It demonstrates Contentful as a structured content platform — not a blog CMS. The core story is: **one content model drives multiple surfaces, roles, and personas simultaneously.**

Current surfaces: web homepage, email newsletter preview (Gmail-style), mobile app preview shell, social card previews (X, Instagram, Facebook), Contentful live preview (iframe with real-time edits).

---

### OOTB Contentful Features Available to Demo (no build required)

| Feature | What it shows | Best used when customer mentions |
|---|---|---|
| **Live Preview** | Edit a field in Contentful, see it update in real-time in the site iframe | "We have to publish to see changes", "QA is slow", "editors can't see impact of their edits" |
| **Releases** | Bundle multiple entries across types into a single scheduled publish | "We release everything at once for a campaign", "approvals are scattered across tools", "we need a go-live checklist" |
| **Workflows** | Built-in approval states (draft → review → approved) without custom status fields | "We have a broken approval process", "things go out without sign-off", "we lost track of who approved what" |
| **Scheduled Publishing** | Set a publish date/time on any entry | "We publish manually at midnight", "someone has to be on-call for launches" |
| **Content Tagging** | Tag entries across types, filter by tag in the UI | "We can't find content across campaigns", "we have no way to group related assets" |
| **Rich Text + Embedded Entries** | Structured long-form with embedded components (article cards, banners, section blocks) | "Our content is locked in a CMS that mixes markup and content", "editors can't control layout" |
| **Localization** | Same entry, multiple locales | "We manage 8 regional sites", "translation is a copy-paste nightmare" |
| **Content Model UI** | Show the visual content model diagram | "How do we model this?", "what does the data structure look like?" |
| **Media Library + Asset Transformations** | CDN-delivered images with format/resize params | "We have no DAM", "we re-export the same image at different sizes for every channel" |
| **Personalization App (NT)** | Audience-based content swapping without dev involvement | "We want to personalize but we don't have dev bandwidth", "one-size-fits-all homepage" |

---

### Sandbox-Built Components (require demo branch setup)

| Component | Content Type | What it shows | Status |
|---|---|---|---|
| Banner | `banner` | Full-width/container/slim/large-callout variants, colorVariant (light/dark/primary/secondary/alt), sectionStyle overrides, NT personalization | candidate |
| Hero | `hero` | Headline/subhead/CTA/media, sectionStyle override, live preview, NT personalization | candidate |
| Two Across | `twoAcross` | Side-by-side media + copy block, left/right mediaPosition, colorVariant, animation dropdown on items | candidate |
| Cards Wrapper | `features` | Feature cards grid with images or animations, mediaPosition top/bottom, animationKey per card | sandbox |
| FAQ | `faq` | Expandable FAQ section, NT personalization | sandbox |
| Tabbed Content | `tabbedcontent` | Image + tabbed content sections, NT personalization | sandbox |
| Data Viz | `dataViz` | CSV-driven charts (bar, treemap, bubble, radar, funnel), NT personalization | sandbox |
| Newsletter | `newsletter` | Gmail-style email chrome preview, RichText body with embedded article cards + section blocks, leadStory + promoSlot reference slots, live preview | candidate |
| Newsletter Split Preview | `newsletter` | Dual-pane: email view (left) + site article (right), live edit updates both | candidate |
| Social Card Preview | `socialPost` | Pixel-accurate X, Instagram, Facebook card previews | candidate |
| Mobile App Preview | `banner` | App chrome with banner as native card, device selector (5 devices), live updates | demo-only (bears) |
| Blog/News Grid | `blogPost` | Card grid with image, excerpt, tags, date, author | candidate |
| CMS-Driven Nav + Footer | `nav`, `footer`, `navLink` | Nav links and footer columns managed from Contentful — no code change per demo | candidate |
| Settings + Login Modal | `settings` | Site logo, brand colors (CSS vars from theme JSON), NT trait injection on sign-in, cornerStyle → border-radius | candidate |
| CTA Section | `ctaSection` | Full-width CTA block, colorVariant (6 options incl. background image), dual CTAs, dot-pattern overlay, NT personalization | candidate |
| Pricing Section | `pricingSection` | Plan tier cards with monthly/yearly toggle, highlight card, feature checklist, NT merge tags per feature bullet | candidate |

---

### Content Types in the Sandbox

| Content Type ID | Display Name | Purpose | Status |
|---|---|---|---|
| `page` | Page | Root page with sections array | sandbox |
| `hero` | Hero | Landing page hero section, NT experiences | sandbox |
| `banner` | Banner | Promo/hero banner, multi-surface, colorVariant | candidate |
| `twoAcross` | Two Across | Side-by-side media + copy, colorVariant | candidate |
| `features` | Cards Wrapper | Feature/news card grids | sandbox |
| `featureItem` | Card | Individual feature card, animationKey | sandbox |
| `newsletter` | Newsletter | Email issue: title, sender, subjectLine, date, teaser, slug, leadStory, promoSlot, content RichText | candidate |
| `blogPost` | Article / Blog Post | Article with heroImage, body, excerpt, tags, author, publishDate | candidate |
| `faq` | FAQ | FAQ section with faqitem children, NT experiences | sandbox |
| `faqitem` | FAQ Item | Individual Q&A | sandbox |
| `tabbedcontent` | Tabbed Content | Tabbed section with image, NT experiences | sandbox |
| `dataViz` | Data Viz | CSV-driven chart block, NT experiences | sandbox |
| `mediaWrapper` | Media Wrapper | Asset + channel/aspect ratio metadata | candidate |
| `settings` | Settings | Singleton: nav ref, footer ref, theme JSON, loggedInMetadata, cornerStyle | candidate |
| `nav` | Nav | Site navigation with logo + navLink references | candidate |
| `footer` | Footer | Site footer with navLink references | candidate |
| `navLink` | Nav Link | Label + URL or page reference | candidate |
| `socialPost` | Social Post | Channel-specific social post with copy, hashtags, media | candidate |
| `ctaSection` | CTA Section | Full-width CTA with colorVariant, backgroundImage, dual CTAs, sectionStyle, NT experiences | candidate |
| `pricingSection` | Pricing Section | Pricing tier section — headline, plan cards, colorVariant, sectionStyle, NT experiences | candidate |
| `pricingPlan` | Pricing Plan | Individual plan card — name, price (monthly/annual), blurb, features, CTA, isHighlighted, badge | candidate |
| `pricingPlanFeature` | Pricing Plan Feature | Single feature bullet with RichText label — supports NT merge tags | candidate |
| `game` | Game | Sports matchup: opponent, week, kickoff, home/away | demo-only (bears) |
| `nt_experience` | NT Experience | Ninetailed personalization experience | sandbox |
| `nt_audience` | NT Audience | Ninetailed audience with rules | sandbox |

---

## Demo Loop Library

### Sandbox Loops — Generic (all verticals)

Industry: Any | Personas: VP Digital, Marketing Ops, SE

| Loop | One-line | Build type | Personas | Promotion | Complexity |
|---|---|---|---|---|---|
| [Loop A — Pricing Merge Tags](#sandbox-loop-a) | One feature bullet updates with prospect's industry/company name via NT merge tag — no duplicate entries | net-new | VP digital, marketing ops, SE | candidate | Low |
| [Loop B — Dashboard Personas](#sandbox-loop-b) | Log in as any of 3 customer tiers — dashboard content slots swap per persona with zero dev work | net-new | VP digital/CX, marketing ops, head of personalization, SE | sandbox | Medium |

---

### Sandbox Loop A — Pricing Merge Tags {#sandbox-loop-a}

**Pain signals:** "We have enterprise and SMB customers but they see the same pricing page", "Personalization requires a developer for us", "We'd have to build a separate landing page per segment"

**What it shows:** NT merge tags in a `pricingPlanFeature` RichText field resolve to prospect-specific copy (industry, company name, tier) at runtime. One entry serves all audiences — no new entries per segment, no developer involvement.

**Key demo moment:** Switch persona in NT panel → feature bullet instantly reads "Priority support for Healthcare compliance teams" → open the Contentful entry and show the merge tag: `{{ profile.traits.industry }}` → *"The content editor set this up once."*

**Content types:** `pricingSection`, `pricingPlan`, `pricingPlanFeature`, `nt_experience`, `nt_audience` | **OOTB:** Personalization App (NT), Live Preview

**Loop file:** `demo-loops/sandbox/loops/loop-a-pricing-merge-tags/LOOP.md`

---

### Sandbox Loop B — Dashboard Personas {#sandbox-loop-b}

**Pain signals:** "We want to show personalized dashboards per customer tier", "Our portal looks the same for every user regardless of their plan", "We can't show different content to new vs returning customers without dev work", "We need a way to demo what the logged-in experience looks like for different personas"

**What it shows:** A logged-in dashboard with 3 content slots (headerBlock, primaryBlock, secondaryBlock) that swap per customer persona — New Visitor, Returning Customer, Premium User — using NT audience targeting. KPI cards and chart data are driven by a `dashboardSettings` JSON entry that simulates an internal API. Content editors control all post-login content from Contentful.

**Key demo moment:** Switch persona in dashboard top bar → NT `identify()` fires → content slots update instantly → open `dashboardSettings` JSON entry → *"This is what normally comes from an internal API. Your team controls the narrative around it."*

**Persona mapping:**

| Persona | Display Name | customerType trait | NT Audience |
|---|---|---|---|
| A | New Visitor | `new-visitor` | Customer Type — New Visitor |
| B | Returning Customer | `returning` | Customer Type — Returning |
| C | Premium User | `premium` | Customer Type — Premium |

**Content types:** `dashboardPage`, `dashboardSettings`, `banner` | **OOTB:** Personalization App (NT), Live Preview

**Loop file:** `demo-loops/sandbox/loops/loop-b-dashboard-personas/LOOP.md`

---

### Bears Demo — Chicago Bears (2026 season)

Industry: Sports / Media & Entertainment | Personas: VP Digital, Social Brand Manager, Web Designer

| Loop | One-line | Build type | Personas | Promotion | Complexity |
|---|---|---|---|---|---|
| [Loop A — One Game, All Channels](#bears-loop-a) | One game entry seeds web banner, app, and 3 social posts across X/IG/FB | net-new | Social manager, digital ops | candidate | Medium |
| [Loop B — One Entry, Two Surfaces](#bears-loop-b) | Banner entry renders identically on web and mobile app shell | sandbox | Web designer, digital ops | candidate | Low |
| [Loop C — Approval Workflow + Release](#bears-loop-c) | Workflow states + Releases bundle all Week 1 content into one go-live | ootb | VP digital, social manager | candidate | Low |
| [Loop D — Personalized Banner](#bears-loop-d) | Login fires NT identify → banner swaps to season ticket member variant | net-new | VP digital, personalization buyer | candidate | High |

---

### Bears Loop A — One Game, All Channels {#bears-loop-a}

**Pain signals:** "We copy-paste the same info into every platform", "Our social team re-exports the same image at three different sizes", "Consistency across channels is a constant problem"

**What it shows:** One `game` entry seeds a `banner`, a `mediaWrapper`, and 3 `socialPost` entries. Change kickoff time once — everything downstream stays consistent.

**Key demo moment:** MediaWrapper → show `channels[]` + `aspectRatios[]` → "One CDN URL, three crops. No shared drive hunting."

**Content types:** `game`, `banner`, `mediaWrapper`, `socialPost` | **OOTB:** Media Library, Live Preview

---

### Bears Loop B — One Entry, Two Surfaces {#bears-loop-b}

**Pain signals:** "When the banner changes on the site, someone has to manually update the app", "We're building more surfaces but our content workflow doesn't scale"

**What it shows:** `banner` entry renders on web as full-width hero AND on mobile app preview as a native card. One edit, both surfaces update.

**Key demo moment:** `/preview/banner/[entryId]` → device selector → live edit headline → watch phone frame update in real-time.

**Content types:** `banner`, `game` | **OOTB:** Live Preview

---

### Bears Loop C — Approval Workflow + Release {#bears-loop-c}

**Pain signals:** "We have no visibility into what's been approved", "Things go out without proper sign-off", "Legal asks us what went out and we can't answer quickly"

**What it shows:** Three social posts in three workflow states. Advance draft → approved. Open Releases — show "Week 1 vs Rams" bundling all content. 4/5 approved, approve last → publish Release → everything goes live simultaneously.

**Content types:** `socialPost`, `banner` | **OOTB:** Workflows, Releases, Scheduled Publishing

---

### Bears Loop D — Personalized Banner {#bears-loop-d}

**Pain signals:** "Our homepage is one-size-fits-all", "Logged-in users see the same thing as anonymous visitors", "We tried personalization before but it required a full engineering project"

**What it shows:** Anonymous homepage → Login → NT identify fires → banner swaps to season ticket member variant. Open `nt_experience` in Contentful — show baseline, variant, audience rule. Edit variant headline → save → preview updates instantly.

**Key demo moment:** "You begin with logged-in vs anonymous, then layer in membership tier or campaign context. One audience, one variant — that's the entire setup."

**Content types:** `banner`, `nt_experience`, `nt_audience`, `settings` | **OOTB:** Personalization app, Live Preview

---

### Punchbowl News Demo — Political Newsletter (2026)

Industry: Media & Publishing / Political News | Personas: MT (product), Kalyn (PM / ex-producer), Robert (editor/producer)

| Loop | One-line | Build type | Personas | Promotion | Complexity |
|---|---|---|---|---|---|
| [Loop 1 — Newsletter Source of Truth](#punchbowl-loop-1) | Create newsletter issue once — subject, edition, sections, ad slot all in one structured entry | net-new | Producer, PM | candidate | Medium |
| [Loop 2 — Live Preview: Email + Site](#punchbowl-loop-2) | Same entry renders as Gmail-style email preview (left) and site article (right) simultaneously | net-new | Producer, PM | candidate | Medium |
| [Loop 3 — Workflow + Approvals](#punchbowl-loop-3) | Draft → In Review → Ready for Send states + Releases bundle all editions into coordinated publish | ootb | PM, product | candidate | Low |
| [Loop 4 — Reuse Across Channels](#punchbowl-loop-4) | One article referenced in newsletter body, site, and homepage card — update once, reflected everywhere | sandbox | PM, product | candidate | Low |

---

### Punchbowl Loop 1 — Newsletter as Single Source of Truth {#punchbowl-loop-1}

**Pain signals:** "Every newsletter means Google Doc → WordPress → ESP → site article", "3 newsletters a day, 30–45 min each, mostly copy-paste", "Any change means hunting down all the copies", "Errors creep in on the 5am send"

**What it shows:** A `newsletter` entry is the complete structured object — edition type (AM/Midday/PM/Sunday), subject line, preheader, lead story reference, rich text body with embedded article cards, promo slot, and ad slot. Producers fill out one form in Contentful. Nothing gets copy-pasted.

**Key demo moment:** Show `leadStory` reference field → "This links to the actual article entry. If the headline changes there, it changes here. No second copy."

**Content types:** `newsletter`, `blogPost` (as article) | **OOTB:** Live Preview, Content References

---

### Punchbowl Loop 2 — Live Preview: Email + Site {#punchbowl-loop-2}

**Pain signals:** "We only see if the layout is broken after it's too late", "The 5am send is the riskiest moment", "Formatting breaks on import to the ESP", "We want to see what a subscriber sees before we send"

**What it shows:** `/preview/newsletter/[entryId]` — split pane: left shows Gmail-style email chrome rendering (subject header, preheader bar, lead story hero, article body, embedded section blocks, ad banner), right shows the same content as a site article. Edit in Contentful → both panes update live.

**Key demo moment:** Edit headline → both panes update. "Same edit, both surfaces. No second copy to track down."

**ESP urgency hook:** "Your ESP contract is up in June. The preview on the right just points to a new email template. The content model doesn't change — your producers don't relearn anything."

**Content types:** `newsletter`, `blogPost` | **OOTB:** Live Preview

---

### Punchbowl Loop 3 — Workflow + Approvals {#punchbowl-loop-3}

**Pain signals:** "Quality control relies on 'don't touch that block' and Google Doc version history", "Adding more verticals and producers is going to get brittle", "We have no approval visibility", "Ad inventory and editorial copy have to stay separate"

**What it shows:** Three newsletter issues in different workflow states (Draft / In Review / Ready for Send). Advance one through states. Open Releases — "April 10 Editions" bundles all three. Status column: 3/3 Ready for Send → schedule publish → everything goes out simultaneously. Producer role vs Editor role vs Ad Ops role separation.

**Key demo moment:** "If anyone asks what went out and who approved it, you answer in seconds. It's in the entry history."

**Content types:** `newsletter` | **OOTB:** Workflows, Releases, Scheduled Publishing

---

### Punchbowl Loop 4 — Reuse Across Channels {#punchbowl-loop-4}

**Pain signals:** "Once the newsletter goes out, producers burn another 30–45 min turning stories into site articles", "The same story exists three times in three different tools", "We want to experiment with premium alerts but don't want to recreate content"

**What it shows:** One `blogPost` article entry is referenced as: (1) the lead story in a newsletter issue, (2) a standalone site article at `/blog/[slug]`, (3) a card on the homepage. Open References in Contentful — show all three. Edit the headline → save → update visible on all three surfaces.

**Key demo moment:** "This 30–45 minutes per newsletter — you get it back. Write once, structured. It flows everywhere."

**Content types:** `blogPost`, `newsletter`, `page` (homepage) | **OOTB:** Content References, Live Preview

---

### WOW Internet Demo — ISP Personalization (2026)

Industry: Telecommunications / Cable & ISP | Personas: Marketing Manager, Digital VP, CMO, VP Customer Experience, Head of Retention

| Loop | One-line | Build type | Personas | Promotion | Complexity |
|---|---|---|---|---|---|
| [Loop 1 — Acquisition Homepage](#wow-loop-1) | Browse the fiber page → return to homepage → hero and banner swap to fiber context with no login required | net-new | Marketing manager, digital VP | demo-only | Medium |
| [Loop 2 — Logged-In Dashboard NBO](#wow-loop-2) | Login as a specific persona → dashboard hero + NBO tiles immediately reflect account context (speed tier, TV eligibility, autopay status) | net-new | Digital VP, VP CX | demo-only | Medium |
| [Loop 3 — Retention Save Offer](#wow-loop-3) | At-risk customer logs in → proactive loyalty offer appears in the dashboard hero slot before they call to cancel | net-new | VP CX, Head of Retention | demo-only | Medium |

---

### WOW Loop 1 — Acquisition Homepage {#wow-loop-1}

**Pain signals:** "Our homepage shows the same thing to every visitor", "We can't personalize without a dev deploy", "We're running campaigns for fiber and TV but they all land on the same page", "We need to react to what someone looked at before they got to the homepage"

**What it shows:** A visitor browses the Fiber Internet page. When they return to the homepage, the hero and banner have already updated to reflect their interest — with no login, no cookie prompt, no backend change. Change the subject to YouTube TV: same pattern, different variant.

**Key demo moment:** NT overlay ⚙️ → show "fiber-interest" audience matched → open Hero entry → Ninetailed tab → 2 experiences linked, no code. "Marketing makes the call. IT is not in the loop."

**Content types:** `hero`, `banner`, `features`, `page`, `nt_experience`, `nt_audience` | **OOTB:** Ninetailed Personalization, Live Preview

---

### WOW Loop 2 — Logged-In Dashboard NBO {#wow-loop-2}

**Pain signals:** "Our logged-in portal is generic — everyone sees the same dashboard", "We have upsell offers but marketing can't get them into the app without a sprint", "Our promotional slots should be content-driven, not hardcoded strings", "We need to show the right NBO to the right customer without involving dev"

**What it shows:** A customer logs in and the dashboard immediately reflects their account context. A 300 Mbps customer sees a speed upgrade offer. A TV-eligible customer sees a YouTube TV bundle. The NBO tiles in the dashboard are Contentful `banner` entries — personalized by NT based on traits passed at login. The app chrome stays yours; only the promotional slots are content-driven.

**Key demo moment:** Open **WOW Settings** entry → show `dashboardHeroEntryId` + `dashboardNboTileIds` fields. "These two fields are the only coupling between your app and Contentful. Swap an entry ID, the entire experience changes — no deploy."

**Content types:** `hero`, `banner`, `settings`, `nt_experience`, `nt_audience` | **OOTB:** Ninetailed Personalization

---

### WOW Loop 3 — Retention Save Offer {#wow-loop-3}

**Pain signals:** "By the time we identify at-risk customers, they've already called to cancel", "We have save offers but they're buried in the call center script", "We can't surface a loyalty offer in the portal without a dev cycle", "Our churn rate is improving but our digital channel doesn't reflect our retention strategy"

**What it shows:** An at-risk customer logs in and immediately sees a proactive loyalty save offer in their dashboard — a specific "We value your loyalty" message with a real dollar amount, served by Contentful, triggered by a CRM trait, with no dev involvement. The retention team controls the headline, the dollar figure, and the urgency framing. When the offer expires, they swap it in 2 minutes.

**Key demo moment:** Show NT audience "Logged In — At Risk" — the rule is `isLoggedIn: true AND at_risk: true`. "This is a data contract between your CRM and Contentful. Your system passes the trait on login. Ninetailed matches it. The editor owns the message."

**Content types:** `hero`, `nt_experience`, `nt_audience`, `settings` | **OOTB:** Ninetailed Personalization

---

### CARD Demo — Healthcare Content Governance (2026-04-03)

Industry: Healthcare / Behavioral Health / ABA Therapy | Personas: Clinical Content Manager, Compliance Officer, VP Operations

| Loop | One-line | Build type | Personas | Promotion | Complexity |
|---|---|---|---|---|---|
| [Loop 1 — Structured Content Governance](#card-loop-1) | FAQ sections tagged by care stage (Welcome/Onboarding/Treatment) via faqMetadata wrapper — compliance reviewers audit by workflowStep, not by reading every entry | net-new | Content manager, compliance officer | candidate | Low |

---

### CARD Loop 1 — Structured Content Governance {#card-loop-1}

**Pain signals:** "Compliance reviewers can't tell what's been audited without reading every entry", "Our clinical and marketing content has no governance structure", "We want to tag content by care stage but our CMS doesn't have the structure for it", "Content governance lives in a policy doc, not in the system"

**What it shows:** Three patient-facing FAQ sections — Scheduling (Welcome stage), New Patient Intake (Onboarding stage), Progress Tracking (Treatment stage) — each linked to a `faqMetadata` entry carrying workflowStep classification, keyword synonyms, searchable flag, and compliance reviewer contextNotes. Governance is in the data model, not a spreadsheet.

**Key demo moment:** Open faqMetadata → show `workflowStep = Treatment`, `searchable = true`, `contextNotes` with reviewer guidance. "A compliance auditor can filter all Treatment-stage searchable content in one query. No spreadsheet required."

**Content types:** `faq`, `faqMetadata`, `faqitem` | **OOTB:** Content modeling, Workflows, Entry references

---

## Promotion Pipeline

| Item | Type | Status | GH Issue |
|---|---|---|---|
| Banner component + CT (colorVariant, layout variants) | component + CT | candidate | #17 |
| TwoAcross component + CT | component + CT | candidate | #18 |
| Newsletter component + CT | component + CT | candidate | #19 |
| Newsletter split preview route | component + route | candidate | #20 |
| CMS-driven nav + footer CTs | CT + component | candidate | #21 |
| Settings CT (theme JSON, cornerStyle, nav/footer refs) | CT + service | candidate | #22 |
| blogPost route + service (article pattern) | route + service | candidate | #23 |
| Prospect content scraping agent pattern | process | candidate | #24 |
| Feature cards animationKey dropdown | CT field | candidate | #25 |
| NT polyfill (crypto.randomUUID for HTTP) | code fix | candidate | #26 |
| RichText embedded entry union type pattern | code fix | candidate | #27 |
| Social Card Preview | component | candidate | — (from bears, not yet filed) |
| MediaWrapper CT | CT | candidate | — (from bears, not yet filed) |
| `game` CT | CT | demo-only | — (sports-domain only) |
| Mock mobile app UI | component | demo-only | — (bears-specific chrome) |
| `socialPost` CT | CT | demo-only | — (promote when building social workflow loop for main) |
| WOW NT homepage personalization (PageTracker + identify) | code + NT pattern | demo-only | — (wow env only) |
| `faqMetadata` CT + faq governance pattern | CT + pattern | candidate | — (from CARD; applicable to any multi-stage content journey) |

---

## Demo Build Process Notes

### Homepage Strategy

**Do not use metafi's default content types for a prospect homepage.** The baseline homepage uses metafi's own marketing content types (careers, pricing, integrations, etc.) which are irrelevant to prospects.

**The right approach:**
1. Look at the prospect's actual homepage structure
2. Identify what sections map to demo loops (hero, featured content, CTAs, etc.)
3. Build those sections using relevant CTs — `blogPost` for a news grid, `newsletter` for an issue feed, `twoAcross` for a feature highlight
4. The homepage should feel like *their* site demonstrating Contentful, not a generic sandbox

### Prospect Content Scraping Agent

Real copy and images make the demo land. Generic Lorem Ipsum and Unsplash stock photos undermine credibility with media/publishing prospects who know what their content looks like.

**Required step for every demo build — run before entering Contentful:**

1. **Scrape the prospect's site** — pull real headlines, article excerpts, image CDN URLs
2. **Map to CT fields** — match scraped content to the exact field IDs (title, excerpt, heroImage URL, etc.)
3. **Upload to Contentful** — upload images as assets, use real copy in entries
4. **Source:** use the prospect's CDN images directly or upload to Contentful assets. Do not use Unsplash (often 403 on WebFetch).

This was a blocking gap in the Punchbowl build — the main build agent couldn't do scraping inline. **Spin a dedicated scraping agent** with WebFetch + Contentful MCP access, give it the CT field map and the prospect URL, let it run in parallel while other build work continues.

Agent prompt template: `MEMORY/PIPELINE/[opp]/scraping-agent-brief.md`

### Multi-Channel Demo Selection Guide

| Prospect type | Recommended loops |
|---|---|
| Political / newsletter publisher | Punchbowl L1 + L2 + L3 + L4 |
| Sports / media / entertainment | Bears LA + LB + LC + LD |
| Brand with social + web presence | Bears LA + LC + Punchbowl L4 |
| Publisher wanting full lifecycle | Bears LB (mobile) + Punchbowl L1 (newsletter) + Bears LA (social) |
| Anyone asking about personalization | WOW L1 + L2 or Bears LD |
| ISP / telecom / subscription product | WOW L1 + L2 + L3 (acquisition → active → retention arc) |
| Anyone asking about logged-in / portal personalization | WOW L2 + L3 |
| Anyone asking about retention / churn | WOW L3 |
| Anyone asking about workflow/approvals | Bears LC or Punchbowl L3 (or both) |
| Healthcare / compliance-heavy org | CARD L1 |
| Any org with multi-stage content journeys (onboarding, CS, legal) | CARD L1 (faqMetadata governance pattern) |

---

## What's NOT in the sandbox yet (known gaps)

| Gap | What a customer would ask for | Suggested approach |
|---|---|---|
| Multi-locale demo | "We run 12 markets" | Use OOTB localization — no build needed |
| Content modeling workshop | "Walk me through how you'd model our content" | Use OOTB content model diagram — no build needed |
| Headless e-commerce | "We have products and categories" | Net-new — scope per opp |
| Paywall / subscriber gating | "Show me how subscriber vs free reader sees different content" | NT personalization (OOTB) + login modal (Settings CT) — no new build |
| Push notifications | "We want to send breaking news alerts" | Narrate as an extension of the newsletter/article CT — no build needed |
| Social copy buttons | "Copy the text for each platform" | GH Issue (from bears) — not yet built |

---

*To add a loop: create a LOOP.md in `demo-loops/[customer-slug]/loops/[loop-name]/` following `_schema.md`, then add one row to the loop table above.*
