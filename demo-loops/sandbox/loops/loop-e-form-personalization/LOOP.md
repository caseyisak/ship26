---
id: loop-e-form-personalization
customer: sandbox
build_type: net-new
promotion_status: sandbox
personas:
  - Marketing Manager
  - Demand Gen Lead
  - Growth Marketer
industries:
  - SaaS
  - E-commerce
  - Financial Services
pain_signals:
  - "our form shows the same thing to every visitor"
  - "when someone fills out a form, the rest of the site doesn't react to it"
  - "we manage the same newsletter signup in four places — every copy update is a four-step process"
contentful_features:
  - Ninetailed personalization (client-side, no CDP)
  - Rich text content model
  - Content references (form entry reused across page, footer, TwoAcross)
content_types:
  - id: form
    status: net-new
    note: Newsletter / contact / message layouts, NT personalization, formId talking point
  - id: settings
    status: existing
    note: footerForm field added — references form entry
  - id: twoAcross
    status: existing
    note: form field added — renders form in media slot
  - id: banner
    status: existing
    note: new NT variant for isNewsletterSubscribed audience
components:
  - Form (newsletter, contact, message layouts)
  - Footer (updated with form slot)
  - TwoAcross (updated with form slot)
  - Banner (existing, new NT experience)
setup_minutes: 5
---

**What this shows:** Personalize form copy by persona and swap site content after submission — all from a single Contentful entry.

---

## Tell — Reflect Their Pain

"Most teams we talk to are managing the same form in three or four places — a marketing page, the footer, a modal. When legal changes one word, it's a four-ticket process. And the form itself? It says the same thing to every visitor, whether they've never heard of you or they're already a subscriber.

What we built here shows two things: first, how a single Contentful form entry can power every surface — page section, footer, embedded promo block — so there's one place to make a change. Second, how that form can speak differently to different visitors based on what Ninetailed knows about them. A new visitor sees the generic pitch. A returning subscriber sees a message that acknowledges they already know you. No developer, no CDP, no data pipeline."

---

## Show — Click Path

1. **[Browser]** Navigate to `http://localhost:3001/page/home`
   - Persona A (Alex, new visitor) is active — the newsletter form shows **"Stay in the loop"** with a generic description
   - Point out the form also appears in the footer — same entry, same content, different surface
   - *"One entry. Every surface. That's the content reuse story."*

2. **[Browser]** Open the persona switcher (gear icon or demo panel) → switch to **Persona B (Blake, isNewsletterSubscribed: true)**
   - The form copy swaps to **"Hey Blake, you're missing our weekly brief"** without a page reload
   - Footer form updates to match
   - *"This is client-side personalization — no page refresh, no redirect. Ninetailed matched the audience and swapped the content in place."*

3. **[Browser]** Switch back to Persona A → submit the newsletter form
   - The **Promo Banner** near the top of the page swaps from "Sample Promo" to **"Welcome to the inner circle"** with a link to the blog
   - *"The act of submitting sets a behavioral signal — and the downstream content reacts. The banner didn't reload the page. It just updated."*

4. **[Contentful]** Open the single **Newsletter Signup — Default** form entry
   → `https://app.contentful.com/spaces/uumzxfocy3ef/environments/master/entries/1HXaO9PKLaJfsFK6fLSloa`
   - Show the `titleRt` field: "Stay in the loop" — the baseline that every anonymous visitor sees
   - Point out the **NT Experiences** field is wired to the subscriber variant
   - Change the headline to something new → save → both the page section and the footer update in live preview
   - *"One edit. Every surface. That's the promise of structured content."*

5. **[Contentful]** Open the **Newsletter Form — Subscriber Variant** NT experience entry
   → `https://app.contentful.com/spaces/uumzxfocy3ef/environments/master/entries/6bjmNzolN6dHSOJcfJwZxj`
   - Show the audience rule: `isNewsletterSubscribed`
   - Show the variant linked: `Newsletter — Returning` form entry
   - *"This is 3 clicks to set up. No developer, no form rebuild, no deploy. Your content team owns the personalization rule."*

---

## Tell — Tie to Outcomes

- **For Marketing Managers:** "Every touchpoint reflects where the customer is in their journey — without a CDP or a developer ticket. You set the audience rule once. It applies across every surface where that form lives."

- **For Demand Gen:** "Form submissions become behavioral signals that change what your visitors see next, in real time. The banner swap you just saw is the same mechanic you'd use to surface a trial prompt, a case study, or an upsell — triggered the moment someone converts."

- **For Growth:** "One form entry, every surface. When legal changes the disclaimer, it's one edit. When marketing wants to A/B test the headline, it's one experience entry. When you add the form to a new page, you reference the same entry — you don't rebuild anything."

**Urgency line:** *"Every competitor is using the same generic form. The teams that win are the ones who make each visitor feel like the form was written for them. You can be live with persona-aware forms in an afternoon."*

---

## Entry Reference

| Entry | Content Type | ID | Status | Preview URL |
|---|---|---|---|---|
| Newsletter Signup — Default | form | `1HXaO9PKLaJfsFK6fLSloa` | published | `/page/home` |
| Newsletter — Returning (Blake variant) | form | `2xtmkc41qwYCShDQWu7l2p` | published | — |
| Newsletter — Premium (Kaz variant) | form | `1oi84XB78TeK5eEQZqNQMt` | published | — |
| Newsletter Form — Subscriber Variant (NT experience) | nt_experience | `6bjmNzolN6dHSOJcfJwZxj` | published | — |
| Promo Banner | banner | `6p2oNFWdkrv5XIYmK9wQTD` | published | `/page/home` |
| Promo Banner — Subscribed Variant | banner | `7eA8LMeDpuHeFK2vhh2lxd` | published | — |
| Banner — Post-Subscribe Swap (NT experience) | nt_experience | `6BsqXXBVuXk5A6YOOr3btP` | published | — |
| NT Audience — isNewsletterSubscribed | nt_audience | `4R4tisZXLysFGuBY5DAlUj` | published | — |
| Site Settings | settings | `2cgyEdELIF1EbwlLLdSZgR` | published | — |
| Home Page | page | `6yuInMRWMJc5kKiFtW4gea` | published | `/page/home` |

---

## Reset Checklist

- [ ] Persona switcher is visible (user is in demo mode — `NEXT_PUBLIC_DEMO_MODE=true`)
- [ ] Persona A (Alex, new visitor) is active before starting — form shows "Stay in the loop"
- [ ] Home page includes the newsletter form section and newsletter form in footer
- [ ] NT audience `isNewsletterSubscribed` (`4R4tisZXLysFGuBY5DAlUj`) is published in Contentful master
- [ ] NT experience on newsletter form (`6bjmNzolN6dHSOJcfJwZxj`) is published
- [ ] NT experience on Promo Banner (`6BsqXXBVuXk5A6YOOr3btP`) is published
- [ ] Dev server running — use `bun run dev` from `feat-form-builder-app` worktree (or main after merge)
