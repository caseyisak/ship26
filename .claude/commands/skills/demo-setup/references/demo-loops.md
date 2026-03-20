# Demo Loops Reference

Demo loops are reusable, self-contained kits in `demo-loops/` at the repo root.
Each loop has a seed script, content types, sample entries, and talking points.

## Available loops

| Loop | User interest | What it shows | Key routes |
|------|--------------|---------------|-----------|
| `multi-channel` | Multi-channel content | Same Contentful content on web + `/app` mobile frame side-by-side | `/`, `/app`, `/preview/banner/[entryId]` |
| `personalization` | Personalization / A/B | ntExperiences content variants switching between audiences | `/page/[slug]` |
| `data-viz` | Data visualization | DataViz block with customer-relevant CSV — bar, treemap, radar, bubble, funnel | `/page/[slug]` |
| `live-preview` | Editor experience | Side-by-side Contentful editor + live preview iframe | Contentful live preview URL |
| `blog` | Content publishing | Blog listing + detail pages with rich text, TOC, author bio | `/blog`, `/blog/[slug]` |
| `page-sections` | Custom page sections | Hero, FAQ, Features, TabbedContent on a demo page | `/page/[slug]` |

## How to activate a loop

Until `demo-loops/[loop]/bundle.sh` seed scripts are built, manually create the content via MCP:

1. Set the active environment to the demo env: `CONTENTFUL_ENVIRONMENT=[customer-slug]`
2. Use `mcp__contentful__create_content_type` + `mcp__contentful__create_entry` to create the types and entries
3. Publish all entries (`mcp__contentful__publish_entry`) — child entries before parents

## Selecting loops during intake

Match user interest → loop:
- "show web and mobile together" → `multi-channel`
- "personalization", "A/B", "different audiences" → `personalization`
- "analytics", "charts", "data" → `data-viz`
- "how editors use it", "live editing" → `live-preview`
- "blog", "articles", "publishing" → `blog`
- "landing page", "hero", "FAQ" → `page-sections`

Multiple loops can be combined in one demo.
