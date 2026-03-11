---
description: Generate a custom checklist for the current feature based on user requirements. Checklists are "unit tests for requirements writing" - they validate quality, clarity, and completeness of requirements in a given domain.
---

## Checklist Purpose: "Unit Tests for English"

**CRITICAL CONCEPT**: Checklists are **UNIT TESTS FOR REQUIREMENTS WRITING** - they validate the quality, clarity, and completeness of requirements.

**NOT for verification/testing**:
- ❌ NOT "Verify the button clicks correctly"
- ❌ NOT "Test error handling works"

**FOR requirements quality validation**:
- ✅ "Are visual hierarchy requirements defined for all card types?" (completeness)
- ✅ "Is 'prominent display' quantified with specific sizing/positioning?" (clarity)
- ✅ "Are accessibility requirements defined for keyboard navigation?" (coverage)

## User Input

$ARGUMENTS

You **MUST** consider the user input before proceeding (if not empty).

## Execution Steps

1. **Setup**: Run `.specify/scripts/bash/check-prerequisites.sh --json` from repo root and parse JSON for FEATURE_DIR and AVAILABLE_DOCS list.

2. **Clarify intent (dynamic)**: Derive up to THREE initial contextual clarifying questions. They MUST:
   - Be generated from the user's phrasing + extracted signals from spec/plan/tasks
   - Only ask about information that materially changes checklist content
   - Prefer precision over breadth

   Generation algorithm:
   1. Extract signals: feature domain keywords, risk indicators, stakeholder hints, explicit deliverables
   2. Cluster signals into candidate focus areas (max 4) ranked by relevance
   3. Identify probable audience & timing (author, reviewer, QA, release)
   4. Detect missing dimensions: scope breadth, depth/rigor, risk emphasis
   5. Formulate questions from archetypes:
      - Scope refinement, Risk prioritization, Depth calibration, Audience framing, Boundary exclusion

   Output the questions (label Q1/Q2/Q3). After answers, if ≥2 scenario classes remain unclear, you MAY ask up to TWO more targeted follow-ups (Q4/Q5). Do not exceed five total questions.

3. **Understand user request**: Combine `$ARGUMENTS` + clarifying answers to derive checklist theme, must-have items, and focus areas.

4. **Load feature context**: Read from FEATURE_DIR:
   - spec.md, plan.md (if exists), tasks.md (if exists)
   - Load only necessary portions relevant to active focus areas

5. **Generate checklist** - Create "Unit Tests for Requirements":
   - Create `FEATURE_DIR/checklists/` directory if it doesn't exist
   - Generate unique checklist filename based on domain (e.g., `ux.md`, `api.md`, `security.md`)
   - If file exists, append to existing file
   - Number items sequentially starting from CHK001

   **CORE PRINCIPLE**: Every checklist item MUST evaluate the REQUIREMENTS THEMSELVES for:
   - **Completeness**: Are all necessary requirements present?
   - **Clarity**: Are requirements unambiguous and specific?
   - **Consistency**: Do requirements align with each other?
   - **Measurability**: Can requirements be objectively verified?
   - **Coverage**: Are all scenarios/edge cases addressed?

   **HOW TO WRITE CHECKLIST ITEMS**:

   ❌ **WRONG** (Testing implementation):
   - "Verify landing page displays 3 episode cards"
   - "Test hover states work correctly on desktop"

   ✅ **CORRECT** (Testing requirements quality):
   - "Are the exact number and layout of featured episodes specified? [Completeness, Spec §FR-001]"
   - "Are hover state requirements consistently defined for all interactive elements? [Consistency]"
   - "Is 'prominent display' quantified with specific sizing/positioning? [Clarity, Spec §FR-4]"
   - "Are loading states defined for asynchronous episode data? [Gap]"

   **Item structure:**
   - Question format asking about requirement quality
   - Focus on what's WRITTEN (or not written) in the spec/plan
   - Include quality dimension in brackets [Completeness/Clarity/Consistency/Coverage/Measurability/Gap/Ambiguity/Conflict/Assumption]
   - Reference spec section `[Spec §X.Y]` when checking existing requirements
   - Use `[Gap]` marker when checking for missing requirements

   **Traceability**: ≥80% of items MUST include at least one traceability reference

   **Content cap**: If raw candidate items > 40, prioritize by risk/impact

   **🚫 ABSOLUTELY PROHIBITED**:
   - ❌ Any item starting with "Verify", "Test", "Confirm", "Check" + implementation behavior
   - ❌ References to code execution, user actions, system behavior
   - ❌ "Displays correctly", "works properly", "functions as expected"
   - ❌ "Click", "navigate", "render", "load", "execute"

6. **Structure Reference**: Generate the checklist following the canonical template in `.specify/templates/checklist-template.md`. If template is unavailable, use: H1 title, purpose/created meta lines, `##` category sections containing `- [ ] CHK### <requirement item>` lines.

7. **Report**: Output full path to created checklist, item count, and remind user that each run creates a new file. Summarize focus areas, depth level, and any explicit user-specified must-have items incorporated.

**Important**: Each `/speckit.checklist` command invocation creates a checklist file using short, descriptive names. Multiple checklists of different types are supported (e.g., `ux.md`, `test.md`, `security.md`).
