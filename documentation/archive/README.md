# Archived Documentation

This folder holds documentation that has been archived because it conflicts with the **current implementation**.

The project uses **App Router + GraphQL** (see `src/services/contentful/queries.ts`, `src/app/`). These archived docs reference older decisions (Pages Router, REST/SDK, avoid GraphQL) and can mislead agents or developers.

## Archived Files

| File | Reason |
|------|--------|
| `chatgpt-isr.md` | Recommends Pages Router and REST/SDK; project uses App Router + GraphQL. |
| `ISR-convo.md` | Historical conversation context; superseded by `migration-plan.md`. |

For current architecture and decisions, use the docs in `documentation/` (e.g. `migration-plan.md`, `CODEBASE-ARCHITECTURE.md`).
