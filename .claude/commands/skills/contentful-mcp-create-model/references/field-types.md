# Field Type & Naming Reference

### Field Type Reference

| Contentful Type | MCP `type` value | Additional config |
|-----------------|------------------|-------------------|
| Short text | `Symbol` | - |
| Long text | `Text` | - |
| Integer | `Integer` | - |
| Decimal | `Number` | - |
| Boolean | `Boolean` | - |
| Date | `Date` | - |
| Location | `Location` | - |
| JSON | `Object` | - |
| Media (single) | `Link` | `linkType: "Asset"` |
| Reference (single) | `Link` | `linkType: "Entry"` |
| Media (multiple) | `Array` | `items: { type: "Link", linkType: "Asset" }` |
| Reference (multiple) | `Array` | `items: { type: "Link", linkType: "Entry" }` |
| Rich Text | `RichText` | (if supported) or use `Text` |

### Field Naming Conventions

**Media/Image Fields:**
| Use Case | Contentful Field ID | Mapped Name (TypeScript) |
|----------|-------------------|-------------------------|
| Main/foreground image | `media` | `image` |
| Background image | `backgroundMedia` | `backgroundImage` |
| Icon | `icon` | `icon` |
| Logo | `logo` | `logo` |

The mapper (`page.ts`, `hero.ts`) renames `media` → `image` and `backgroundMedia` → `backgroundImage`.

**Why:** Contentful uses "media" for Asset fields; app uses "image" for React/CSS semantics.

### IMPORTANT: Avoid "Collection" in Field IDs (LL-007)

Contentful GraphQL automatically adds "Collection" suffix to array/reference fields:
- Field ID `items` → GraphQL `itemsCollection` ✅
- Field ID `itemsCollection` → GraphQL `itemsCollectionCollection` ❌

**Best Practice:** Use simple names like `items`, `faqs`, `tabs` - NOT `itemsCollection`.

See **LL-007** in lessons-learned.md.
