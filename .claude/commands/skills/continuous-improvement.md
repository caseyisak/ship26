---
description: Post-run protocol to keep TASKS.md focused, archive completed work, and capture lessons learned. Use at the end of every task or milestone.
---

# Continuous Improvement (Post-Run Protocol)

Run this **at the end of every task or milestone** (or when explicitly asked). It keeps TASKS.md clean, moves completed work to the archive, and records new error patterns so they aren't repeated.

## When to Use

- **Do run:** After completing a milestone, a discrete feature, or a bugfix that had non-obvious root cause.
- **Skip or shorten:** For trivial edits with no completed "task" to archive and no new errors.

---

## 5-Step Protocol

### 1. Classify Outcome

- **✅ Success** — Done; tests/build pass; no new error pattern.
- **⚠️ Success with learnings** — Done; but we hit an error we fixed and should record (new lesson).
- **❌ Failure** — Not done; document what was tried and what blocked, then add a lesson if the failure has a reusable pattern.

### 2. Archive Completed Tasks

- **If** there are completed tasks or milestones in TASKS.md that are fully done:
  - Open `archive/tasks-archive.md`.
  - Add an entry at the top of the "Archived entries" section:
    - **Outcome:** ✅ / ⚠️ / ❌
    - **Done:** list of completed subtasks
    - **Incomplete:** any skipped/deferred items
    - **Metrics (optional):** iterations, errors, time
    - **Lessons:** link by ID (e.g. LL-001) if a lesson was added or applied
    - **Notes:** branch, env, follow-ups
  - Copy the completed section from TASKS.md into the archive entry; then remove that section from TASKS.md.

- **If** nothing was completed this run: skip archiving.

### 3. Update Lessons Learned (If New Error Pattern)

- **If** this run uncovered an error that:
  - had a non-obvious root cause, and
  - is not already covered in `documentation/lessons-learned.md`,
  then add a **new lesson**:
  - Assign the next ID (e.g. LL-009).
  - Add one row to the **Index** table (ID, error pattern, root cause, quick fix).
  - Add a full lesson section (exact error, root cause, solution, prevention, related files).
- **If** no new error pattern: skip this step.

### 4. Clean TASKS.md

- Remove or collapse content that was **archived** in step 2.
- Keep in TASKS.md:
  - Current hypothesis
  - Checklist for current milestone (with boxes updated)
  - Active work and next steps only
- Do **not** remove the archive footer.

### 5. Pre-Run Guidance for Next Task

Before starting the **next** task:
1. **Read** `documentation/lessons-learned.md` and scan the index for patterns that match the upcoming work.
2. **Check** `archive/tasks-archive.md` for similar past tasks and their outcomes.
3. **Note** any applicable lesson IDs or caveats in the plan.

---

## Verification Checklist

- [ ] Completed work is either archived or left in TASKS.md with a clear "in progress" reason.
- [ ] TASKS.md contains only active/upcoming tasks and the archive footer.
- [ ] Any new error pattern is recorded in lessons-learned.md (index + full lesson).
- [ ] Archive entries use the format in archive/tasks-archive.md.

---

## Files This Skill Modifies

| File | Action |
|------|--------|
| TASKS.md | Remove archived sections; keep active work + footer. |
| archive/tasks-archive.md | Append new archived entries. |
| documentation/lessons-learned.md | Add index row + new lesson section only when a new error pattern appears. |
