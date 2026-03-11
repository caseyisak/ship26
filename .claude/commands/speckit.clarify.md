---
description: Identify underspecified areas in the current feature spec by asking up to 5 highly targeted clarification questions and encoding answers back into the spec.
---

## User Input

$ARGUMENTS

You **MUST** consider the user input before proceeding (if not empty).

## Outline

Goal: Detect and reduce ambiguity or missing decision points in the active feature specification and record the clarifications directly in the spec file.

Note: This clarification workflow is expected to run (and be completed) BEFORE invoking `/speckit.plan`. If the user explicitly states they are skipping clarification, you may proceed, but must warn that downstream rework risk increases.

Execution steps:

1. Run `.specify/scripts/bash/check-prerequisites.sh --json --paths-only` from repo root **once**. Parse minimal JSON payload fields: `FEATURE_DIR`, `FEATURE_SPEC`. If JSON parsing fails, abort and instruct user to re-run `/speckit.specify`.

2. Load the current spec file. Perform a structured ambiguity & coverage scan using this taxonomy. For each category, mark status: Clear / Partial / Missing:

   - Functional Scope & Behavior: Core user goals, explicit out-of-scope, user roles
   - Domain & Data Model: Entities, relationships, lifecycle, data volume
   - Interaction & UX Flow: Critical journeys, error/empty/loading states, accessibility
   - Non-Functional Quality Attributes: Performance, scalability, reliability, security, compliance
   - Integration & External Dependencies: External services, failure modes, protocols
   - Edge Cases & Failure Handling: Negative scenarios, rate limiting, conflict resolution
   - Constraints & Tradeoffs: Technical constraints, rejected alternatives
   - Completion Signals: Acceptance criteria testability, measurable DoD

3. Generate (internally) a prioritized queue of candidate clarification questions (maximum 5):
   - Each question must be answerable with either a short multiple-choice selection (2-5 options) OR a one-word/short-phrase answer
   - Only include questions whose answers materially impact architecture, data modeling, task decomposition, test design, UX behavior, or compliance
   - Ensure category coverage balance; avoid two low-impact questions when a high-impact area is unresolved

4. Sequential questioning loop (interactive):
   - Present EXACTLY ONE question at a time
   - For multiple-choice questions:
     - Analyze all options and determine the **most suitable option** based on best practices
     - Present recommended option prominently: `**Recommended:** Option [X] - <reasoning>`
     - Render options as a Markdown table with columns: Option | Description
     - Add: `You can reply with the option letter (e.g., "A"), accept the recommendation by saying "yes" or "recommended", or provide your own short answer.`
   - For short-answer style:
     - Provide suggested answer: `**Suggested:** <your proposed answer> - <brief reasoning>`
     - Add: `Format: Short answer (<=5 words). You can accept by saying "yes" or provide your own answer.`
   - Stop asking when: all critical ambiguities resolved, user signals completion ("done", "good", "no more"), or you reach 5 asked questions
   - Maximum 10 total questions across the whole session

5. Integration after EACH accepted answer:
   - Ensure a `## Clarifications` section exists (just after the highest-level contextual section)
   - Under it, create `### Session YYYY-MM-DD` subheading for today
   - Append: `- Q: <question> → A: <final answer>`
   - Apply the clarification to the appropriate section(s):
     - Functional ambiguity → Update Functional Requirements
     - Data shape → Update Data Model
     - Non-functional → Add/modify measurable criteria in NFR section
     - Edge case → Add bullet under Edge Cases
     - Terminology → Normalize term across spec
   - Replace (don't duplicate) invalidated earlier statements
   - Save the spec file AFTER each integration

6. Validation after each write:
   - Clarifications session contains exactly one bullet per accepted answer
   - Total asked questions ≤ 5
   - No lingering vague placeholders the answer was meant to resolve
   - No contradictory earlier statement remains
   - Terminology consistency across all updated sections

7. Write the updated spec back to `FEATURE_SPEC`.

8. Report completion:
   - Number of questions asked & answered
   - Path to updated spec
   - Sections touched
   - Coverage summary table: each taxonomy category with Status: Resolved / Deferred / Clear / Outstanding
   - Suggested next command

Behavior rules:
- If no meaningful ambiguities found: respond "No critical ambiguities detected worth formal clarification." and suggest proceeding.
- If spec file missing: instruct user to run `/speckit.specify` first.
- Never exceed 5 total asked questions.
- Respect user early termination signals ("stop", "done", "proceed").
