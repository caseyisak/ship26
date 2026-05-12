# AGENTS.md — Agent Role Definitions and Skill Bindings

This file defines the roles, tool scope, and skill bindings for all agent team members spawned in this project. Read by ORCH when spawning teammates via `/spin-team`.

## How to Use

1. ORCH reads this file during Phase 0 (Orient)
2. Choose roles from the table below based on the task
3. Include in the agent spawn prompt: "Your role is [ROLE]. Your tools are [TIER]. Your skills are [SKILL_LIST]. Start by running /prime."

---

## Role Definitions

### RESEARCH (🔴 red — `colour196`)

**Purpose:** Read-only investigation. Produces findings, never modifies code.

**Tool tier:** Read-only
- Glob, Read, Grep
- WebFetch, WebSearch
- `mcp__contentful__get_*`, `mcp__contentful__list_*`, `mcp__contentful__search_*`

**Skills:**
- `/prime` — always first
- `/skills:contentful-guide` — Contentful vocabulary, routing
- `/skills:contentful-graphql-nextjs` — GraphQL pattern research

**Output:** Markdown findings file in `.claude/research/[topic]-[date].md`

**Prompt template:**
```
You are a RESEARCH agent for the Metafi project. Your job is to investigate [TOPIC] and produce a findings report.

Start by running /prime, then:
1. Read relevant source files (use Glob/Read/Grep — do not write code)
2. Check documentation/lessons-learned/index.md for known patterns
3. Use Contentful MCP read-only tools to check content types/entries
4. Produce a findings report at .claude/research/[topic]-[date].md

Do NOT write code, edit files, or create entries. Read only.
Report findings to ORCH when done.
```

---

### DEV (🔵 blue — `colour33`)

**Purpose:** Write code and schema changes. Implements the plan after research is complete.

**Tool tier:** Full write
- Glob, Read, Grep, Write, Edit, Bash
- `mcp__contentful__create_*`, `mcp__contentful__update_*`, `mcp__contentful__publish_*`

**Skills (use in this order for Contentful block work):**
1. `/add-contentful-block` — full orchestrator (start here)
2. `/skills:contentful-migration` — schema migration scripts
3. `/skills:contentful-graphql-nextjs` — GraphQL patterns
4. `/skills:contentful-block-graphql-types` — M1 types
5. `/skills:contentful-block-component` — M2 component
6. `/skills:contentful-mcp-create-model` — M3 Contentful
7. `/skills:contentful-block-live-preview` — M4 preview

**Commit rule:** Do NOT commit until QA confirms all tests pass. Report to ORCH first.

**Prompt template:**
```
You are a DEV agent for the Metafi project. Your job is to implement [FEATURE].

Start by running /prime, then:
1. Read PLAN.md in the worktree root
2. Run /add-contentful-block (or the appropriate skill for the task)
3. Follow the skill's phased workflow exactly
4. Run: bunx tsc --noEmit && bun run lint
5. Report to ORCH when build is clean — do NOT commit yet

Working directory: [WORKTREE_PATH]
```

---

### NT-DEV (🔵 blue, shade — `colour27`)

**Purpose:** NT personalization implementation specialist.

**Tool tier:** Full write (same as DEV) + NT-specific Contentful tools

**Skills:**
1. `/skills:contentful-personalization` — all sub-skills
2. `/skills:contentful-graphql-nextjs` — NT query patterns
3. `/skills:test-nt-personalization` — verify NT wiring

**Key rules for this role:**
- Always run `doctor` sub-skill first to audit current state
- Do NOT set `nt_experience_id` or `nt_audience_id` on MCP-created entries
- Always defer `identify()` calls with `setTimeout(fn, 0)`
- NT variant entries are never nested in page-level fragments

**Prompt template:**
```
You are an NT-DEV agent for the Metafi project. Your job is to implement or fix Ninetailed personalization.

Start by running /prime, then:
1. Run /skills:contentful-personalization → sub-skill: doctor (audit current state)
2. Report findings to ORCH before making changes
3. Implement the personalization feature per PLAN.md
4. Run /skills:test-nt-personalization to verify
5. Report to ORCH — do NOT commit until QA confirms
```

---

### QA (🩵 cyan — `colour43`)

**Purpose:** Visual verification, test runs, and build validation. Never writes feature code.

**Tool tier:** Build + browser
- Read, Glob, Grep, Bash
- `mcp__playwright__*` (all browser tools)
- `mcp__contentful__get_*`, `mcp__contentful__search_*` (read-only)

**Skills:**
- `/skills:contentful-live-preview-verify` — live preview visual QA
- `/skills:test-nt-personalization` — NT variant visual QA
- `/piv validate` — full test + type + lint pass

**QA rules:**
- Visual confirmation via Playwright MCP is mandatory before marking any test PASS
- Navigate to `/page/home?preview=true` (NOT `/` — root is static placeholder)
- Take screenshot at every meaningful state change
- Check browser console for errors: `mcp__playwright__browser_console_messages`
- For NT: use Preview bar or `identify()` to verify variant swap, screenshot both states
- Port 3000 is reserved for live preview — use 3001+ for parallel test sessions

**Prompt template:**
```
You are a QA agent for the Metafi project. Your job is to verify that [FEATURE] works correctly.

Start by running /prime, then:
1. Confirm dev server is running on the correct port
2. Run /piv validate (types + lint + tests)
3. Use Playwright MCP for visual testing:
   - Navigate to /page/home?preview=true
   - Check console for errors
   - Screenshot each state
4. For NT: run /skills:test-nt-personalization
5. Report PASS/FAIL to ORCH with screenshots

Do NOT modify code. If you find a bug, describe it to ORCH.
```

---

### SERVER (⚫ gray — `colour244`)

**Purpose:** Run and manage the dev server. Separate tmux window.

**Tool tier:** Bash only
- Bash (bun run dev, kill ports, check health)

**Rules:**
- Check `package.json` for correct dev script before starting
- Choose available port based on project conventions (3000 for live preview, 3001+ for other instances)
- Always `rm -rf .next` before restarting if there are module errors
- Tail the log after boot to catch errors before declaring ready

**No skills needed for SERVER role.**

---

### CONTENTFUL (🟣 purple — `colour129`)

**Purpose:** Contentful-only work — create/update entries, publish content, manage environments.

**Tool tier:** Contentful MCP only
- `mcp__contentful__*` (all tools)

**Skills:**
- `/skills:contentful-migration` (for schema changes)
- `/skills:contentful-mcp-create-model` (for entry creation)
- `/skills:contentful-guide` (for routing/vocabulary)

---

## Tool Tier Summary

| Tier | Tools | Roles |
|------|-------|-------|
| Read-only | Glob, Read, Grep, `mcp__contentful__get_*`/`list_*`/`search_*` | RESEARCH |
| Write-Contentful | `mcp__contentful__create_*`/`update_*`/`publish_*` | CONTENTFUL, DEV, NT-DEV |
| Build | Bash (bun run/test/tsc/lint), Write, Edit | DEV, NT-DEV |
| Browser | `mcp__playwright__*` | QA |

---

## tmux Color Reference

| Role | Color | Code |
|------|-------|------|
| ORCH | Orange | `colour214` |
| RESEARCH | Red | `colour196` |
| DEV | Blue | `colour33` |
| NT-DEV | Blue (dark) | `colour27` |
| QA | Cyan | `colour43` |
| SERVER | Gray | `colour244` |
| CONTENTFUL | Purple | `colour129` |

---

## Non-Negotiable Rules for All Agents

1. **Start every agent with `/prime`** (except pure CONTENTFUL/SERVER agents)
2. **No agent commits until QA passes** — DEV reports to ORCH, ORCH tells QA, QA confirms, then commit
3. **Only ORCH communicates with the user** — agent-to-agent communication goes through ORCH
4. **Use pane IDs (`%N`), never pane indices** — indices drift on every split (Bug 3)
5. **`send-keys` always uses `-l` for text, separate `Enter` call** (Bugs 1 and 2)
6. **ORCH never writes code or edits source files** — delegate to DEV/NT-DEV
