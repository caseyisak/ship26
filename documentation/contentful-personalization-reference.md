# Contentful Personalization Reference

*Generated: 2026-02-02*
*Updated: 2026-02-02 (verified against colorful-demo-2.0 implementation)*
*Source: Context7 MCP + Contentful Developer Docs + colorful-demo-2.0 codebase*

## Overview

Contentful Personalization is the experimentation and personalization solution that allows you to show the right content to the right user. It's powered by Ninetailed technology and integrated into the Contentful ecosystem.

Key capabilities:
- Audience-based content personalization
- A/B experiments
- Real-time insights and analytics
- Extensible SDK architecture with plugins

---

## Architecture Components

### 1. Experience API
REST API for automating workflows, sending/receiving customer profile data, and retrieving analytical reports.

### 2. Experience SDK
JavaScript/React SDKs for client-side personalization delivery.

### 3. Plugins (We Use)
- **Preview Plugin**: Preview personalized experiences in Contentful UI
- **Insights Plugin**: Analytics and tracking (optional, for metrics)

---

## SDK Installation (Verified from colorful-demo-2.0)

**IMPORTANT**: For Next.js App Router, use the **React SDK** (not the Next.js SDK).
The official `@ninetailed/experience.js-next` package only supports Pages Router.

### Required Packages
```bash
npm install @ninetailed/experience.js-react @ninetailed/experience.js-utils @ninetailed/experience.js-plugin-preview
# OR
yarn add @ninetailed/experience.js-react @ninetailed/experience.js-utils @ninetailed/experience.js-plugin-preview
```

### Package Versions (from colorful-demo-2.0)
```json
"@ninetailed/experience.js-plugin-preview": "^7.18.10",
"@ninetailed/experience.js-react": "^7.18.10",
"@ninetailed/experience.js-utils": "^7.18.10"
```

---

## Next.js App Router Integration (from colorful-demo-2.0)

### Provider Architecture

The App Router requires a custom provider pattern because `@ninetailed/experience.js-next` only supports Pages Router.

**File Structure:**
```
src/personalization/
├── provider.tsx              # Server component (fetches data)
├── ninetailed-nextjs.tsx     # Client provider + custom Tracker
├── personalized-component.tsx # Experience wrapper
└── utils.ts                  # mapExperiences, mapAudiences
```

### 1. Server Component Provider (fetches data)

```tsx
// src/personalization/provider.tsx
export async function PersonalizationProvider({
  children,
  locale,
  draftMode,
}: {
  children: React.ReactNode;
  locale: string;
  draftMode: boolean;
}) {
  const experiences = await getPersonalizationExperiences({ preview: draftMode });
  const audiences = await getPersonalizationAudiences({ preview: draftMode });

  return (
    <NinetailedProvider
      clientId={env.NEXT_PUBLIC_NINETAILED_API_KEY}
      environment={env.NEXT_PUBLIC_NINETAILED_ENVIRONMENT}
      locale={locale.split("-")[0]}
      experiences={experiences}
      audiences={audiences}
    >
      {children}
    </NinetailedProvider>
  );
}
```

### 2. Client Provider (wraps React SDK)

```tsx
// src/personalization/ninetailed-nextjs.tsx
import {
  NinetailedProvider as ReactNinetailedProvider,
} from "@ninetailed/experience.js-react";
import { NinetailedPreviewPlugin } from "@ninetailed/experience.js-plugin-preview";

export const NinetailedProvider = ({ 
  children, 
  onRouteChange, 
  experiences, 
  audiences, 
  ...providerProps 
}) => {
  return (
    <ReactNinetailedProvider
      {...providerProps}
      plugins={[
        new NinetailedPreviewPlugin({
          experiences: mapExperiences(experiences) || [],
          audiences: mapAudiences(audiences) || [],
          onOpenExperienceEditor: (experience) => {
            window.open(getContentfulEntryUrl(experience.id), "_blank");
          },
          onOpenAudienceEditor: (audience) => {
            window.open(getContentfulEntryUrl(audience.id), "_blank");
          },
          ui: { opener: { hide: true } },
        }),
      ]}
    >
      <Tracker onRouteChange={onRouteChange} />
      {children}
    </ReactNinetailedProvider>
  );
};
```

### 3. Custom Tracker (replaces next/router with next/navigation)

```tsx
// In src/personalization/ninetailed-nextjs.tsx
import { usePathname } from "next/navigation";
import { useNinetailed } from "@ninetailed/experience.js-react";

export const Tracker = ({ onRouteChange }) => {
  const pathname = usePathname();
  const ninetailed = useNinetailed();
  const lastFiredPageRef = useRef("none");

  useEffect(() => {
    const isPageAlreadyTracked = lastFiredPageRef.current === pathname;
    
    if (!isPageAlreadyTracked) {
      if (typeof onRouteChange === "function") {
        onRouteChange({ isInitialRoute: lastFiredPageRef.current === "none" }, ninetailed);
      } else {
        ninetailed.page();
      }
      lastFiredPageRef.current = pathname;
    }
  }, [pathname]);

  return null;
};
```

### 4. Usage in Layout

```tsx
// src/app/[locale]/(p13n-routes)/layout.tsx
<PersonalizationProvider locale={locale} draftMode={isEnabled}>
  <LivePreviewProvider locale={locale}>
    {children}
  </LivePreviewProvider>
</PersonalizationProvider>
```

---

## Experience Component Usage (from colorful-demo-2.0)

### PersonalizedComponent Wrapper

```tsx
// src/personalization/personalized-component.tsx
import { Experience } from "@ninetailed/experience.js-react";
import { mapExperiences } from "./utils";

export const PersonalizedComponent = ({ data, ...props }) => {
  const mappedExperiences = mapExperiences(data.ntExperiencesCollection?.items);

  return (
    <Experience
      {...data}
      passthroughProps={props}
      id={data.sys.id}
      component={(props) => {
        // Remove personalization props to prevent infinite loop
        const { ntExperiencesCollection, ninetailed, className, layoutType, ...rest } = props;
        return <BlockRenderer className={className} data={rest} layoutType={layoutType} />;
      }}
      experiences={mappedExperiences}
    />
  );
};
```

### Integration in BlockRenderer

```tsx
// src/block-renderer/block-renderer.tsx
if (isPersonalized(data)) {
  return <PersonalizedComponent {...props} data={data} layoutType={layoutType} />;
}
```

### isPersonalized Check

```tsx
// src/personalization/utils.ts
export function isPersonalized(data) {
  return "ntExperiencesCollection" in data && 
         Boolean(data.ntExperiencesCollection?.items?.length);
}
```

---

## Experience Mapping (from colorful-demo-2.0)

### mapExperiences Function

```tsx
// src/personalization/utils.ts
import { ExperienceMapper } from "@ninetailed/experience.js-utils";

export function mapExperiences(experiences) {
  if (!experiences) {
    return [];
  }

  return experiences
    .filter(Boolean) // Remove nulls
    .map((experience) => {
      return {
        id: experience.ntExperienceId,
        name: experience.ntName,
        type: experience.ntType, // 'nt_personalization' | 'nt_experiment'
        config: experience.ntConfig,
        ...(experience.ntAudience?.ntAudienceId
          ? {
              audience: {
                id: experience.ntAudience.ntAudienceId,
                name: experience.ntAudience.ntName ?? undefined,
              },
            }
          : {}),
        variants: (experience.ntVariantsCollection?.items || [])
          .filter(Boolean)
          .map((variant) => ({
            id: variant.sys.id,
            ...variant,
          })),
      };
    })
    .filter((experience) => ExperienceMapper.isExperienceEntry(experience))
    .map((experience) => ExperienceMapper.mapExperience(experience));
}
```

### mapAudiences Function

```tsx
export function mapAudiences(audiences) {
  if (!audiences) {
    return [];
  }

  return audiences
    .filter(Boolean)
    .map((audience) => ({
      id: audience.ntAudienceId,
      name: audience.ntName ?? undefined,
      description: audience.ntDescription ?? undefined,
    }));
}
```

---

## GraphQL Fragments (from colorful-demo-2.0)

### Entry Base Fragment

```graphql
fragment Entry on Entry {
  __typename
  sys {
    id
    spaceId
  }
}
```

### NtAudience Fragment

```graphql
fragment NtAudience on NtAudience {
  ...Entry
  ntAudienceId
  ntName
  ntDescription
}
```

### NtExperience Fragment

```graphql
fragment NtExperience on NtExperience {
  ...Entry
  ntExperienceId
  ntName
  ntType
  ntConfig
  ntAudience {
    ...NtAudience
  }
  ntVariantsCollection(limit: 10) {
    items {
      ...Entry
    }
  }
}
```

### Personalized Component Fragment Pattern

```graphql
# Base fragment (for deferred entries)
fragment CallToAction on CallToAction {
  ...Entry
  heading
  body { json }
}

# Personalized fragment (for root queries)
fragment PersonalizedCallToAction on CallToAction {
  ...CallToAction
  ntExperiencesCollection(limit: 10) {
    items {
      ...NtExperience
    }
  }
}
```

### Fetching Experiences and Audiences

```graphql
query GetPersonalizationAudiences($preview: Boolean = false) {
  ntAudienceCollection(preview: $preview) {
    items {
      ...NtAudience
    }
  }
}

query GetPersonalizationExperiences($preview: Boolean = false) {
  ntExperienceCollection(preview: $preview) {
    items {
      ...NtExperience
    }
  }
}
```

---

## Contentful Live Preview Integration

### Installation
```bash
npm install @contentful/live-preview
```

### App Router Usage (from colorful-demo-2.0)

```tsx
// src/lib/live-preview.tsx
import { ContentfulLivePreviewProvider, useContentfulLiveUpdates } from '@contentful/live-preview/react';

export function useLiveUpdates(data) {
  return useContentfulLiveUpdates(data);
}

export function getPreviewProps(data) {
  return {
    getProps: (fieldId) => ({
      'data-contentful-entry-id': data.sys.id,
      'data-contentful-field-id': fieldId,
    }),
  };
}
```

### Component Usage

```tsx
const Alert = ({ data }) => {
  const liveData = useLiveUpdates(data);
  const { getProps } = getPreviewProps(data);

  return (
    <div>
      <RichText 
        data={liveData.message} 
        {...getProps("message")}  // Inspector mode enabled
      />
    </div>
  );
};
```

---

## MergeTag Usage (Inline Personalization)

```tsx
// In RichText renderer
import { MergeTag } from "@ninetailed/experience.js-react";

if (entry?.__typename === "NtMergetag") {
  return <MergeTag id={entry.ntMergetagId} fallback={entry.ntFallback} />;
}
```

---

## Environment Variables Required

```env
NEXT_PUBLIC_NINETAILED_API_KEY=your_api_key
NEXT_PUBLIC_NINETAILED_ENVIRONMENT=main
```

---

## Key Packages Summary

| Package | Purpose | Required |
|---------|---------|----------|
| `@ninetailed/experience.js-react` | React provider + Experience component | ✅ Yes |
| `@ninetailed/experience.js-utils` | ExperienceMapper for validation/mapping | ✅ Yes |
| `@ninetailed/experience.js-plugin-preview` | Preview plugin for Contentful UI | ✅ Yes |
| `@contentful/live-preview` | Live Preview + Inspector Mode | ✅ Yes |

**NOT Used:**
- `@ninetailed/experience.js-next` (Pages Router only, incompatible with App Router)
- `@contentful/experiences-sdk-react` (Studio SDK - deferred to post-MVP)

---

## Resources

- [Contentful Personalization Docs](https://www.contentful.com/developers/docs/personalization/)
- [Experience SDK Reference](https://www.contentful.com/developers/docs/personalization/experience-sdk)
- [React SDK Reference](https://www.contentful.com/developers/docs/personalization/react-sdk)
- [Live Preview SDK](https://github.com/contentful/live-preview)
- [colorful-demo-2.0 Implementation](file:///Users/casey.lisak/Dev/colorful-demo-2.0) (reference codebase)
