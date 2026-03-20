---
description: Create content types and entries in Contentful using the Contentful Management MCP. Use at Milestone 3 to create the content model and sample entries. Includes exact tool call sequence and locale wrapper format.
---

# Contentful MCP: Create Content Model

This skill creates content types and entries in Contentful using the Contentful Management MCP server. Follow this at Milestone 3 of the add-contentful-block workflow.

## Required Information

Before doing anything else, resolve the Space ID and Environment ID:

### Resolve Space ID (MANDATORY FIRST STEP)

1. Read `.env` (and `.env.local` if it exists) and look for `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ENVIRONMENT`.
2. If both are found and non-empty, use those values for the rest of this session.
3. If either is missing or empty, **ask the user**:
   > "I couldn't find `CONTENTFUL_SPACE_ID` in your .env file. Which Contentful space should I use? Please provide:
   > - Space ID (e.g. `abc123xyz`)
   > - Environment (default: `master`)"
4. Store the resolved values as `SPACE_ID` and `ENVIRONMENT_ID` for use throughout this skill.
5. **Confirm with the user** before making any changes: "I'll be making changes to space `{SPACE_ID}` / environment `{ENVIRONMENT_ID}`. Proceed?"

**Do NOT proceed until the space is confirmed. This prevents accidental writes to the wrong space.**

- **Space ID** – resolved from `.env` or user input
- **Environment ID** – resolved from `.env` (`CONTENTFUL_ENVIRONMENT`) or `master` as default
- **Content model proposal** – From Phase 2 of the workflow

## Step 1: Verify Existing Content Types

Before creating, check if the content type already exists:

```
Tool: get_content_type
Arguments:
  contentTypeId: "[typename]"
  spaceId: "{SPACE_ID}"
  environmentId: "{ENVIRONMENT_ID}"
```

If it exists, skip to Step 3. If it returns an error, proceed to create it.

## Step 2: Create Content Type

### CRITICAL: Content Type ID → GraphQL __typename

**How Contentful generates the Api Identifier:**
- When you create a content type, the **Name** auto-generates the **Api Identifier**
- The auto-generation uses **camelCase**: first word lowercase, subsequent words capitalized
- Spaces create word boundaries

**Examples:**
| Name (what you type) | Api Identifier (auto-generated) | GraphQL __typename |
|---------------------|--------------------------------|-------------------|
| "Faq Item" | `faqItem` | `FaqItem` |
| "FaqItem" | `faqitem` | `Faqitem` |
| "My Blog Post" | `myBlogPost` | `MyBlogPost` |

**Best Practice:** Use **spaces between words** in the Name to ensure proper word boundaries.

See **LL-006** in lessons-learned.md for the full story.

### 2a. Create the content type

```
Tool: create_content_type
Arguments:
  name: "[TypeName]"
  description: "[Description]"
  displayField: "internalName"
  fields: [
    {
      "id": "internalName",
      "name": "Internal Name",
      "type": "Symbol",
      "required": true
    }
    // Add other fields...
  ]
  spaceId: "{SPACE_ID}"
  environmentId: "{ENVIRONMENT_ID}"
```

### Field Type Reference

| Contentful Type | MCP `type` value | Additional config |
|-----------------|------------------|-------------------|
| Short text | `Symbol` | - |
| Long text | `Text` | - |
| Integer | `Integer` | - |
| Decimal | `Number` | - |
| Boolean | `Boolean` | - |
| JSON | `Object` | - |
| Media (single) | `Link` | `linkType: "Asset"` |
| Reference (single) | `Link` | `linkType: "Entry"` |
| Media (multiple) | `Array` | `items: { type: "Link", linkType: "Asset" }` |
| Reference (multiple) | `Array` | `items: { type: "Link", linkType: "Entry" }` |

### Field Naming Conventions

**Media/Image Fields:**
| Use Case | Contentful Field ID | Mapped Name (TypeScript) |
|----------|-------------------|-------------------------|
| Main/foreground image | `media` | `image` |
| Background image | `backgroundMedia` | `backgroundImage` |

### IMPORTANT: Avoid "Collection" in Field IDs (LL-007)

- Field ID `items` → GraphQL `itemsCollection` ✅
- Field ID `itemsCollection` → GraphQL `itemsCollectionCollection` ❌

Use simple names like `items`, `faqs`, `tabs`.

### 2b. Publish the content type

```
Tool: publish_content_type
Arguments:
  contentTypeId: "[typename]"
  spaceId: "{SPACE_ID}"
  environmentId: "{ENVIRONMENT_ID}"
```

### 2c. For linked types, create them first

1. Create linked type (e.g., `faqItem`)
2. Publish linked type
3. Create parent type (e.g., `faq`)
4. Publish parent type

## Step 3: Create Entries

### Critical: Locale Wrapper

**ALL field values MUST be wrapped in a locale object:**

```json
{
  "fieldName": {
    "en-US": "value"
  }
}
```

### 3a. Create the entry

```
Tool: create_entry
Arguments:
  contentTypeId: "[typename]"
  fields: {
    "internalName": { "en-US": "My Entry Name" },
    "title": { "en-US": "My Title" }
  }
  spaceId: "{SPACE_ID}"
  environmentId: "{ENVIRONMENT_ID}"
```

### Reference Field Values

**Multiple references:**
```json
{
  "items": {
    "en-US": [
      { "sys": { "type": "Link", "linkType": "Entry", "id": "[ENTRY_ID_1]" } },
      { "sys": { "type": "Link", "linkType": "Entry", "id": "[ENTRY_ID_2]" } }
    ]
  }
}
```

### 3b. Publish the entry

```
Tool: publish_entry
Arguments:
  entryId: "[ENTRY_ID]"
  spaceId: "{SPACE_ID}"
  environmentId: "{ENVIRONMENT_ID}"
```

## Step 4: Update Page Sections (If Needed)

If the Page content type needs to allow the new block type in its `sections` field:

1. Get the current Page content type with `get_content_type`
2. Update the `sections` field's validations to include the new type
3. Publish the updated Page content type

## Common Errors

**"Field value must include locale"**
- Every field value needs `{ "en-US": value }` wrapper

**"Content type not found"**
- Must be published before creating entries
- Check contentTypeId is case-sensitive

**"Invalid link"**
- The linked entry must exist and be published

## Execution Order

1. Create linked content types (if any)
2. Publish linked content types
3. Create parent content type
4. Publish parent content type
5. Create linked entries (if any)
6. Publish linked entries
7. Create parent entry with references
8. Publish parent entry
9. (If needed) Update Page content type to allow new block

## Pre-Creation Checklist (MANDATORY)

- [ ] Content type name uses spaces for word boundaries — per LL-006
- [ ] Field IDs do NOT include "Collection" suffix — per LL-007
- [ ] Image fields use `media` / `backgroundMedia` — per LL-001
- [ ] Expected `__typename` documented before creation

---

## Completion Checklist

- [ ] All content types created and published
- [ ] At least one entry created and published
- [ ] (If nested) Linked entries created and published first
- [ ] (If needed) Page content type updated
- [ ] Verified `__typename` matches code expectations

Do not mark Milestone 3 complete until content exists in Contentful and is accessible.
