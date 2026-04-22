# Session Handoff — 2026-03-30
## Bears Demo Audit + Worktrees/Agents Orientation

---

## What this session covered

1. **Bears demo status audit** — checked the actual `bears` Contentful env against the open todos in `documentation/bears-demo.md`
2. **Worktrees 101** — wrote `documentation/worktrees-101.md` covering branches vs worktrees, the demo-per-worktree pattern, CC + agent coordination, and gotchas
3. **Worktree/agent workflow alignment** — established the agent team safety check rule (saved to memory)

---

## Bears Demo — Actual State (as of 2026-03-30)

The `documentation/bears-demo.md` "Open Work" section is significantly out of date. Most of Priority 1 is done.

### Contentful `bears` env — what exists

| Entry | Status |
|---|---|
| Game: "Wk14 vs Rams 2025" (Week 14, home, Dec 14 2025) | Published ✅ |
| MediaWrapper: "Wk14 Gameday Media" — all 3 channels, 3 aspect ratios, asset linked | Published ✅ |
| Banner: "Gameday Banner — Bears vs Rams" — linked to Game + MediaWrapper | Published ✅ |
| Banner: "Banner" (stub/test entry, ignore) | Published |
| SocialPost: "Wk14 Gameday — X Post" | Published, has unpublished changes ⚠️ |
| SocialPost: "Wk14 Gameday — Instagram Post" | Published, has unpublished changes ⚠️ |
| SocialPost: "Wk14 Gameday — Facebook Post" | Published ✅ |

Note: game is vs **Rams** not Lions (bears-demo.md said Lions — minor discrepancy, not a problem).

### Still blocking the demo

1. **API key access** — must verify in Contentful UI: Settings → API Keys → confirm `bears` env is checked for delivery + preview tokens. Cannot check via MCP.
2. **Publish pending changes** on X and Instagram social posts (they show `fieldStatus: changed`)
3. **Preview URLs** — must verify Banner and SocialPost content types have preview URLs configured in Contentful
4. **Contentful Release** — "Wk14 Gameday Release" not created yet (nice-to-have for demo story)
5. **Bears logo** — `C` placeholder still in phone frame, mobile app, social card components

### No worktree yet

`demo/bears` branch exists. No worktree checked out. To set up before demo work:

```bash
bash scripts/worktree-add.sh demo/bears
claude /Users/casey.lisak/Dev/metafi-worktrees/demo-bears
```

Then in the bears CC session, read `documentation/bears-demo.md` to orient.

---

## Worktrees/Agents — What Was Established

### Key decisions and rules

- Solo demo work → checkout the branch, work normally, that's fine
- Agent team → must be in the worktree first (not just on the branch in the main repo dir)
- Agent team safety rule saved to memory: `feedback_agent_team_worktree_check.md` — before any agent team, check branch + working directory, warn if on `demo/*` without the matching worktree
- Worktree CC sessions don't inherit MEMORY.md (different path hash) — orient them by saying "read documentation/bears-demo.md"

### New docs written this session

- `documentation/worktrees-101.md` — full 101 on branches vs worktrees, the demo-per-worktree pattern, CC + agent coordination, gotchas, cheat sheet

---

## What to do next session

**Bears demo prep (priority):**
1. Open bears worktree CC: `bash scripts/worktree-add.sh demo/bears` → `claude /metafi-worktrees/demo-bears`
2. Verify API key access in Contentful UI
3. Publish the X + Instagram social post drafts
4. Confirm preview URLs on Banner + SocialPost content types
5. Provide Bears logo file → I'll wire it into the 3 placeholder locations
6. Optionally: create Contentful Release for the demo story

**Ongoing:**
- AIO/AEO/GEO demo loop (main branch work) — spec is in `.claude/specs/001-aio-aeo-geo-demo/tasks.md`, fully ready to execute

---

## Archive instructions

Once the next CC session has read and processed this file, move it to `archive/handoffs/` (create the folder if needed).
