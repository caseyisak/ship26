# LL-047: Webpack ignore pattern blocks HMR in worktrees

## Symptom
Dev server starts, pages compile on first request, but file edits are never picked up. HMR never fires. New files/routes return 404. Stale `.next` cache persists indefinitely.

## Root cause
`next.config.ts` had `**/metafi-worktrees/**` in `config.watchOptions.ignored`. Since worktrees live at `/Users/.../Dev/metafi-worktrees/<branch>/`, this glob matches the entire working directory. Webpack's file watcher ignores ALL changes — no HMR, no recompilation.

## Fix
Remove `**/metafi-worktrees/**` from the ignored array. If you need to ignore OTHER worktrees (not the current one), use a more specific pattern or only ignore `.claude/worktrees/`.

```diff
- ignored: ['**/node_modules/**', '**/.playwright-mcp/**', '**/.claude/worktrees/**', '**/metafi-worktrees/**'],
+ ignored: ['**/node_modules/**', '**/.playwright-mcp/**', '**/.claude/worktrees/**'],
```

After fixing, clear `.next` and restart: `rm -rf .next && bun run dev`

## Related files
- `next.config.ts` — webpack config
- `.next/` — stale cache from initial compilation
