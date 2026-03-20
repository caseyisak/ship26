---
name: continuous-improvement
description: Post-run protocol to keep TASKS.md focused, archive completed work, and capture lessons learned. Use at the end of every task or milestone when user says "archive this", "update lessons learned", "clean up TASKS.md", "mark milestone complete", "end of milestone", or "run continuous improvement". Do NOT use mid-task — only after a milestone or discrete unit of work is complete.
metadata:
  author: metafi-project
  version: 1.0.0
---

# Continuous improvement (post-run protocol)

Run this **at the end of every task or milestone** (or when explicitly asked). It keeps [TASKS.md](../../../TASKS.md) clean, moves completed work to the archive, and records new error patterns so they aren’t repeated.

## When to use

- **Do run:** After completing a milestone, a discrete feature, or a bugfix that had non-obvious root cause.
- **Skip or shorten:** For trivial edits with no completed “task” to archive and no new errors. You may still do the “Before starting next task” check when beginning the next piece of work.

---

## 5-step protocol

### 1. Classify outcome

- **✅ Success** — Done; tests/build pass; no new error pattern.
- **⚠️ Success with learnings** — Done; but we hit an error we fixed and should record (new lesson).
- **❌ Failure** — Not done; document what was tried and what blocked, then add a lesson if the failure has a reusable pattern.

### 2. Archive completed tasks

- **If** there are completed tasks or milestones in TASKS.md that are fully done (or abandoned with a clear reason):
  - Open [archive/tasks-archive.md](../../../archive/tasks-archive.md).
  - Add an entry at the top of the “Archived entries” section using the format in that file:
    - **Outcome:** ✅ / ⚠️ / ❌
    - **Done:** list of completed subtasks
    - **Incomplete:** any skipped/deferred items
    - **Metrics (optional):** iterations, errors, time
    - **Lessons:** link by ID (e.g. LL-001) if a lesson was added or applied
    - **Notes:** branch, env, follow-ups
  - Copy the completed section from TASKS.md into the archive entry (or a concise summary); then remove that section from TASKS.md so only active/upcoming work remains.

- **If** nothing was completed this run: skip archiving; do not add empty or placeholder entries.

### 3. Update lessons learned (if new error pattern)

- **If** this run uncovered an error that:
  - had a non-obvious root cause, and
  - is not already covered in [documentation/lessons-learned.md](../../../documentation/lessons-learned.md),
  then add a **new lesson**:
  - Assign the next ID (e.g. LL-006).
  - Add one row to the **Index** table (ID, error pattern, root cause, quick fix).
  - Add a full lesson section using the template in lessons-learned.md (exact error, root cause, solution, prevention, related files).
- **If** the error is already covered: do not duplicate; optionally add a “Related files” or note in the existing lesson.
- **If** no new error pattern: skip this step.

### 4. Clean TASKS.md

- Remove or collapse content that was **archived** in step 2.
- Keep in TASKS.md:
  - Current hypothesis
  - Checklist for current milestone (with boxes updated)
  - Active work and next steps only
- Do **not** remove the archive footer (see “Files this skill modifies”).

### 5. Pre-run guidance for next task

Before starting the **next** task, the agent should:
1. **Read** [documentation/lessons-learned.md](../../../documentation/lessons-learned.md) and scan the index for patterns that match the upcoming work (e.g. Contentful, preview, block renderer).
2. **Check** [archive/tasks-archive.md](../../../archive/tasks-archive.md) for similar past tasks and their outcomes.
3. **Note** any applicable lesson IDs or caveats in the plan or first message (e.g. “Applying LL-001: verifying Hero field is `media` in this space”).

---

## Verification checklist

After running the protocol, confirm:

- [ ] Completed work that was in TASKS.md is either archived (with outcome and optional lesson link) or left in TASKS.md with a clear “in progress” reason.
- [ ] TASKS.md contains only active/upcoming tasks and the archive footer.
- [ ] Any new error pattern is recorded in lessons-learned.md (index + full lesson); no duplicate lessons.
- [ ] Archive entries use the format in archive/tasks-archive.md and are scannable (outcome visible at a glance).

---

## Files this skill modifies

| File | Action |
|------|--------|
| [TASKS.md](../../../TASKS.md) | Remove archived sections; keep active work + footer. Do not remove the footer. |
| [archive/tasks-archive.md](../../../archive/tasks-archive.md) | Append new archived entries (date, outcome, done/incomplete, metrics, lessons, notes). |
| [documentation/lessons-learned.md](../../../documentation/lessons-learned.md) | Add index row + new lesson section only when a new error pattern appears. |

---

## Integration with other workflows

- **Contentful / block plan:** Sub-agents should run this skill at the **end of each milestone**. Before starting implementation, they should read lessons-learned.md and check the archive for similar tasks.
- **Debugging:** When a fix is applied, consider whether it fits an existing lesson (update “Related files”) or warrants a new lesson (add index + section).
