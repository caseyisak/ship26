# Demo Script Template

Copy this template into `DEMO_SCRIPT.md` at the worktree root and fill in the bracketed values.

---

```markdown
# Demo Script — [Customer Name] — [Date]

## Attendees
- [names / titles if known]

## Goal
[One sentence: what success looks like. E.g. "Show how editors can manage multi-channel content without code."]

## Pre-demo setup
- [ ] `bun run dev` running on port 3000
- [ ] `.env.local` → `CONTENTFUL_ENVIRONMENT=[customer-slug]`, `NEXT_PUBLIC_BRAND=[customer-slug]`
- [ ] At least one published Page entry in the [customer-slug] Contentful env
- [ ] Theme visible: localhost:3000 looks branded correctly
- [ ] Contentful live preview URL configured for Hero/Banner entries
- [ ] All seed entries published in Contentful
- [ ] Browser tabs open: localhost:3000 | app.contentful.com | localhost:3000/app (if multi-channel)

---

## Flow

### 1. Opening (2 min)
- Brief intro: "This is [Customer Name]'s content platform — everything you see is managed in Contentful."
- Navigate to localhost:3000 — show the branded homepage

### 2. [Loop 1: e.g. Multi-channel] (X min)
**Talking points:**
- [from demo-loops.md for this loop]

**Live demo steps:**
1. [action]
2. [action]

### 3. [Loop 2] (X min)
**Talking points:**
-

**Live demo steps:**
1.

### 4. Live edit moment (3 min)
- Open a Hero or Banner entry in Contentful
- Make a visible change (headline text, image)
- Show it update live in the preview iframe
- **Key line:** "This is what your editors see every day — no dev, no deploy."

### 5. Close (2 min)
- Recap what we showed
- Questions
- Next steps: [e.g. trial env, pricing, follow-up call]

---

## URLs to bookmark
- Site: http://localhost:3000
- Contentful: https://app.contentful.com/spaces/uumzxfocy3ef/environments/[customer-slug]
- Mobile app: http://localhost:3000/app
- Live preview: http://localhost:3000/api/enable-draft?secret=kaz&entryId=[entry-id]&type=banner

---

## Post-demo
- [ ] Did we build anything new for this demo?
- [ ] Generic enough to reuse? → open PR to main
- [ ] Archive branch (do not delete)
- [ ] Update archive/tasks-archive.md with demo outcome
```
