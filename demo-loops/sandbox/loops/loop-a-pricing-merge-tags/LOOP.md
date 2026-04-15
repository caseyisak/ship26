---
id: loop-a-pricing-merge-tags
customer: sandbox
build_type: net-new
promotion_status: candidate
personas:
  - VP of Digital / Growth
  - Marketing Ops
  - Solutions Engineer (persona flip demo)
industries:
  - SaaS / Fintech
  - Healthcare
  - Financial Services
  - Any industry where "speaking the customer's language" on a pricing page is a buying signal
pain_signals:
  - "We have enterprise and SMB customers but they see the same pricing page"
  - "We want to personalize but we don't have dev bandwidth"
  - "Our sales team wishes the website spoke to the industry we're pitching"
  - "Personalization requires a developer for us"
  - "We'd have to create a separate landing page per segment"
contentful_features:
  - Personalization App (NT) — merge tags in RichText
  - Live Preview — real-time field update in iframe
  - Structured content model — nested entries (PricingPlanFeature) reused across plans
content_types:
  - id: pricingSection
    status: net-new
    note: Full pricing tier section — headline, plan cards, colorVariant, sectionStyle
  - id: pricingPlan
    status: net-new
    note: Individual plan card — name, price, features collection, CTA, isHighlighted
  - id: pricingPlanFeature
    status: net-new
    note: Single feature bullet with RichText label — supports NT merge tags
  - id: nt_experience
    status: existing
    note: NT experience linking audience to personalized feature text
  - id: nt_audience
    status: existing
    note: NT audience rule (e.g. profile.traits.industry = "healthcare")
components:
  - PricingSection (cms-components/pricing-section)
setup_minutes: 10
---

**What this shows:** A single feature bullet on a pricing card updates live with prospect-specific language — company name, industry, or tier — without creating new entries or involving a developer.

---

## Tell — Reflect Their Pain

"Most teams we talk to have the same problem: the pricing page is generic. It says 'priority support' and 'enterprise integrations' — but your Healthcare customers want to see 'HIPAA compliance' and your Finance customers want to see 'SOC 2'. Today, you'd build a separate landing page per segment, or just live with one-size-fits-all.

What Contentful lets you do is different: your content editor writes the feature bullet once — with a simple placeholder where the audience-specific language goes — and the right text shows up automatically based on who's visiting. No dev ticket. No duplicate entries."

---

## Show — Click Path

1. **[Browser]** Navigate to the pricing page: `http://localhost:3000/page/pricing`
   - Point out the Standard plan feature bullets — currently generic: "Priority support for compliance teams"

2. **[Browser]** Open the NT persona panel (gear icon, bottom-right)
   - Switch to **Healthcare persona** (traits: `industry = "healthcare"`, `company_name = "MedTrust Health"`)
   - Feature bullet updates live: **"Priority support for Healthcare compliance teams"**
   - Point out: *"No page reload. No developer. The right copy, for the right audience."*

3. **[Browser]** Switch to **Financial Services persona** (traits: `industry = "financial services"`)
   - Feature bullet updates: **"Priority support for Financial Services compliance teams"**

4. **[Contentful]** Open the **PricingPlanFeature entry** driving that bullet:
   → `https://app.contentful.com/spaces/uumzxfocy3ef/environments/master/entries/FEATURE_ENTRY_ID`
   - Show the RichText `label` field: `"Priority support for {{ profile.traits.industry }} compliance teams"`
   - Point out: *"One entry. The merge tag does the work. Your editor sets this up in Contentful — no code change."*

5. **[Contentful]** Show the NT Experience wired to this feature entry — audience rule: `profile.traits.industry` exists
   - *"The audience is just a rule. When NT sees the trait, it resolves the merge tag. The content editor owns this entirely."*

6. **[Browser]** Switch to **default (logged-out) persona**
   - Feature bullet shows the fallback: **"Priority support for your compliance team"**
   - *"Logged-out visitors see the generic copy. Identified visitors see the personalized version."*

**Optional extension (if audience has dev/architect):**
7. **[Contentful]** Open the PricingPlanFeature in Live Preview
   - Change the merge tag to `{{ profile.traits.company_name }}` and save
   - Switch to Healthcare persona — feature now reads: **"Priority support for MedTrust Health"**
   - *"This is the key insight: personalization is a content model decision, not a code decision."*

---

## Tell — Tie to Outcomes

- **For VP Digital / Growth:** "Your pricing page can speak to every segment you sell to — industry, tier, company size — with one content type. No parallel landing pages. No dev sprints. Your conversion team owns it."

- **For Marketing Ops:** "The merge tag is set once. Every new audience you create in the NT app automatically gets the right feature copy. Contentful becomes the system of record for all variants, not a spreadsheet in someone's Dropbox."

- **For SE / technical audience:** "The content model separates the *structure* (PricingPlanFeature entry) from the *variation* (NT merge tag resolution). Adding a new segment is a Contentful config change — the component never changes."

**Urgency line:** *"Most teams build this with duplicated CMS entries — one per segment. That scales to 10 entries and then someone has to maintain them all. This approach scales to 100 audiences with one entry."*

---

## Entry Reference

| Entry | Content Type | ID | Status | Preview URL |
|---|---|---|---|---|
| Pricing — Metafi Plans | pricingSection | *(set after Milestone 3)* | published | `/preview/pricing-section/[ID]` |
| Plan — Standard | pricingPlan | *(set after Milestone 3)* | published | — |
| Plan — Enterprise | pricingPlan | *(set after Milestone 3)* | published | — |
| Feature: Priority Support (merge tag) | pricingPlanFeature | *(set after Milestone 3)* | published | — |
| Feature: Compliance Module | pricingPlanFeature | *(set after Milestone 3)* | published | — |
| NT Experience: Industry Pricing | nt_experience | *(wire after CT in NT app)* | published | — |
| NT Audience: Has Industry Trait | nt_audience | *(wire after CT in NT app)* | published | — |

*Update IDs after Milestone 3 creates entries.*

---

## Reset Checklist

- [ ] Dev server running at `http://localhost:3000` from correct worktree
- [ ] NT persona panel visible (gear icon bottom-right on pricing page)
- [ ] Default (logged-out) persona selected before starting — feature bullets show generic fallback copy
- [ ] Healthcare persona configured with `traits.industry = "healthcare"` and `traits.company_name = "MedTrust Health"`
- [ ] Financial Services persona configured with `traits.industry = "financial services"`
- [ ] PricingPlanFeature entry "Feature: Priority Support" has merge tag `{{ profile.traits.industry }}` in label field
- [ ] NT experience wired to PricingPlanFeature entry and audience published
- [ ] `/page/pricing` returns 200 with no console errors
