# Contentful Integration Guide

## How NT and Contentful Connect

NT experiences are stored AS Contentful entries. The NT app in Contentful UI reads these entries and renders the experience builder UI on top of them. When your Next.js app queries Contentful for a block, it gets back the experience data as linked entries — no separate NT API call needed for content.

## Required Setup in Contentful

### 1. Install NT App

Contentful → Apps → Marketplace → "Ninetailed"

Install in the target space. Configure with:
- NT API Key (Development bucket for demo envs)
- NT Secret (from NT dashboard)

### 2. Content Types Must Exist

`nt_experience`, `nt_audience`, `nt_mergetag` must be present. NT installs these when you first install the app. If they're missing from a new env:

```
# Check via MCP
mcp__contentful__list_content_types
```

If missing, either:
- Re-install the NT app in that environment
- Or write a migration script to create them

### 3. Enable Experiences on Your Block CTs

In Contentful UI → Content Model → [Your Block CT]:
- NT app adds an "Experiences" tab to the entry editor
- This appears once NT is installed

### 4. `ntExperiencesCollection` Field

NT automatically adds an `ntExperiencesCollection` reference array field to any CT you enable experiences on. This field holds the linked `nt_experience` entries.

**In GraphQL:** This field is available as `ntExperiencesCollection` on any CT where experiences are enabled.

## Creating an Experience via Contentful UI

1. Open the entry you want to personalize
2. Click the "Experiences" tab (added by NT app)
3. Click "Create Experience"
4. Select type: A/B Test or Personalization
5. For personalization: select or create an audience
6. Create variant entries (same CT, different field values)
7. Publish the experience

## Creating an Experience via MCP

```
# 1. Create audience entry
mcp__contentful__create_entry
  contentTypeId: "nt_audience"
  fields:
    nt_name: { "en-US": "Enterprise Buyers" }
    # Do NOT set nt_audience_id — NT sets it automatically
    # nt_rules requires specific JSON format — set in UI

# 2. Open entry in Contentful UI to trigger nt_audience_id auto-fill

# 3. Create variant entry (same CT as baseline)
mcp__contentful__create_entry
  contentTypeId: "hero"
  fields: { ...variant fields... }
mcp__contentful__publish_entry (variant)

# 4. Create experience
mcp__contentful__create_entry
  contentTypeId: "nt_experience"
  fields:
    nt_name: { "en-US": "Enterprise Hero" }
    nt_type: { "en-US": "nt_personalization" }
    nt_audience: { "en-US": { sys: { type: "Link", linkType: "Entry", id: "AUDIENCE_ID" } } }
    nt_variants: { "en-US": [{ sys: { type: "Link", linkType: "Entry", id: "VARIANT_ID" } }] }
mcp__contentful__publish_entry (experience)

# 5. Link experience to baseline entry's ntExperiencesCollection field
```

**NOTE:** Publish order matters — always publish audience + variants before the experience.
