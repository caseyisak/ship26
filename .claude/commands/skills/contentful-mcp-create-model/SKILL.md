---
name: contentful-mcp-create-model
description: Create content types and entries in Contentful using the Contentful Management MCP tools. Use at Milestone 3 when user says "create the content type", "create the content model", "add this to Contentful", "create sample entries", "set up Contentful", or "Milestone 3". Includes exact tool call sequence and locale wrapper format. Do NOT use for querying existing content (call mcp__contentful__get_content_type directly) or for adding GraphQL types in code (use contentful-block-graphql-types).
metadata:
  author: metafi-project
  version: 1.0.0
---

# Contentful MCP: Create Content Model

This skill creates content types and entries in Contentful using the Contentful Management MCP server. Follow this at Milestone 3 of the add-contentful-block workflow.

## Required Information

Before using this skill, you need:
- **Space ID** – The Contentful space ID (check `.env` for `CONTENTFUL_SPACE_ID`)
- **Environment ID** – Usually `master` (check `.env` for `CONTENTFUL_ENVIRONMENT`)
- **Content model proposal** – From Phase 2 of the workflow

## MCP Tools

All operations use the `mcp__contentful__*` tools available in Claude Code. Key tools:

| Operation | Tool |
|-----------|------|
| Check existing content type | `mcp__contentful__get_content_type` |
| Create content type | `mcp__contentful__create_content_type` |
| Publish content type | `mcp__contentful__publish_content_type` |
| Create entry | `mcp__contentful__create_entry` |
| Publish entry | `mcp__contentful__publish_entry` |
| List content types | `mcp__contentful__list_content_types` |

Space ID: `uumzxfocy3ef`, Environment: `master` (from `.env.local`).

## Step 1: Verify Existing Content Types

Before creating, check if the content type already exists:

```
Tool: get_content_type
Arguments:
  contentTypeId: "[typename]"
  spaceId: "[SPACE_ID]"
  environmentId: "master"
```

If it exists, skip to Step 3 (create entries). If it returns an error, proceed to create it.

## Step 2: Create Content Type

### CRITICAL: Content Type ID → GraphQL __typename (Documentation-Backed)

**Source:** [Contentful GraphQL API Reference - Types](https://www.contentful.com/developers/docs/references/graphql/#/reference/schema-generation/types)

> "Type name is the **pascalcase** version of the **content type ID**, stripped of non-alphanumeric characters." 

**How Contentful generates the Api Identifier (content type ID):**
- When you create a content type in Contentful UI, the **Name** auto-generates the **Api Identifier**
- The auto-generation uses **camelCase**: first word lowercase, subsequent words capitalized
- Spaces create word boundaries

**Examples:**
| Name (what you type) | Api Identifier (auto-generated) | GraphQL __typename |
|---------------------|--------------------------------|-------------------|
| "Faq Item" | `faqItem` | `FaqItem` |
| "FaqItem" | `faqitem` | `Faqitem` |
| "FAQ Item" | `faqItem` | `FaqItem` |
| "My Blog Post" | `myBlogPost` | `MyBlogPost` |

**Best Practice:**
1. Use **spaces between words** in the Name to ensure proper word boundaries
2. The code must match what Contentful returns - do NOT invent our own casing
3. After creating a content type, verify the Api Identifier before writing code
4. In code, use the exact __typename that Contentful will return:
   - Check the Api Identifier in Contentful
   - Apply PascalCase transformation
   - That's your __typename

**If using MCP to create content types:**
- Check if the tool accepts `contentTypeId` parameter
- If auto-generated, verify the resulting ID matches expected __typename
- Query a test entry via GraphQL to confirm the actual __typename returned

See **LL-006** in lessons-learned.md for the full story on this bug.

### 2a. Create the content type

**IMPORTANT:** Verify the resulting Api Identifier (content type ID) matches your expected `__typename` after PascalCase transformation. Contentful MCP's `create_content_type` may auto-generate the ID from the `name` parameter - always verify the actual ID created.

```
Tool: create_content_type
Arguments:
  name: "[TypeName]"
  description: "[Description of what this content type is for]"
  displayField: "internalName"
  fields: [
    {
      "id": "internalName",
      "name": "Internal Name",
      "type": "Symbol",
      "required": true
    },
    // Add other fields...
  ]
  spaceId: "[SPACE_ID]"
  environmentId: "master"
```

**Note:** If the MCP tool doesn't accept a `contentTypeId` parameter and auto-generates from `name`, ensure the `name` is PascalCase (e.g., `"Faq"` not `"faq"`) so the generated ID matches.

> See [`references/field-types.md`](references/field-types.md) for the full field type reference.

> See [`references/field-types.md`](references/field-types.md) for field naming conventions (media→image mapping).

> See [`references/field-types.md`](references/field-types.md) for the Collection suffix rule (LL-007).

### Example: FAQ Content Type

```
Tool: create_content_type
Arguments:
  name: "Faq"
  description: "FAQ section with expandable questions and answers"
  displayField: "internalName"
  fields: [
    {
      "id": "internalName",
      "name": "Internal Name",
      "type": "Symbol",
      "required": true
    },
    {
      "id": "title",
      "name": "Title",
      "type": "Symbol"
    },
    {
      "id": "description",
      "name": "Description",
      "type": "Text"
    },
    {
      "id": "items",
      "name": "Items",
      "type": "Array",
      "items": {
        "type": "Link",
        "linkType": "Entry",
        "validations": [{ "linkContentType": ["faqItem"] }]
      }
    }
  ]
  spaceId: "[SPACE_ID]"
  environmentId: "master"
```

### 2b. Publish the content type

Content types must be published before entries can be created:

```
Tool: publish_content_type
Arguments:
  contentTypeId: "[typename]"
  spaceId: "[SPACE_ID]"
  environmentId: "master"
```

### 2c. For linked types, create them first

If your content type references another type (like FAQ → FaqItem), create and publish the linked type FIRST:

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

This is required even for non-localized fields and single-language content.

### 3a. Create the entry

```
Tool: create_entry
Arguments:
  contentTypeId: "[typename]"
  fields: {
    "internalName": { "en-US": "My Entry Name" },
    "title": { "en-US": "My Title" },
    "description": { "en-US": "My description text" }
  }
  spaceId: "[SPACE_ID]"
  environmentId: "master"
```

### Reference Field Values

**Single reference:**
```json
{
  "linkedField": {
    "en-US": {
      "sys": {
        "type": "Link",
        "linkType": "Entry",
        "id": "[ENTRY_ID]"
      }
    }
  }
}
```

**Multiple references:**
```json
{
  "items": {
    "en-US": [
      {
        "sys": {
          "type": "Link",
          "linkType": "Entry",
          "id": "[ENTRY_ID_1]"
        }
      },
      {
        "sys": {
          "type": "Link",
          "linkType": "Entry",
          "id": "[ENTRY_ID_2]"
        }
      }
    ]
  }
}
```

**Asset reference:**
```json
{
  "media": {
    "en-US": {
      "sys": {
        "type": "Link",
        "linkType": "Asset",
        "id": "[ASSET_ID]"
      }
    }
  }
}
```

### 3b. Publish the entry

```
Tool: publish_entry
Arguments:
  entryId: "[ENTRY_ID]"  // Returned from create_entry
  spaceId: "[SPACE_ID]"
  environmentId: "master"
```

### Example: Creating FAQ with Items

1. **Create FaqItem entries first:**

```
Tool: create_entry
Arguments:
  contentTypeId: "faqItem"
  fields: {
    "internalName": { "en-US": "FAQ Item 1" },
    "question": { "en-US": "What is this product?" },
    "answer": { "en-US": "This product helps you manage payments easily." }
  }
  spaceId: "[SPACE_ID]"
  environmentId: "master"
```

→ Returns entry ID, e.g., `abc123`

2. **Publish each FaqItem:**

```
Tool: publish_entry
Arguments:
  entryId: "abc123"
  spaceId: "[SPACE_ID]"
  environmentId: "master"
```

3. **Create FAQ entry with references:**

```
Tool: create_entry
Arguments:
  contentTypeId: "faq"
  fields: {
    "internalName": { "en-US": "Homepage FAQ" },
    "title": { "en-US": "Frequently Asked Questions" },
    "description": { "en-US": "Find answers to common questions" },
    "items": {
      "en-US": [
        { "sys": { "type": "Link", "linkType": "Entry", "id": "abc123" } },
        { "sys": { "type": "Link", "linkType": "Entry", "id": "def456" } }
      ]
    }
  }
  spaceId: "[SPACE_ID]"
  environmentId: "master"
```

4. **Publish FAQ entry:**

```
Tool: publish_entry
Arguments:
  entryId: "[FAQ_ENTRY_ID]"
  spaceId: "[SPACE_ID]"
  environmentId: "master"
```

## Step 4: Update Page Sections (If Needed)

If the Page content type needs to allow the new block type in its `sections` field:

1. Get the current Page content type:
   ```
   Tool: get_content_type
   Arguments:
     contentTypeId: "page"
     spaceId: "[SPACE_ID]"
     environmentId: "master"
   ```

2. Update the `sections` field's validations to include the new type in `linkContentType`

3. Publish the updated Page content type

## Common Errors

See [`references/common-errors.md`](references/common-errors.md) for all common errors and solutions.

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

Before calling any MCP create operations, verify against lessons-learned:

### Content Type Naming (LL-006)
- [ ] Content type name uses spaces for word boundaries
  - ✅ "Faq Item" → API ID `faqItem` → `__typename: "FaqItem"`
  - ❌ "FaqItem" → API ID `faqitem` → `__typename: "Faqitem"`
- [ ] Expected `__typename` documented before creation

### Field Naming (LL-007)
- [ ] Field IDs do NOT include "Collection" suffix
  - ✅ `items` → GraphQL `itemsCollection`
  - ❌ `itemsCollection` → GraphQL `itemsCollectionCollection`
- [ ] Reference/array fields use simple names: `items`, `faqs`, `tabs`

### Media Field Naming (LL-001)
- [ ] Image fields use Contentful conventions:
  - Main image: `media` (maps to `image` in code)
  - Background: `backgroundMedia` (maps to `backgroundImage` in code)
- [ ] NOT using generic names like `image` (conflicts with mapper)

### Live Preview Compatibility (LL-008)
- [ ] If component has media fields, aware that `useLiveUpdates` returns raw field names
- [ ] Component code will check both mapped and raw field names

---

## Completion Checklist

- [ ] Pre-creation checklist above completed
- [ ] All content types created and published
- [ ] At least one entry created and published
- [ ] (If nested) Linked entries created and published first
- [ ] (If needed) Page content type updated to allow new block in sections
- [ ] Verified in Contentful UI that entries appear correctly
- [ ] Verified `__typename` matches code expectations

Do not mark Milestone 3 complete until content exists in Contentful and is accessible.
