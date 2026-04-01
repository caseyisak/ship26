# GraphQL Collection Field Naming (Contentful Adds "Collection" Suffix)

**Symptom:** `"Cannot query field \"itemsCollection\" on type \"Tabbedcontent\""` or `"Did you mean \"itemsCollectionCollection\"?"`.

**Root cause:** Contentful GraphQL automatically appends `Collection` to any array/reference field name. If you name a field `items` in Contentful, it becomes `itemsCollection` in GraphQL. If you accidentally named it `itemsCollection`, GraphQL exposes it as `itemsCollectionCollection`.

**The rule:**
```
Contentful field ID: items
GraphQL query field: itemsCollection { items { ... } }
```

**Fix:**
```graphql
# ❌ Wrong — querying the field ID directly
fragment FaqFragment on Faq {
  items { question answer }
}

# ✅ Correct — GraphQL adds Collection suffix
fragment FaqFragment on Faq {
  itemsCollection(limit: 20) {
    items {
      question
      answer
    }
  }
}
```

In code: access as `data.itemsCollection?.items ?? []`.

**Prevention:** Never include `Collection` in a Contentful field ID. Use simple names: `items`, `faqs`, `tabs`. Run a test query immediately after creating a new content type to verify field names before writing service code.

**Related files:** `src/services/contentful/queries.ts`, `src/services/contentful/page.ts`
