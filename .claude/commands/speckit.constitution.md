---
description: Create or update the project constitution from interactive or provided principle inputs, ensuring all dependent templates stay in sync.
---

## User Input

$ARGUMENTS

You **MUST** consider the user input before proceeding (if not empty).

## Outline

You are updating the project constitution at `.specify/memory/constitution.md`. This file is a TEMPLATE containing placeholder tokens in square brackets (e.g. `[PROJECT_NAME]`, `[PRINCIPLE_1_NAME]`). Your job is to (a) collect/derive concrete values, (b) fill the template precisely, and (c) propagate any amendments across dependent artifacts.

Follow this execution flow:

1. Load the existing constitution template at `.specify/memory/constitution.md`.
   - Identify every placeholder token of the form `[ALL_CAPS_IDENTIFIER]`.
   - **IMPORTANT**: The user might require less or more principles than the ones used in the template. If a number is specified, respect that.

2. Collect/derive values for placeholders:
   - If user input (conversation) supplies a value, use it.
   - Otherwise infer from existing repo context (README, docs, prior constitution versions).
   - For governance dates: `RATIFICATION_DATE` is the original adoption date; `LAST_AMENDED_DATE` is today if changes are made.
   - `CONSTITUTION_VERSION` must increment according to semantic versioning:
     - MAJOR: Backward incompatible governance/principle removals or redefinitions
     - MINOR: New principle/section added or materially expanded guidance
     - PATCH: Clarifications, wording, typo fixes

3. Draft the updated constitution content:
   - Replace every placeholder with concrete text (no bracketed tokens left)
   - Ensure each Principle section: succinct name line, paragraph capturing non-negotiable rules, explicit rationale
   - Ensure Governance section lists amendment procedure, versioning policy, and compliance review expectations

4. Consistency propagation checklist:
   - Read `.specify/templates/plan-template.md` – ensure "Constitution Check" aligns with updated principles
   - Read `.specify/templates/spec-template.md` – update if constitution adds/removes mandatory sections
   - Read `.specify/templates/tasks-template.md` – ensure task categorization reflects new principles
   - Read command files in `.specify/templates/commands/*.md` – verify no outdated references
   - Read any runtime guidance docs (README.md, docs/quickstart.md)

5. Produce a Sync Impact Report (prepend as an HTML comment at top of the constitution file after update):
   - Version change: old → new
   - List of modified principles (old title → new title if renamed)
   - Added sections
   - Removed sections
   - Templates requiring updates (✅ updated / ⚠ pending) with file paths
   - Follow-up TODOs if any placeholders intentionally deferred

6. Validation before final output:
   - No remaining unexplained bracket tokens
   - Version line matches report
   - Dates ISO format YYYY-MM-DD
   - Principles are declarative, testable, and free of vague language

7. Write the completed constitution back to `.specify/memory/constitution.md` (overwrite).

8. Output a final summary to the user with:
   - New version and bump rationale
   - Any files flagged for manual follow-up
   - Suggested commit message (e.g., `docs: amend constitution to vX.Y.Z (principle additions + governance update)`)

Formatting & Style Requirements:
- Use Markdown headings exactly as in the template
- Keep a single blank line between sections
- Avoid trailing whitespace

If the user supplies partial updates (e.g., only one principle revision), still perform validation and version decision steps.

Do not create a new template; always operate on the existing `.specify/memory/constitution.md` file.

## Suggested Next Steps

After constitution is updated:
- `/speckit.specify` – Build a specification based on the updated constitution
