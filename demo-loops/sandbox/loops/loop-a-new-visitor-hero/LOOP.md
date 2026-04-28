---
id: loop-a-new-visitor-hero
customer: sandbox
build_type: sandbox
promotion_status: sandbox
personas:
  - Marketing Leader
  - Product Manager
  - Digital Experience Lead
industries:
  - All
pain_signals:
  - "our homepage feels generic"
  - "visitors aren't converting"
  - "we can't personalize without engineering"
  - "first impression matters"
  - "we have to redeploy every time the homepage changes"
  - "content and dev are completely out of sync"
contentful_features:
  - Live Preview
  - Content Modeling
  - Structured Content
content_types:
  - id: hero
    status: existing
    note: Baseline hero section — headline, subhead, CTA, media. New visitors always receive this entry (no experience swap, just baseline).
  - id: page
    status: existing
    note: Home page entry with sections array; hero is the first section reference.
components:
  - hero (src/cms-components/hero/hero.tsx)
setup_minutes: 5
---

**What this shows:** New visitors always see a consistent, editor-controlled hero — no guessing, no stale hardcoded markup. One edit in Contentful and the first impression updates for every new visitor, instantly, without a code deploy.

---

## Tell — Reflect Their Pain

"Think about what your homepage looks like to someone who has never heard of you. Right now, changing that first impression — the headline, the CTA, the value prop — probably means a Jira ticket, a sprint, and a two-week wait. And that's assuming someone even wrote it down.

Contentful separates the content decision from the engineering decision. Your marketing team controls the first impression from day one. What you're about to see is the baseline — the locked-in new visitor experience — and how fast an editor can change it."

---

## Show — Click Path

1. **[Browser]** Open the sandbox homepage in new-visitor state
   `http://localhost:3000/page/home?preview=true`
   - Point to the hero: headline, subhead, CTA
   - *"This is what every first-time visitor sees. Controlled entirely from Contentful."*

2. **[Contentful]** Open the **Home Page** entry → show the `sections` array → click into the linked **Hero** entry
   `https://app.contentful.com/spaces/uumzxfocy3ef/environments/master/entries/1nLRlw8OxGgvQx5cjMsr1J`
   - Show fields: `headline`, `subheadline`, `ctaText`, `ctaUrl`, `media`
   - *"Every field you see here is what your team controls. No template. No theme file. Just structured content."*

3. **[Contentful]** Live-edit the `headline` field — change the copy in place
   - *"Watch the right panel."*

4. **[Browser]** Hero headline updates in real time in the live preview iframe
   - *"No publish. No deploy. The editor sees exactly what a new visitor sees before it ever goes live."*

5. **[Contentful]** Point out: this hero has no NT experience linked
   - *"New visitors get this — clean, consistent, locked. Returning visitors and high-intent visitors get something more targeted. We'll show that next."*

---

## Tell — Tie to Outcomes

- **Speed to market:** "Your marketing team just changed the homepage headline in 10 seconds. That used to be a sprint."
- **No engineer required:** "There's no deploy. No PR. The content and the code are completely decoupled."
- **Brand consistency at scale:** "Every new visitor — regardless of channel, campaign, or device — sees the same controlled first impression. Not whatever someone last hardcoded."

---

## Visual Test

**Setup:** Open incognito (or clear localStorage + cookies) → `http://localhost:3000/page/home?preview=true`

1. Page loads — do NOT log in
2. Observe the hero section (first section above fold)
3. Click the **⚙️** gear icon in the navbar → NT panel opens
4. Close NT panel → scroll the full page

**Pass:**
- [ ] Hero renders with baseline headline (check `6yUhVoaCfb1sBoHCKgBlrY` entry for current copy)
- [ ] No banner rendered anywhere on the page
- [ ] NT panel → no audience highlighted, `activeAudiences` is empty
- [ ] Live preview iframe: edit the hero `headline` field in Contentful → text updates in browser without reload

---

## Entry Reference

| Entry | Content Type | ID | Status | Preview URL |
|---|---|---|---|---|
| Home Hero (New Visitor baseline) | hero | `6yUhVoaCfb1sBoHCKgBlrY` | published | `http://localhost:3000/page/home?preview=true` |
| Home Page | page | TBD — confirm entry ID from Contentful master env | published | `http://localhost:3000/page/home?preview=true` |

> **Note:** Hero variant entries for returning visitors (Loop B) and high-intent visitors (Loop C) are separate entries — IDs listed in their respective LOOP.md files.

---

## Reset Checklist

- [ ] Dev server running at `http://localhost:3000` from `main` worktree
- [ ] Homepage loads at `/page/home?preview=true` — hero section visible above fold
- [ ] Hero headline matches the expected baseline copy ("Content powers every experience" or current value)
- [ ] Live Preview iframe active — Contentful changes reflect in browser without page reload
- [ ] No persona cookie set — open incognito or clear localStorage before starting
- [ ] NT preview panel (⚙️) not showing an active audience — new visitor = no audience matched
- [ ] `.env.local` has `NEXT_PUBLIC_NINETAILED_API_KEY` and `NEXT_PUBLIC_NINETAILED_ENVIRONMENT=main`
