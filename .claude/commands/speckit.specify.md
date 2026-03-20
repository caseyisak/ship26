---
description: Create or update the feature specification from a natural language feature description.
---

## User Input

$ARGUMENTS

You **MUST** consider the user input before proceeding (if not empty).

## Outline

The text the user typed after `/speckit.specify` in the triggering message **is** the feature description. Assume you always have it available in this conversation even if `$ARGUMENTS` appears literally. Do not ask the user to repeat it unless they provided an empty command.

Given that feature description, do this:

1. **Generate a concise short name** (2-4 words) for the branch:
   - Analyze the feature description and extract the most meaningful keywords
   - Create a 2-4 word short name that captures the essence of the feature
   - Use action-noun format when possible (e.g., "add-user-auth", "fix-payment-bug")
   - Preserve technical terms and acronyms (OAuth2, API, JWT, etc.)

2. **Check for existing branches before creating new one**:

   a. Fetch all remote branches:
      ```bash
      git fetch --all --prune
      ```

   b. Find the highest feature number across all sources for the short-name:
      - Remote branches: `git ls-remote --heads origin | grep -E 'refs/heads/[0-9]+-<short-name>$'`
      - Local branches: `git branch | grep -E '^[* ]*[0-9]+-<short-name>$'`
      - Specs directories: Check for directories matching `specs/[0-9]+-<short-name>`

   c. Determine the next available number (highest N + 1, or 1 if none found).

   d. Run the script `.specify/scripts/bash/create-new-feature.sh --json "$ARGUMENTS"` with the calculated number and short-name.

   **IMPORTANT**:
   - Check all three sources to find the highest number
   - You must only ever run this script once per feature
   - The JSON output will contain BRANCH_NAME and SPEC_FILE paths

3. Load `.specify/templates/spec-template.md` to understand required sections.

4. Follow this execution flow:

    1. Parse user description from Input. If empty: ERROR "No feature description provided"
    2. Extract key concepts: actors, actions, data, constraints
    3. For unclear aspects:
       - Make informed guesses based on context and industry standards
       - Only mark with [NEEDS CLARIFICATION: specific question] if the choice significantly impacts feature scope
       - **LIMIT: Maximum 3 [NEEDS CLARIFICATION] markers total**
    4. Fill User Scenarios & Testing section
    5. Generate Functional Requirements (each must be testable)
    6. Define Success Criteria (measurable, technology-agnostic)
    7. Identify Key Entities (if data involved)

5. Write the specification to SPEC_FILE using the template structure.

6. **Specification Quality Validation**: After writing the initial spec, validate it against quality criteria:

   a. **Create Spec Quality Checklist** at `FEATURE_DIR/checklists/requirements.md`:
      - No implementation details (languages, frameworks, APIs)
      - Focused on user value and business needs
      - All mandatory sections completed
      - Requirements are testable and unambiguous
      - Success criteria are measurable and technology-agnostic
      - Edge cases are identified
      - Scope is clearly bounded

   b. **Run Validation Check**: Review the spec against each checklist item.

   c. **Handle Validation Results**:
      - If all items pass: proceed to step 7
      - If items fail: Update spec to address issues; re-run until all pass (max 3 iterations)
      - If [NEEDS CLARIFICATION] markers remain: Present options to user in a table format:

        ```markdown
        ## Question [N]: [Topic]

        **Context**: [Quote relevant spec section]
        **What we need to know**: [Specific question]

        | Option | Answer | Implications |
        |--------|--------|--------------|
        | A | [First suggested answer] | [What this means] |
        | B | [Second suggested answer] | [What this means] |
        | Custom | Provide your own answer | - |
        ```

        Wait for user to respond, then update spec accordingly.

7. Report completion with branch name, spec file path, checklist results, and readiness for next phase.

## Quick Guidelines

- Focus on **WHAT** users need and **WHY** — not HOW to implement
- Written for business stakeholders, not developers
- **Success criteria must be measurable**: "Users can complete checkout in under 3 minutes" not "API response time is under 200ms"
- **Good examples**: "System supports 10,000 concurrent users", "95% of searches return results in under 1 second"
- **Bad examples**: "React components render efficiently", "Redis cache hit rate above 80%"
