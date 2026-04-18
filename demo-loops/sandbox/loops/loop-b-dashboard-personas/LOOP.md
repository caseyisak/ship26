---
id: loop-b-dashboard-personas
customer: sandbox
build_type: net-new
promotion_status: sandbox
personas:
  - VP of Digital / CX
  - Marketing Ops
  - Head of Personalization
  - Solutions Engineer (persona flip demo)
industries:
  - SaaS / Fintech
  - E-commerce
  - Financial Services
  - Any industry with distinct customer segments (new, returning, premium)
pain_signals:
  - "We want to show personalized dashboards per customer tier"
  - "Our portal looks the same for every user regardless of their plan"
  - "We can't show different content to new vs returning customers without dev work"
  - "We need a way to demo what the logged-in experience looks like for different personas"
  - "We want to personalize the authenticated experience, not just the marketing site"
contentful_features:
  - Personalization App (NT) — audience-based content swap in authenticated view
  - Live Preview — real-time field update in dashboard iframe
  - Structured content model — dashboardPage with 3 named content slots
  - JSON fields — dashboardSettings driving KPI metrics and chart data (simulates internal API)
content_types:
  - id: dashboardPage
    status: net-new
    note: Authenticated page with headerBlock / primaryBlock / secondaryBlock reference slots
  - id: dashboardSettings
    status: net-new
    note: Singleton entry — JSON fields for KPI metrics (metricCard1-4), charts (chart1-3), and persona labels (personaA/B/C)
  - id: banner
    status: existing
    note: Used for all 3 content slots — flexible enough to carry headline, copy, CTA per persona
components:
  - GenericDashboard (_layouts/generic-dashboard.tsx)
  - DashboardTopBar (_components/dashboard-top-bar.tsx)
  - KpiStatCard (_components/kpi-stat-card.tsx)
  - ContentPerformanceChart (_components/content-performance-chart.tsx)
  - UserEngagementChart (_components/user-engagement-chart.tsx)
  - PersonaButtons (app/login/persona-buttons.tsx)
setup_minutes: 5
---

**What this shows:** A logged-in dashboard that shows different content blocks per customer persona — new visitor, returning customer, premium user — without any code changes. Content editors swap what each persona sees directly in Contentful.

---

## Tell — Reflect Their Pain

"One of the most common gaps we hear: teams can personalize the marketing site, but the moment someone logs in, the experience goes flat. Every customer sees the same dashboard, the same upsells, the same welcome message — regardless of whether they're a day-one user or a 3-year subscriber.

What we built here shows how Contentful can power the authenticated experience the same way it powers marketing. You log in as a specific customer persona, and the dashboard content updates to match — the welcome message, the promotions, the calls to action. Your editors control it all from Contentful. Zero dev tickets."

---

## Show — Click Path

1. **[Browser]** Navigate to the marketing site: `http://localhost:3005/page/home`
   - Point out the **Login** button and gear icon in the top-right nav
   - *"From any page on the site, a customer can sign in."*

2. **[Browser]** Click **Login** → navigate to `http://localhost:3005/login`
   - Show the 3 persona options: **New Visitor**, **Returning Customer**, **Premium User**
   - *"For the demo, we've pre-seeded 3 persona types that map to real NT audience rules. In production, this is driven by your auth system."*

3. **[Browser]** Click **Sign in as Persona A (New Visitor)**
   - Dashboard loads at `http://localhost:3005/dashboard`
   - Point out: top bar shows **New Visitor** persona pill
   - Show: **Welcome banner** (headerBlock) — onboarding messaging
   - Show: **KPI cards** — Active Users, Content Published, Page Views, Conversion Rate (from Contentful JSON)
   - Show: **Content Performance chart** + **Primary block** side by side — persona-specific CTA/content
   - *"Every piece of this dashboard is editable in Contentful — the chart data simulates what comes from an internal API."*

4. **[Dashboard Top Bar]** Click the **New Visitor** persona dropdown
   - Switch to **Returning Customer**
   - *"In a real system this is driven by auth. In the demo, this button fires an NT identify() call — the exact same call your app would make on login."*
   - Point out the dashboard content updating

5. **[Dashboard Top Bar]** Switch to **Premium User**
   - Show different primary block content (premium-tier messaging)

6. **[Contentful]** Open the **Dashboard Primary Block (Persona A)** entry
   → `https://app.contentful.com/spaces/uumzxfocy3ef/environments/master/entries/1hgtv6idvoV8XCBlhKyTg1`
   - Show the `headlineRt`, `copy`, `ctaText` fields
   - *"This is the content your editor controls. Change the CTA, save — the dashboard updates instantly in Live Preview."*

7. **[Contentful]** Open the **Dashboard Settings** entry
   → `https://app.contentful.com/spaces/uumzxfocy3ef/environments/master/entries/w7B7KS5NndmSmUVJFFAuf`
   - Show the JSON fields: `metricCard1-4`, `chart1`, `chart2`
   - *"This is how we simulate data that normally comes from an internal API. In your integration, this JSON would be replaced by a real data source — but your content team can still control the narrative around it."*

8. **[Browser]** Click **Log Out** from persona dropdown → returns to `/page/home`
   - *"One clean entry point, one clean exit. The session is entirely controlled by Contentful + NT — no custom auth backend."*

---

## Tell — Tie to Outcomes

- **For VP Digital / CX:** "Your authenticated experience can speak differently to new signups vs power users vs enterprise accounts — without a separate app build per segment. Contentful becomes the system of record for all post-login content, the same way it powers your marketing site."

- **For Marketing Ops:** "Your editors can update what a Premium user sees on their dashboard the same way they update a homepage hero. No deployment. No staging environment. Just publish."

- **For SE / technical audience:** "The integration pattern is simple: on login, call `ninetailed.identify()` with the customer's traits from your auth token. NT matches the audience, Contentful serves the right content. The dashboard shell is the same for everyone — only the content slots change. That's the power of structured content."

**Urgency line:** *"Teams that hard-code the logged-in experience end up with a second CMS problem — the portal content lives in the codebase, not in Contentful. This loop shows how to avoid that from day one."*

---

## Persona Mapping

| Persona | Display Name | customerType trait | NT Audience | Env Var |
|---|---|---|---|---|
| A | New Visitor | `new-visitor` | Customer Type — New Visitor | `NEXT_PUBLIC_NT_AUDIENCE_NEW_VISITOR` |
| B | Returning Customer | `returning` | Customer Type — Returning | `NEXT_PUBLIC_NT_AUDIENCE_RETURNING` |
| C | Premium User | `premium` | Customer Type — Premium | `NEXT_PUBLIC_NT_AUDIENCE_PREMIUM` |

> Audience IDs: see `demo-loops/nt-audiences.md` → Default Sandbox (master env) table.
> Create audiences in NT app UI before wiring personalization to dashboard primaryBlock.

---

## Entry Reference

| Entry | Content Type | ID | Status | Preview URL |
|---|---|---|---|---|
| Dashboard Home | dashboardPage | `2lFKQYJDoD3UbnuL1YJJ5j` | published | `/dashboard` |
| Dashboard Settings — Default | dashboardSettings | `w7B7KS5NndmSmUVJFFAuf` | published | `/api/dashboard-settings` |
| Dashboard — Header Banner | banner | `2x3tfzIwfBdabs1zgUOEtq` | published | — |
| Dashboard — Primary Block (Persona A — New Visitor) | banner | `1hgtv6idvoV8XCBlhKyTg1` | published | — |
| Dashboard — Secondary Block (Account Summary) | banner | `2Q7F2MxpMtRfQ95kE0QZ70` | published | — |

---

## Reset Checklist

- [ ] Dev server running at `http://localhost:3005` from `feat-dashboard-personas` worktree (or merged to main — use main port)
- [ ] `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local` (enables gear icon NT panel in dashboard top bar)
- [ ] Logged-out state before starting — `/page/home` shows **Login** button, no persona pill
- [ ] `/login` shows 3 persona buttons: New Visitor, Returning Customer, Premium User
- [ ] `dashboardSettings` entry is published in Contentful master env
- [ ] `dashboard-home` dashboardPage entry is published with headerBlock, primaryBlock, secondaryBlock wired
- [ ] NT audiences created for all 3 customerType traits (see `demo-loops/nt-audiences.md`)
- [ ] `/dashboard` redirects to `/login` when no cookie present
