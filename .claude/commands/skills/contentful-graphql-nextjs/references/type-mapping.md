# Contentful Field Types → TypeScript

## Type Mapping Reference

| Contentful field type | GraphQL return type | TypeScript type |
|----------------------|--------------------|-----------------|
| Symbol | `String` | `string \| null` |
| Text | `String` | `string \| null` |
| RichText | `{ json: Document; links: Links }` | `{ json: Document; links: RichTextLinks }` |
| Integer | `Int` | `number \| null` |
| Number | `Float` | `number \| null` |
| Boolean | `Boolean` | `boolean \| null` |
| Date | `DateTime` | `string \| null` (ISO 8601) |
| Object (JSON) | `JSON` | `Record<string, unknown> \| null` |
| Asset link | `Asset` | `ContentfulAsset \| null` |
| Entry link | `[ContentTypeName]` | `[BlockType] \| null` |
| Array of entries | `[ContentTypeName]Collection` | `{ items: ([BlockType] \| null)[] }` |
| Array of symbols | `[String]` | `(string \| null)[]` |

## Common Type Patterns

```typescript
// src/block-renderer/types.ts

interface SysFields {
  id: string;
  __typename: string;
}

interface ContentfulAsset {
  url: string;
  title: string | null;
  width: number | null;
  height: number | null;
  description?: string | null;
}

interface RichTextDocument {
  json: Document;  // from @contentful/rich-text-types
  links?: {
    entries?: {
      inline?: (SysEntry | null)[];
      block?: (SysEntry | null)[];
    };
    assets?: {
      block?: (ContentfulAsset & { sys: SysFields })[];
    };
  };
}

// Block type example
export interface HeroFields {
  sys: SysFields;
  internalName: string;
  headline: string | null;
  subheadline: string | null;
  eyebrow: string | null;
  media: ContentfulAsset | null;
  ctaCollection: {
    items: (ButtonFields | null)[];
  } | null;
}
```

## Null Safety Pattern

Contentful returns `null` for optional fields. Always handle null:

```typescript
// ❌ Runtime error if field is null
const headline = data.headline.toUpperCase();

// ✅ Safe
const headline = data.headline ?? '';
const buttons = data.ctaCollection?.items.filter(Boolean) ?? [];
```

## Array Null Items

Collection items can be `null` when a linked entry is unpublished (UNRESOLVABLE_LINK):

```typescript
// Always filter nulls from collections
const items = data.sectionsCollection?.items.filter(Boolean) ?? [];

// Or with type guard
const items = (data.ctaCollection?.items ?? [])
  .filter((item): item is ButtonFields => item !== null);
```

## NT-Related Types

```typescript
interface NtAudienceFields {
  sys: SysFields;
  ntAudienceId: string | null;
  ntRules: Record<string, unknown> | null;
}

interface NtExperienceFields {
  sys: SysFields;
  ntConfig: Record<string, unknown> | null;
  ntAudienceCollection: {
    items: (NtAudienceFields | null)[];
  } | null;
  ntVariantsCollection: {
    items: (HeroFields | null)[];  // Same type as baseline
  } | null;
}

// Block type with NT support
export interface HeroWithNTFields extends HeroFields {
  ntExperiencesCollection?: {
    items: (NtExperienceFields | null)[];
  } | null;
}
```
