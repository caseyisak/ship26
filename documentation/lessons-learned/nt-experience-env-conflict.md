# LL-020: NT Experience "Already Exists" Error — Link, Don't Clone

## Symptom

Opening an NT-enabled entry in a demo Contentful environment shows:

> "This Experience already exists in the main Ninetailed environment. Changes made to this Experience will not reflect in Ninetailed."

The NT Personalization sidebar shows the experience card with a **"Changed"** badge and no ability to edit config.

## Root Cause

When you copy a Contentful environment from `master`, NT experience entries are duplicated with their original `ntExperienceId` values intact. Both environments (`master` + the new demo env) point to the same Ninetailed backend. NT sees two entries claiming ownership of the same experience ID — this is a conflict. Only the **original** entry (in `master`) is allowed to mutate the NT-side config.

## Resolution (for existing demos)

In the affected demo Contentful environment:

1. On the baseline entry (e.g. Hero), open the NT Personalization sidebar
2. On the conflicting experience card, click **"⋯" → Remove** to unlink the cloned experience entry
3. Click **"Link existing experience"** and select the same experience from `master`
4. Re-add any demo-specific variant entries (Hero/Banner/etc.) as components in the linked experience

The variant entries themselves are fine — you're only changing **who owns the experience config**.

## Prevention (for all future demos) — MANDATORY

**Never create or copy NT experience entries into a demo env.** The workflow is:

| What | Action |
|------|--------|
| NT experience config (audiences, rules, distribution) | Lives in `master`. Use **"Link existing experience"** in the demo env. |
| Variant content entries (Hero, Banner, etc.) | Create new, demo-branded entries in the demo Contentful env |
| Audiences | Link existing from `master` OR create demo-specific ones in the demo env |

### Step 8 in the demo runbook now reads:

When wiring NT personalization in a new demo env:

1. Create variant content entries (Hero/Banner/etc.) with branded copy in the demo env ✅
2. Do **NOT** create a new `nt_experience` entry — the experience already exists in `master`
3. On the baseline entry, click **"Link existing experience"** → select the master experience
4. Add your demo-specific variant as a component in the linked experience

## Why This Matters

Cloned experiences cause a silent ownership conflict — the demo env entry can't push any config changes to NT. Personalization appears "set up" in Contentful but nothing works in the running app. This is invisible until you open the NT sidebar and see the "Changed" badge.

## Related

- Contentful docs: https://www.contentful.com/help/personalization/experiences/linked-experiences/#resolving-conflicts
- LL-016: NT experiences field collision (`ntExperiences` vs `nt_experiences`)
- LL-017: NT experiences duplicate collection
