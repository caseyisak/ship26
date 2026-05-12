---
name: contentful-guide
description: Routing and vocabulary layer for Contentful work. Use to orient a session, choose the right Contentful API (GraphQL vs REST, CDA vs CPA vs CMA), understand environment aliases, and route to the correct sub-skill. Start here when you're not sure which Contentful skill to use.
metadata:
  author: skills-upgrade
  version: 1.0.0
allowed-tools:
  - Read
  - Glob
  - Grep
  - mcp__contentful__get_initial_context
  - mcp__contentful__list_environments
  - mcp__contentful__get_space
  - mcp__contentful__list_content_types
  - mcp__contentful__get_org
---

# Contentful Guide

Orientation and routing layer. Answers: *which API*, *which environment*, *which skill*.

## This Project's Contentful Config

| Setting | Value |
|---------|-------|
| Space ID | `uumzxfocy3ef` |
| Primary env | `master` |
| API used | **GraphQL** (Content Delivery API / GraphQL endpoint) |
| MCP server | `@contentful/mcp-server` — CMA (management) calls |
| Live preview | Contentful Preview API (CPA) via `CONTENTFUL_PREVIEW_ACCESS_TOKEN` |

## API Chooser

| When you need to... | Use |
|--------------------|-----|
| Read published content on site | GraphQL CDA — `fetchGraphQL({ preview: false })` |
| Read draft content in live preview | GraphQL CPA — `fetchGraphQL({ preview: true })` |
| Create/update/delete CTs or entries | CMA via Contentful MCP |
| Write migration scripts | `contentful-migration` package + CMA token |
| Search entries programmatically | Contentful MCP `search_entries` |

**Never use the REST SDK (`contentful` npm package) in this project.** All content reads are GraphQL.

## Environment Strategy

| Environment | Purpose | NT Data Bucket |
|------------|---------|---------------|
| `master` | Source of truth — sandbox, all blocks | Main |
| `bears` | Bears demo (historical) | Development |
| `[customer]` | New demo branch | Development |

### Environment Aliases (Issue #96)

Contentful supports environment aliases — a stable name pointing to an environment. This project is investigating using a `master` alias so all demos point to the same alias rather than hardcoding `master` everywhere. If this is resolved, check `TASKS.md` issue #96 for the decision.

**Current pattern:** All demo environments specify the env name explicitly in `.env.local`.

## Vocabulary Reference

| Term | Meaning |
|------|---------|
| Content Type (CT) | Schema definition (like a table schema) |
| Entry | A record/instance of a CT (like a row) |
| Asset | A media file (image, video, PDF) |
| Space | The top-level container (our space: `uumzxfocy3ef`) |
| Environment | A branch of content (like a git branch) |
| Environment alias | A stable pointer to an environment (like `HEAD` in git) |
| CDA | Content Delivery API — published content, fast, CDN-backed |
| CPA | Content Preview API — draft content, for live preview |
| CMA | Content Management API — create/update/delete, requires CMA token |
| GraphQL | The API style used in this project for content reads |
| Live Preview | Contentful's SDK that pushes real-time field changes into an iframe |
| NT | Ninetailed — the personalization engine (sold as "Contentful Experiences") |
| Experience | Ninetailed concept: an A/B test or personalization rule. NOT the deprecated Studio SDK. |
| Draft mode | Next.js `draftMode()` + CPA token — activates live preview |

## Skill Routing

| Task | Skill |
|------|-------|
| Build new block end-to-end | `/add-contentful-block` |
| Fix broken live preview | `/skills:contentful-live-preview-verify` |
| Debug personalization / NT | `/skills:contentful-personalization` |
| Schema changes / new CT | `/skills:contentful-migration` |
| Custom GraphQL query patterns | `/skills:contentful-graphql-nextjs` |
| New demo from scratch | `/skills:demo-setup` |
| Test NT personalization | `/skills:test-nt-personalization` |

## Quick-Start Checklist (Session Start)

Before any Contentful work in a new session:

1. `mcp__contentful__get_initial_context` — confirm space/env
2. `mcp__contentful__list_environments` — confirm target env exists
3. Read `TASKS.md` — know what's open
4. Check `documentation/lessons-learned/index.md` — avoid known errors

## Reference Files

| File | Topic |
|------|-------|
| `references/lexicon.md` | Full Contentful vocabulary A–Z |
| `references/docs-map.md` | Where to find Contentful docs by topic |
| `references/skill-routing.md` | Detailed routing rules by task type |
