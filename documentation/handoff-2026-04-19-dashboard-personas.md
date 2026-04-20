# Handoff — 2026-04-19 — Dashboard Personas + NT Personalization

**Worktree:** `/Users/casey.lisak/Dev/metafi-worktrees/feat-dashboard-personas`
**Branch:** `feat/dashboard-personas`
**PR:** caseyisak/metafi#68 — open, 7 commits ahead of main, needs Casey visual sign-off

---

## What was built

### Stream B — Dashboard + Personas (GH Issues #39 #38 #40 #41 #43)

A full 3-persona auth + personalization system across both the marketing site and dashboard.

**Persona system:**
- 3 personas defined in Contentful `settings` entry `2cgyEdELIF1EbwlLLdSZgR` under `loggedInMetadata.personas[]`
- Each persona has: `name`, `label`, `customerType`, `color`, `displayName` + all NT traits (`tier`, `email`, `industry`, `firstName`, `lastName`, `company_name`, `company_size`, etc.)
- Personas: A = Alex Demo (new-visitor, indigo), B = Blake Demo (returning, green), C = Kaz Demo (premium, amber)

**Auth UX:**
- Marketing nav: Login button (logged out) → PersonaDropdown with switcher + gear (logged in)
- Dashboard top bar: PersonaDropdown (always visible when logged in) + NT gear icon (always visible)
- Login dialog: opens in-context from both nav and gear icon click
- Cookie: `metafi-persona` (JSON), mirrored in localStorage

**NT personalization — auto-fires on login without preview panel:**
- `identify({ customerType })` deferred by `setTimeout(fn, 0)` to avoid useEffect ordering race with `LocalAudienceEvaluator`
- Persona B: "Welcome back to Metafi — Your Pro account gives you access to advanced analytics and priority billing support."
- Persona C: "Your Enterprise Dashboard — Full enterprise access enabled. Manage team accounts, SLA metrics, and premium services."
- Persona A: baseline — "Welcome to your Metafi dashboard — Manage your payments, billing, and account from one place."

**Contentful entries created this session:**
| Entry | Type | ID |
|-------|------|----|
| Persona C Logged In (audience) | `nt_audience` | `12LrPsg4qgmEPhjwOhYZcl` |
| Custom Dashboard Offers — Persona C (experience) | `nt_experience` | `7uNviDiapvlEAc0lQf8Its` |
| Dashboard — Header Banner (updated) | `banner` | `2x3tfzIwfBdabs1zgUOEtq` — now has 2 NT experiences |

---

## Key fixes committed

| Commit | Fix |
|--------|-----|
| `cc4000c` | `setTimeout(fn, 0)` deferred identify — fixes useEffect race with LocalAudienceEvaluator |
| `eac321b` | Identify via `useNinetailed()` hook (not `window.ninetailed`) + on page-load |
| `f22c79a` | `ntExperiencesCollection` threaded through DASHBOARD_SLOT_FIELDS → RawSlot → mapSlot → BannerFragment — NT Experience wrapper was silently skipped |
| `4a8b66d` | Per-persona displayName + unified PersonaDropdown in marketing nav + always-on gear icon |
| `6a656a7` | loggedInMetadata restructure — 3 flat personas, each with full NT traits |

---

## What the next session needs to do

### 1. Casey visual sign-off → merge PR #68 (FIRST)
Open worktree: `claude /Users/casey.lisak/Dev/metafi-worktrees/feat-dashboard-personas`
Dev server: `PORT=3005 bun run dev` (worktree already has clean .next from last restart)

Verify these 3 things manually:
- [ ] Login as Blake Demo → banner shows "Welcome back to Metafi" without touching NT panel
- [ ] Login as Kaz Demo → banner shows "Your Enterprise Dashboard" without touching NT panel
- [ ] Persona switcher works in marketing nav (`/page/home`) + dashboard top bar

Once confirmed: merge PR #68. Then close GH issues #39, #38, #40, #41, #43.

After merge, run `git pull` on main before starting Stream A, C, or D.

### 2. NT data bucket 409 error — contact NT support (async, non-blocking)
The Contentful Personalization app (`/apps/4QYnIIKna8TpXegJp3oSBi`) can't be connected to the Main data bucket because NT's backend has an orphaned connection record. Their API returns:
```
409: "Connection already exists for environment with id master and space with id uumzxfocy3ef 
in organization c40f8a1e-3f7b-4716-9e69-c34fd8fb323a"
```
...but `GET /connections/` returns empty. Classic orphaned record.

**Action:** Email `support@ninetailed.io`:
> "Getting a 409 ConflictError connecting Contentful space `uumzxfocy3ef` / environment `master` to the Main data bucket in NT org/client `c40f8a1e-3f7b-4716-9e69-c34fd8fb323a`. Connections list endpoint returns empty but POST returns 409. Please delete the orphaned connection so we can reconnect."

**Not blocking:** Personalization works fully without this. `LocalAudienceEvaluator` handles client-side evaluation. The data bucket is only needed for NT sidebar indicators and NT cloud analytics.

### 3. After PR #68 merges — remaining GH Issue Blitz streams

Per TASKS.md, next streams to run (can parallelize B+C after D):
- **Stream D** (`feat/model-cleanup`): #4 rename CTs, #42 FeatureItem fields — do first, unblocks A
- **Stream A** (`feat/marketing-blocks`): #56 CtaSection, #54 Pricing, #57 featureSection
- **Stream C** (`feat/rt-migration`): #52 audit + wire all CTs to RT fields

---

## Architecture reference

**NT personalization pipeline (how it works post-fix):**
```
User selects persona
  → setPersona() → localStorage + cookie
  → useNinetailed().identify('', { customerType })  [deferred 1 tick]
  → LocalAudienceEvaluator.onProfileChange fires
  → evaluates nt_rules against profile
  → previewPlugin.activateAudience(matchedAudienceId)
  → NT SDK's useSDKEvaluation evaluates <Experience> components
  → matching variant renders
```

**Key files:**
- `src/lib/persona-session.ts` — Persona type, get/set/clear with cookie + localStorage
- `src/components/layout/navbar.tsx` — PersonaDropdown + LoginButton in marketing nav
- `src/app/dashboard/_components/dashboard-top-bar.tsx` — PersonaDropdown + NtGearButton
- `src/app/login/persona-buttons.tsx` — login dialog persona selection UI
- `src/personalization/local-audience-evaluator.tsx` — client-side audience rule evaluator
- `src/services/contentful/queries.ts` — DASHBOARD_SLOT_FIELDS (includes ntExperiencesCollection for Banner)
- `src/services/contentful/dashboard-page.ts` — mapSlot (Banner branch includes ntExperiencesCollection)

**Contentful structure for dashboard personalization:**
- `dashboardPage` entry `2lFKQYJDoD3UbnuL1YJJ5j` (slug: `dashboard-home`)
  - `headerBlock` → `banner` `2x3tfzIwfBdabs1zgUOEtq` (has 2 NT experiences)
    - Experience B: `1eiWQGKTwz3YZk39QsCdle` → audience `7wY1J2xqS6MGhDMP2kbBMy` (customerType=returning) → variant `12rWfmaFk2pGRzn1y7mgTJ`
    - Experience C: `7uNviDiapvlEAc0lQf8Its` → audience `12LrPsg4qgmEPhjwOhYZcl` (customerType=premium) → variant `3kRWdO6FqlcpMX1pr7AlSE`

---

_Active until PR #68 merges. Archive to `documentation/archive/` after merge._
