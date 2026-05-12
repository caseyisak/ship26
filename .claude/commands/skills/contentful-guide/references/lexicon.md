# Contentful Lexicon

## A

**API Key** — A CDA/CPA credential that allows read-only access to content. Space-scoped. Can be restricted to specific environments.

**Asset** — A binary file (image, video, PDF) stored in Contentful. Has its own URL, title, description, and dimensions.

## C

**CDA (Content Delivery API)** — The read-only API for published content. Fast, CDN-backed. Used for production rendering.

**CMA (Content Management API)** — The read-write API requiring a Personal Access Token. Used by migration scripts and MCP tools.

**Content Type (CT)** — The schema definition for a type of content (like a table schema or class definition). Defines fields, validations, and display settings.

**CPA (Content Preview API)** — The read-only API for draft (unpublished) content. Used for live preview. Requires a separate preview token.

## D

**Draft** — An entry that has been created or modified but not published. Only visible via CPA. Next.js `draftMode()` uses CPA.

## E

**Entry** — An instance of a Content Type. Like a row in a database table. Has a `sys.id`, a content type, fields, and publication status.

**Environment** — A branch of content within a Space. Has its own entries, assets, and content types. Like a git branch.

**Environment Alias** — A stable pointer to an environment (like `HEAD` in git). Example: `master` alias pointing to the current prod environment.

## F

**Field** — A piece of data within a Content Type. Has a type (Symbol, RichText, Link, etc.), required flag, validations, and a localization setting.

**Fragment** (GraphQL) — A reusable selection set. Used in this project to define field selections per block type.

## G

**GraphQL** — The API style used in this project for all content reads. Queries go to `https://graphql.contentful.com/content/v1/spaces/{spaceId}`.

## L

**Linked Entry** — An entry referenced by another entry via a Link field. Published separately.

**Live Preview** — Contentful's SDK that sends real-time field changes from the Contentful UI (parent) into an iframe (your app). Uses postMessage.

**Locale** — A language/region variation of content (e.g., `en-US`, `de-DE`). Fields can be localized or not.

## M

**MCP (Contentful MCP Server)** — Claude tool for managing Contentful via the CMA. Creates/updates/publishes CTs and entries without manual UI work.

**Migration** — A versioned script that modifies the content model. Written in JS using the `contentful-migration` package.

## N

**NT** — Ninetailed. The personalization engine sold as "Contentful Personalization" or "Contentful Experiences".

## P

**Personal Access Token (PAT)** — A CMA credential scoped to a user. Used by migration scripts and MCP servers.

**Publication** — Making an entry or asset publicly available via CDA. Unpublished entries are only visible via CPA.

## R

**Reference** — A field that links to another entry or asset (Link field or Array of Links).

**Rich Text** — A structured text format that supports inline and block content, embedded entries, and embedded assets.

## S

**SDK** — Software Development Kit. In this project: the `@ninetailed/experience.js-next` SDK for personalization.

**Space** — The top-level container in Contentful. Contains environments, content types, entries, assets, and API keys. Our space: `uumzxfocy3ef`.

**sys.id** — The unique identifier for any Contentful resource (entry, asset, CT). Stable across environments.

## T

**typename / `__typename`** — GraphQL meta-field that returns the Content Type name (e.g., `"Hero"`, `"Faq"`). Used by the block-renderer to dispatch to the correct component. Must survive untransformed to the client.

## U

**UNRESOLVABLE_LINK** — A GraphQL error code returned when a linked entry is unpublished or deleted. Treated as a soft error in `fetchGraphQL`.

## W

**Webhook** — A Contentful event notification (entry published, CT created, etc.) that can trigger external systems.
