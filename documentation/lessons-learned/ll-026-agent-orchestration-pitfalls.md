# LL-026 — Agent Team Orchestration Pitfalls

## Symptom

Agent team runs, commits appear in git, but the feature is broken at runtime. Tests never ran. No visual confirmation was done. Some agents ran twice (once producing research only, once producing code). An MCP-dependent agent (Contentful CT creation) failed silently and the orchestrator had to step in manually.

## Root Cause

Five independent failures compounded:

### 1. Agents launched before `ExitPlanMode`

When agents are launched while plan mode is active, they inherit the read-only constraint — they can research but cannot write files or run commands. This caused all three specialist agents (build, mcp, preview) to run twice: once in plan mode (research only) and once after plan approval (actual execution). Double token burn, half the output.

**Fix:** Never launch tmux panes or Agent tool calls until after `ExitPlanMode` is called and the user has approved the plan.

### 2. MCP tools blocked by `mode: "auto"`

The mcp agent was launched with `mode: "auto"` (Agent tool) / `--permission-mode auto` (tmux). When a subagent calls an MCP tool for the first time, the approval prompt surfaces in the **parent session** — but if the subagent is running autonomously, it can't wait for that approval. The result: the call silently fails or the agent stops.

**Fix:** All agents must use `mode: "bypassPermissions"` (Agent tool) or `claude --dangerously-skip-permissions` (tmux). **Confirmed working 2026-04-22:** `bypassPermissions` fully unlocks Contentful MCP tools in subagents with no blocking.

### 3. QA agent had no Bash permissions, couldn't run tests or commit

Same root cause as #2. With `mode: "auto"`, Bash tool calls (like `bun test`, `git commit`) also require approval prompts. The QA agent silently skipped running tests and reported done without evidence.

### 4. No visual inspection step

The QA agent's role was defined as "code review + register in block renderer." There was no browser step. The page was never opened. Errors that only appear at runtime (missing props, rendering crashes) were invisible.

**Fix:** QA agent persona prompt must require Playwright MCP visual verification as a non-optional step. See `references/persona-prompts.md`.

### 5. Orchestrator wrote code

When the MCP agent failed, the orchestrator stepped in and ran Contentful MCP calls directly. This is pragmatic but breaks the team structure — the orchestrator should have re-dispatched to a properly-permissioned agent instead.

**Fix:** Orchestrator coordinates only. If a specialist fails, re-launch it with correct permissions. Do not do the work in the orch session.

## Fix Summary

| Failure | Fix |
|---|---|
| Agents launched in plan mode | Wait for `ExitPlanMode` before creating panes |
| MCP blocked | `bypassPermissions` / `--dangerously-skip-permissions` on all agents |
| Tests never ran | Same permission fix; QA persona requires `bun test` output |
| No visual QA | QA persona requires Playwright MCP screenshot before reporting done |
| Orch wrote code | Orch = coordinator only; re-dispatch failed agents |

## Agent Loop Pattern

For every milestone:
```
research (read codebase, produce FINDINGS.md) 
  → code (implement from FINDINGS.md only)
  → qa (bun test + Playwright screenshot + console check)
  → orch (relay structured report to user)
```

## Seen In

- `feat/plp-collections` — productListing section block (2026-04-22)

## Related Files

- `~/.claude/skills/spin-team/SKILL.md` — updated with 5 non-negotiable rules
- `~/.claude/skills/spin-team/references/tmux-setup.md` — dsp launch + named agent prompts
- `~/.claude/skills/spin-team/references/persona-prompts.md` — updated QA visual step
