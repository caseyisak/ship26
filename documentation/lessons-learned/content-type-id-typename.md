# Content Type ID Determines __typename

**Symptom:** Block doesn't render; `mapSection` returns null. Build passes but runtime shows nothing.

**Root cause:** From [Contentful GraphQL docs](https://www.contentful.com/developers/docs/references/graphql/#/reference/schema-generation/types):

> "Type name is the PascalCase version of the content type ID"

The **Api Identifier** (not the display Name) is what matters. Contentful auto-generates Api Identifier from the Name using camelCase word boundaries, then GraphQL applies PascalCase:

| Name (what you type) | Api Identifier (auto-generated) | `__typename` in GraphQL |
|---------------------|--------------------------------|------------------------|
| "Faq Item" | `faqItem` | `FaqItem` ✅ |
| "FaqItem" (no space) | `faqitem` | `Faqitem` ❌ |
| "FAQ Item" | `faqItem` | `FaqItem` ✅ |

**Fix:**
1. Check the Api Identifier in Contentful for the content type (Settings → Content model → API identifier)
2. Apply PascalCase = your `__typename`
3. Update code to match — don't invent conventions

**Prevention:** Use spaces in content type Names for clear word boundaries. Verify the Api Identifier in Contentful before writing any code. After creating a content type, query it via GraphQL to confirm the actual `__typename` returned.

**Related files:** `src/services/contentful/queries.ts` (`... on TypeName` fragments), `src/block-renderer/types.ts`
