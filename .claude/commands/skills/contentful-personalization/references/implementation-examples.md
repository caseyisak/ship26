# Implementation Examples

## Example 1: Personalized Hero (Simple)

**Scenario:** Show different hero headline to enterprise vs SMB visitors.

**Step 1: Content in Contentful**
- Baseline `Hero` entry: "The modern content platform"
- Enterprise variant `Hero` entry: "Contentful Enterprise — built for scale"
- `nt_audience` entry: `{ ntRules: { "and": [{ "equals": [{ "var": "plan" }, "enterprise"] }] } }`
- `nt_experience` entry: links audience + enterprise variant

**Step 2: GraphQL**
```typescript
// queries.ts — BY_ID query with NT
export const HERO_BY_ID_WITH_NT = `
  query HeroByIdWithNT($id: String!, $preview: Boolean) {
    hero(id: $id, preview: $preview) {
      ...HeroPageFields
      ntExperiencesCollection(limit: 5) {
        items {
          ... on NtExperience {
            sys { id }
            ntConfig
            ntAudienceCollection(limit: 1) {
              items {
                ... on NtAudience {
                  sys { id }
                  ntAudienceId
                  ntRules
                }
              }
            }
            ntVariantsCollection(limit: 5) {
              items {
                ... on Hero {
                  ...HeroPageFields
                }
              }
            }
          }
        }
      }
    }
  }
  ${HERO_PAGE_FIELDS}
`;
```

**Step 3: Component**
```typescript
// src/cms-components/hero/hero.tsx
'use client';
import { Experience } from '@ninetailed/experience.js-next';
import { useLiveUpdates } from '@/lib/live-preview';

export function Hero({ data }) {
  const { data: liveData } = useLiveUpdates(data);
  const experiences = liveData.ntExperiencesCollection?.items ?? [];

  return (
    <Experience
      {...liveData}
      id={liveData.sys.id}
      experiences={experiences}
      component={HeroContent}
    />
  );
}

function HeroContent({ headline, subheadline, media }) {
  // render the actual hero UI
}
```

**Step 4: Identify in Navbar**
```typescript
useEffect(() => {
  setTimeout(() => {
    identify({ plan: user.plan }); // 'enterprise' triggers the variant
  }, 0);
}, [user.plan]);
```

---

## Example 2: NT Merge Tags in Banner Rich Text

**Scenario:** Banner says "Hello, [company]" — personalized inline.

**Content:** `NtMergetag` entry with `nt_mergetag_id` and `fallback: "there"` → Rich text body: "Hello, [mergetag]"

**GraphQL:** Add `MERGE_TAG_RT_LINKS` to banner's rich text links fragment.

**Component:** Rich text renderer maps `NtMergetag` entries to `<NtMergetagInline>` component that reads the `company` trait from NT profile.

---

## Example 3: Form Block Personalization

**Scenario:** Show different form headline based on industry audience.

Same pattern as Example 1 but using the `Form` block CT. The variant has a different `headline` field — NT Experience swaps the entire entry, not just a field.
