# Project Instructions

## Package Manager: Bun

This project uses **bun** for all package and script operations. Do not use npm, yarn, or pnpm.

| Use case | Use this | Do not use |
|----------|----------|------------|
| Install dependencies | `bun install` | `npm install` |
| Add a package | `bun add <pkg>` | `npm install <pkg>` |
| Add dev dependency | `bun add -d <pkg>` | `npm install -D <pkg>` |
| Run dev server | `bun run dev` | `npm run dev` |
| Build | `bun run build` | `npm run build` |
| Run tests | `bun test` or `bun run test` | `npm test` |
| Run scripts from package.json | `bun run <script>` | `npm run <script>` |
| Execute a script/file | `bun run <file>` or `bun <file>` | `npx` / `node` |

- In docs, snippets, and terminal commands: use `bun` and `bun run` only.
- For Next.js (e.g. `next dev`, `next build`): invoke via `bun run dev`, `bun run build`, etc.
- Commit and use `bun.lockb`; do not add or rely on `package-lock.json` or `yarn.lock`.

---

## Contentful Live Preview Debugging

When debugging Contentful live preview issues, use this context.

### Two-Context Architecture

**PARENT (app.contentful.com)**
- The Contentful web app (entry editor).
- The Contentful SDK runs here and sends live updates into the iframe.

**IFRAME (localhost:XXXX)**
- Your Next.js app running locally (or deployed preview URL).
- Receives live updates from the SDK. **This is where you debug rendering issues.**

When the user says "preview is broken," clarify: are they talking about the **parent** (entry form) or the **iframe** (rendered content)? Most issues are in the iframe.

### Data Flow Inspection Points

- **`[useFetchEmbeddedEntries]`** – Console logs for fetched/merged embedded entries.
- **`/api/fetch-deferred-entries`** – Network: status 200 and response payload.
- **Entry ID consistency** – Rich text JSON `EMBEDDED_ENTRY` nodes must exist in `content.links.entries`.
- **SDK connection** – Console: `useLiveUpdates` / `useContentfulLiveUpdates` / `LivePreviewProvider`.
- **Hydration** – React hydration warnings in console.

If API calls succeed but UI shows incomplete data, the bug is likely in **merge/replace logic** in `src/hooks/use-fetch-embedded-entries.ts`.

### Lessons Learned

Before concluding, check **`documentation/lessons-learned.md`** (LL-001 through LL-008) for known error patterns.

For systematic browser inspection, invoke the **contentful-live-preview-verify** skill at `.claude/commands/skills/contentful-live-preview-verify.md`.
