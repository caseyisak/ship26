---
description: Convert existing tasks into actionable, dependency-ordered GitHub issues for the feature based on available design artifacts.
---

## User Input

$ARGUMENTS

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute.

2. From the executed script, extract the path to **tasks**.

3. Get the Git remote by running:

```bash
git config --get remote.origin.url
```

> [!CAUTION]
> ONLY PROCEED TO NEXT STEPS IF THE REMOTE IS A GITHUB URL

4. For each task in the list, use the GitHub MCP server (if available) or the `gh` CLI to create a new issue in the repository that matches the Git remote.

> [!CAUTION]
> UNDER NO CIRCUMSTANCES EVER CREATE ISSUES IN REPOSITORIES THAT DO NOT MATCH THE REMOTE URL

## Issue Format

For each task, create a GitHub issue with:
- **Title**: The task description (without the checkbox, ID, and markers)
- **Body**: Include the task ID, phase, story label (if any), and file path from the task
- **Labels**: Add labels based on phase (e.g., "setup", "feature", "polish") and story (e.g., "us1", "us2")

Example:
- Task: `- [ ] T012 [P] [US1] Create User model in src/models/user.py`
- Issue title: "Create User model in src/models/user.py"
- Issue body: "Task: T012 | Parallel: yes | Story: US1 | File: src/models/user.py"
