---
id: loop-1-content-governance-faq
customer: card
build_type: net-new
promotion_status: candidate
personas:
  - Head of Content / Clinical Content Manager
  - Compliance Officer
  - VP Operations
industries:
  - Healthcare
  - Behavioral Health / ABA Therapy
pain_signals:
  - "We have compliance reviewers who need to audit content but can't tell what's been reviewed and what hasn't"
  - "Our clinical and marketing content gets mixed together and there's no governance structure"
  - "We want to tag content by care stage but our CMS doesn't have the structure for it"
  - "We have to manually track which FAQs are approved for patient-facing use"
  - "Content governance is a policy document, not enforced in the system"
contentful_features:
  - Content modeling (faqMetadata as a structured governance wrapper)
  - Native content tags (tag:card for scoping)
  - Entry references (faq → faqMetadata link)
  - Live Preview
  - Workflows (draft → in review → approved states on FAQ entries)
content_types:
  - id: faq
    status: existing
    note: 3 patient-facing FAQ sections, each tagged `card` and linked to a faqMetadata entry
  - id: faqMetadata
    status: net-new
    note: Governance wrapper — workflowStep (Welcome/Onboarding/Treatment), keywordSynonyms, searchable flag, contextNotes RichText
  - id: faqitem
    status: existing
    note: Individual Q&A items within each FAQ section
components:
  - FAQ (cms-components/faq/faq.tsx)
  - Live preview route for FAQ entries
setup_minutes: 5
---

**What this shows:** Three patient-facing FAQ sections organized by care journey stage (Welcome → Onboarding → Treatment). Each FAQ has a `faqMetadata` child entry that functions as a structured governance wrapper — carrying workflowStep classification, keyword synonyms for search, a searchable flag, and rich text contextNotes for compliance reviewers. Content governance is enforced in the data model, not in a policy doc.

---

## Tell — Reflect Their Pain

Healthcare content teams face a structural problem: the people who write content and the people who govern it are different roles, operating in different systems. Your clinical content manager knows which FAQ belongs at the Welcome stage versus the Treatment stage. But that knowledge lives in their head — or in a spreadsheet. When a compliance auditor asks "what content is currently approved for Treatment-stage patients?", someone has to read every entry manually.

Contentful solves this by putting governance metadata inside the content model itself. The `faqMetadata` entry is not a tag or a label — it's a linked structured object that says: this content is for the Welcome stage, it handles these search terms, this is how a reviewer should interpret it. That structure is queryable, auditable, and visible to every role without opening a spreadsheet.

---

## Show — Click Path

1. [Browser] Open `http://localhost:3000/page/home` — scroll to the FAQ section
2. [Contentful] Open **Scheduling Your Appointments** (FAQ entry `5cGI4pBHZ0OWNsgdaEtqxq`) → show the entry fields: title, description, items references
3. [Contentful] Click into the `faqMetadata` reference → **Scheduling Help Metadata** (`3MzOCo4FUW24Kux2hDOSjs`)
4. [Contentful] Point out: `workflowStep = Welcome`, `keywordSynonyms = schedule, booking, reschedule, appointment`, `searchable = true`, `contextNotes = "Use this metadata for FAQs that help users book, change, or confirm appointments."`
5. [Contentful] Navigate to **Homepage FAQ** (`1AY2HHjnjj2dZWJWsqybxA`) → open its faqMetadata → **New Patient Intake Metadata** (`X2NTOtZDCZkFRqxI3s03E`) → `workflowStep = Onboarding`
6. [Contentful] Navigate to **Tracking Your Child's Progress** (`145P4t8UE5MuF6iGCuD5HC`) → open its faqMetadata → **Progress Tracking Metadata** (`ovNLAtcz9HaxyhVpH19mT`) → `workflowStep = Treatment`
7. [Contentful] "If a compliance reviewer asks 'show me all Treatment-stage content that's currently searchable' — that's a single filter query. No spreadsheet."
8. [Contentful] Edit the `contextNotes` field on any faqMetadata entry → save → show live preview updates
9. [Browser] Live preview: `/preview/faq/[entryId]` — show contextNotes change doesn't alter patient-visible copy; it only updates governance context

---

## Tell — Tie to Outcomes

- **Governance is in the model, not in policy.** Every FAQ entry carries its stage classification, keyword scope, and compliance context as structured fields — queryable by role, visible to auditors, enforceable without process overhead.
- **Roles stay separated.** Clinical writers touch FAQ content. Compliance reviewers touch faqMetadata. No single editor has to do both. Content model enforces the separation.
- **HIPAA-adjacent readiness.** Structured content means nothing sensitive is buried in unstructured long text. Every field is typed, every entry is versioned, every change is logged. Audit trail is native.
- **Scales with the org.** Add a new care stage (e.g., "Discharge") by adding a workflowStep value. Existing content model accommodates it without a schema change.

---

## Entry Reference

All entries are in the **master** environment (space: `uumzxfocy3ef`). All entries tagged `card`.

| Entry | Content Type | ID | workflowStep | Preview URL |
|---|---|---|---|---|
| Scheduling Your Appointments | faq | `5cGI4pBHZ0OWNsgdaEtqxq` | — | `http://localhost:3000/preview/faq/5cGI4pBHZ0OWNsgdaEtqxq` |
| Scheduling Help Metadata | faqMetadata | `3MzOCo4FUW24Kux2hDOSjs` | Welcome | — |
| Homepage FAQ (New Patient Intake) | faq | `1AY2HHjnjj2dZWJWsqybxA` | — | `http://localhost:3000/preview/faq/1AY2HHjnjj2dZWJWsqybxA` |
| New Patient Intake Metadata | faqMetadata | `X2NTOtZDCZkFRqxI3s03E` | Onboarding | — |
| Tracking Your Child's Progress | faq | `145P4t8UE5MuF6iGCuD5HC` | — | `http://localhost:3000/preview/faq/145P4t8UE5MuF6iGCuD5HC` |
| Progress Tracking Metadata | faqMetadata | `ovNLAtcz9HaxyhVpH19mT` | Treatment | — |

### faqMetadata field reference

| Field | Type | Purpose |
|---|---|---|
| `workflowStep` | Symbol | Care journey stage: Welcome / Onboarding / Treatment |
| `keywordSynonyms` | Symbol | Comma-separated search terms this FAQ handles |
| `searchable` | Symbol | "true" / "false" — governs whether this FAQ surfaces in site search |
| `contextNotes` | RichText | Compliance reviewer guidance — not patient-facing |

---

## Reset Checklist

- [ ] Dev server running at `localhost:3000`
- [ ] All 3 FAQ entries and 3 faqMetadata entries published (tag: `card`)
- [ ] Live preview URL configured for `faq` content type in Contentful (Settings → Content Preview)
- [ ] NT overlay not needed for this loop — no personalization
- [ ] To show Workflows: advance any FAQ entry to "In Review" state before the call, then approve live

---

## Opp Context

CARD (Center for Autism and Related Disorders) is a healthcare organization providing ABA therapy services. Demo context: mid-market healthcare org with 50+ clinic locations, structured patient content that needs to map to care stages, and a compliance team that currently audits content manually from spreadsheets. The `faqMetadata` content type was built for this demo to show how Contentful's content model can enforce governance structure that most healthcare CMS platforms leave to process and policy.

**Promotion note:** `faqMetadata` content type and the faq → faqMetadata reference pattern are strong candidates for main sandbox promotion — applicable to any org with multi-stage content journeys (onboarding flows, customer success, legal/compliance review cycles).
