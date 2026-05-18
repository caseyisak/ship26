# Research: Contentful Environment Alias Pattern for Demo Workflows

**Issue:** caseyisak/metafi#96  
**Date:** 2026-05-12  
**Researcher:** Research agent (session)

---

## Summary

The proposed pattern — using a Contentful environment alias as a stable routing layer so `.env.local` never needs to change between demos — is **viable**, but the specific variant of re-pointing `master` itself is **not safe**. The correct implementation is a separate named alias (e.g. `demo`) that leaves `master` untouched.

**Verdict: Adopt with guardrails.** Use a named `demo` alias, not `master`.

---

## How Aliases Work

An environment alias is a stable string identifier that resolves to whichever target environment it currently points at. All Contentful APIs (CDA, CMA, CPA, GraphQL) accept an alias ID in place of an environment ID — the routing is transparent to callers.

Key mechanics:
- Re-targeting an alias is a single API/CLI call and takes effect in **< 250 ms** — effectively instant, no downtime.
- The URL pattern is identical: `/spaces/<space-id>/environments/<alias-id>/entries` works the same whether `<alias-id>` is `master`, `demo`, or a literal environment ID.
- Requests that omit the environment segment entirely (e.g. `/spaces/<space-id>/entries`) implicitly route through `master`.
- API key access is **independent** of alias configuration. You must explicitly allow a new alias in Contentful → Settings → API Keys → [key] → Environments. This is a one-time setup step, not something you redo per demo.

### The `master` alias is special

- `master` is the only alias covered by Contentful's **CDN cache** and **SLA guarantees**.
- Custom named aliases (non-`master`) serve CDA requests **uncached** and are **not SLA-covered**.
- For demo use (live preview, preview token), this is acceptable — preview mode bypasses CDN cache anyway.
- `master` cannot be deleted and its ID cannot be changed.
- Custom aliases are a **Premium/Enterprise** feature. Verify your plan supports them before building on this pattern.

### CLI commands

```bash
# Create a new alias (one-time)
contentful space environment-alias create --alias-id demo --target-environment-id master

# Re-point an alias (pre-demo)
contentful space environment-alias update --alias-id demo --target-environment-id beckons-2026-05

# Return to idle state (post-demo)
contentful space environment-alias update --alias-id demo --target-environment-id master
```

---

## Q&A

### Q1. Can you freely reassign the `master` alias without downtime or data loss?

**Yes, technically.** Re-aliasing is instant (< 250 ms). No data loss occurs — the underlying environments are untouched; only the pointer changes. Rollback is equally instant.

**However, you should not re-point `master` for demos.** See Q6 for the safer alternative.

---

### Q2. What are the implications for GraphQL, CDA, and CPA when `master` aliases to a non-master env?

Transparent to the API consumers. The alias resolves at the Contentful routing layer before any data is served. GraphQL, CDA, and CPA all work identically through an alias as through a direct env ID.

One nuance: **webhooks fire based on the alias used in the API call path**, not the underlying environment name. A webhook configured for `master` fires when requests use `.../environments/master/...` — so if you write to a demo env via the `master` alias, `master`-scoped webhooks trigger. If your sandbox has webhooks (e.g. Vercel deploy triggers), they will fire against demo content during the alias swap period.

---

### Q3. Do Roles & Permissions, Releases, Workflows, and Scheduled Publishing work through the alias?

| Feature | Through alias? | Notes |
|---|---|---|
| Content Delivery API | Yes | Fully transparent |
| Content Management API | Yes | Writes go to the target env |
| Roles & Permissions | Yes, with a catch | RBAC can be scoped to alias name; roles scoped to `master` access whatever `master` currently points at — meaning if `master` is re-pointed to `beckons`, those roles gain access to `beckons`. Roles scoped to `demo` would follow `demo` alias the same way. |
| Scheduled Publishing | Partial | Schedules are **not cloned** when creating a new env. Demo envs start with no schedules. Each space allows max 500 schedules total across all envs. |
| Releases | Partial | Releases live in a specific env. Re-aliasing doesn't attach existing releases from another env. Demo envs cloned from `master` won't have `master`'s releases. Rebuild any needed release in the demo env. |
| Workflows | Not cloned | **Workflows are not copied when cloning an environment.** Demo envs need workflow steps configured manually, or skip Workflows for demo context (use Releases for approval/release stories instead). |

---

### Q4. Is there risk to the real `master` env content when re-aliasing back after a demo?

**No data risk.** Re-aliasing only changes a pointer. The `master` environment's data is never modified by the alias operation itself. When you re-point `master` alias back to the `master` environment, all sandbox content is exactly as it was.

The risk is **operational**, not data-integrity: if a write (editor, webhook, scheduled publish) occurs via the `master` alias while it points at a demo env, that write lands in the demo env, not in the sandbox. The sandbox remains clean, but the demo env gets an unintended write.

---

### Q5. Concurrency: can two demos run simultaneously?

**No — one alias can point to only one environment at a time.** If two demos run concurrently using the same alias, they must use separate aliases (`demo-1`, `demo-2`) or separate Contentful spaces.

The one-alias-one-target constraint is absolute. There is no fan-out or multi-target capability.

For this project's current single-demo-at-a-time workflow, this is not a practical constraint.

---

### Q6. Would a separate named alias (e.g. `demo`) be safer than re-pointing `master` itself?

**Yes. This is the recommended approach.** Re-pointing `master` is dangerous for demos because:

1. **Vercel and all CI pipelines** read `CONTENTFUL_ENVIRONMENT=master` and would silently serve demo content to sandbox visitors during the demo window.
2. **Webhooks scoped to `master`** (e.g. Vercel redeploy triggers) fire when editors write content in the demo env.
3. **Roles scoped to `master`** dynamically follow the alias — any role that can access `master` would gain access to the demo env's content model (including customer-confidential content) for the duration.
4. **Forgetting to re-alias** leaves the live sandbox dark, serving demo content indefinitely.
5. Contentful docs explicitly state: "The master alias should be used to serve your production content."

**Safe pattern: named `demo` alias**

- `CONTENTFUL_ENVIRONMENT=demo` in demo branch `.env.local` only.
- Main branch `.env.local` keeps `CONTENTFUL_ENVIRONMENT=master` — completely unaffected.
- Sandbox visitors always hit `master`. Demo attendees hit `demo` → current demo env.
- Post-demo re-point `demo` back to `master` env (idle state). No rush, no risk.

**One-time setup cost:** create the `demo` alias, add it to the API key, update `.env.local.example` and `NEW-DEMO-RUNBOOK.md`. After that, every future demo just re-points `demo` → new env.

---

### Q7. How does Ninetailed interact with aliases?

NT's `environment` config value (`main` or `development`) maps to **NT's own internal data buckets** — completely independent of Contentful environment IDs or alias names.

- Contentful `master` env → NT `main` bucket (SDK key A, `NEXT_PUBLIC_NINETAILED_ENVIRONMENT=main`)
- Contentful demo envs → NT `development` bucket (SDK key B, `NEXT_PUBLIC_NINETAILED_ENVIRONMENT=development`)

Re-pointing the `demo` alias to a new env does **not** change which NT bucket is used — that is controlled by `NEXT_PUBLIC_NINETAILED_ENVIRONMENT` in `.env.local`, which stays `development` for all demo branches.

**Critical gotcha: NT sync is not automatic.** Contentful Personalization is not notified when an alias target changes. After re-pointing `demo` to a new env, NT's audience/experience cache may be stale until a sync occurs. Fix: after re-aliasing, publish any minor edit to a Ninetailed Experience or Audience entry in the new env, OR click "Sync content sources" in the NT dashboard. This step must be in the demo runbook.

---

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Re-pointing `master` during demo exposes sandbox to demo content | High | Never re-point `master`. Use a named `demo` alias. |
| Named aliases are Premium/Enterprise only | Blocker if not on right plan | Verify plan in Contentful → Settings → Environments before implementing |
| Forgetting to re-alias `demo` after demo ends | Medium | Post-demo checklist item; can automate via n8n or a simple script |
| Concurrent demos impossible on one alias | Medium | Two concurrent demos need two aliases (`demo-1`, `demo-2`) or different spaces |
| Webhooks fire on alias writes (affects `master` if mis-used) | Medium | Avoided entirely by using named `demo` alias |
| Workflows not cloned to demo env | Low | Either skip Workflows in demo context, or manually recreate; document in runbook |
| NT sync stale after re-alias | Low | Add "publish dummy NT edit" step to demo runbook |
| API key must explicitly allow `demo` alias | Low | One-time setup; document in runbook |
| CDA through `demo` alias is uncached | Acceptable | Demo sites run in live preview mode which bypasses CDN anyway |

---

## Recommendation

**Adopt with guardrails.**

The pattern is sound. Use a named `demo` alias, never re-point `master`. One-time setup cost is low; ongoing benefit is that demo branch `.env.local` never needs manual env ID edits.

### Implementation steps (one-time)

1. Verify Contentful plan supports custom aliases (Settings → Environments in web app).
2. Create `demo` alias in idle state:
   ```bash
   contentful space environment-alias create --alias-id demo --target-environment-id master
   ```
3. Add `demo` alias to the API key: Contentful → Settings → API Keys → [key] → Environments → add `demo` → Save.
4. Add `CONTENTFUL_ENVIRONMENT=demo` to `.env.local.example` with explanatory comment.
5. Update `demo-loops/NEW-DEMO-RUNBOOK.md` with two new steps:
   - **Pre-demo:** `contentful space environment-alias update --alias-id demo --target-environment-id <new-env-id>`
   - **Post-demo:** `contentful space environment-alias update --alias-id demo --target-environment-id master` + publish dummy NT edit to trigger sync
6. Communicate the `NEXT_PUBLIC_NINETAILED_ENVIRONMENT=development` requirement to demo branch `.env.local`.

### What does NOT change

- Main branch `.env.local` keeps `CONTENTFUL_ENVIRONMENT=master`. No changes to sandbox.
- `src/services/contentful/client.ts` and all other code using `process.env.CONTENTFUL_ENVIRONMENT` — no changes needed, the alias name is the only difference.
- NT bucket assignment logic — same as today.

---

## Sources

- [Contentful Environment Aliases concept docs](https://www.contentful.com/developers/docs/concepts/environment-aliases/)
- [Environments and environment aliases best practices](https://www.contentful.com/developers/docs/concepts/environments-and-environment-aliases-best-practices/)
- [Environment alias management with the Contentful CLI](https://www.contentful.com/developers/docs/tutorials/cli/environment-alias-management/)
- [Deploying changes with environment aliases](https://www.contentful.com/developers/docs/tutorials/general/deploying-changes-with-environment-aliases/)
- [Manage access to environments](https://www.contentful.com/developers/docs/tutorials/general/managing-access-to-environments/)
- [Ninetailed JavaScript SDK — environment config](https://www.contentful.com/developers/docs/ninetailed/the-ninetailed-instance/)
- [Ninetailed data buckets / content sources](https://docs.ninetailed.io/setup/content-sources)
- [Scheduled publishing limitations](https://www.contentful.com/help/scheduled-publishing/)
