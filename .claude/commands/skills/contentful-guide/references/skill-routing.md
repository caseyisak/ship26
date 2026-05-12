# Skill Routing Guide

## Decision Tree

```
What are you trying to do?
│
├── Build a NEW block or content type from scratch
│   └── /add-contentful-block  ← ALWAYS start here
│
├── Debug live preview (field changes not appearing)
│   └── /skills:contentful-live-preview-verify
│
├── Debug personalization / NT audiences / experiences
│   └── /skills:contentful-personalization → sub-skill: live-debug or doctor
│
├── Implement NEW personalization on an existing block
│   └── /skills:contentful-personalization → sub-skill: develop
│
├── Audit the full NT setup (health check)
│   └── /skills:contentful-personalization → sub-skill: doctor
│
├── Write a schema migration script
│   └── /skills:contentful-migration
│
├── Write or debug a GraphQL query/fragment
│   └── /skills:contentful-graphql-nextjs
│
├── Set up a new customer demo from scratch
│   └── /skills:demo-setup
│
├── Test NT personalization in a demo
│   └── /skills:test-nt-personalization
│
├── Don't know which Contentful API to use
│   └── /skills:contentful-guide (this skill) → see API Chooser
│
└── Multi-agent team needed for complex work
    └── /spin-team
```

## By Symptom

| Symptom | Skill | Sub-skill |
|---------|-------|----------|
| Live preview shows stale data | `contentful-live-preview-verify` | — |
| Experience/variant not showing | `contentful-personalization` | live-debug |
| `identify()` not matching audience | `contentful-personalization` | live-debug |
| New NT experience to build | `contentful-personalization` | develop |
| Full NT health check | `contentful-personalization` | doctor |
| Query complexity error (400) | `contentful-graphql-nextjs` | — |
| UNRESOLVABLE_LINK errors | `contentful-graphql-nextjs` | — |
| New block for sandbox | `add-contentful-block` | — |
| New block for demo | `add-contentful-block` then `demo-setup` | — |
| Schema rollback needed | `contentful-migration` | — |
| New field on existing CT | `contentful-migration` | — |
| Full demo from zero | `demo-setup` | — |

## Tool Tier by Task

| Tier | Tools | When |
|------|-------|------|
| Discovery (read-only) | Glob, Read, Grep, `mcp__contentful__list_*`, `mcp__contentful__get_*`, `mcp__contentful__search_*` | Research, audit, understand |
| Contentful write | `mcp__contentful__create_*`, `mcp__contentful__update_*`, `mcp__contentful__publish_*` | Create/update CTs and entries |
| Code build | Bash (bun run/test/tsc), Write, Edit | Implementation, tests |
| Browser/visual | `mcp__playwright__*` | Visual QA, live preview test |

Never jump to write tier without completing discovery.
