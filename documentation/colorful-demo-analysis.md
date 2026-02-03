# Colorful Demo 2.0 Codebase Analysis

*Generated: 2026-02-02*
*Source: /Users/casey.lisak/Dev/colorful-demo-2.0*

## 1. Project Structure

### Framework & Version
- **Next.js**: 15.5.9 (App Router)
- **React**: 19.2.3
- **TypeScript**: 5.9.3
- **Node**: ^22.0.0

### Key Folders

```
src/
├── app/                    # Next.js App Router pages
│   ├── [locale]/          # Internationalized routes
│   │   ├── (p13n-routes)/ # Personalization-enabled routes
│   │   └── (non-p13n-routes)/ # Routes without personalization
│   └── api/               # API routes (draft mode, deferred entries)
├── block-renderer/         # Component registry & rendering system
│   ├── configs/           # Component configs mapping content types → components
│   ├── layouts/           # Layout wrappers (grid, carousel, etc.)
│   └── error/             # Error boundary components
├── cms-components/         # Contentful-aware React components
├── components/             # Shared UI components
├── design-system/          # Design tokens & reusable components
├── services/
│   └── contentful/        # Contentful integration layer
│       ├── client/        # GraphQL & REST clients
│       ├── documents/     # GraphQL queries
│       ├── fragments/    # GraphQL fragments
│       └── queries/       # Query wrappers with selectors
├── personalization/        # Ninetailed integration
├── lib/                    # Utilities (live preview, logger, etc.)
└── config/                # Environment & configuration
```

---

## 2. Contentful Integration

### Client Configuration

**Location**: `src/services/contentful/client/contentful-client.ts`

- **Dual Client Pattern**: Separate clients for Delivery (CDA) and Preview (CPA)
- **Caching**: Singleton pattern with cached clients per type

```typescript
const clientCache: ClientsCache = {
  DELIVERY: null,
  PREVIEW: null,
};

export const getClient = ({ preview }: { preview: boolean }) => {
  const type = preview ? "PREVIEW" : "DELIVERY";
  if (!clientCache?.[type]) {
    clientCache[type] = createClient({
      space: env.NEXT_PUBLIC_CTF_SPACE_ID,
      environment: env.NEXT_PUBLIC_CTF_ENVIRONMENT,
      ...getClientParams(type),
    });
  }
  return clientCache[type];
};
```

### GraphQL Client

**Location**: `src/services/contentful/client/graphql-client.ts`

- **Library**: `urql` with `cacheExchange` and `fetchExchange`
- **Query Cost Monitoring**: Tracks `X-Contentful-Graphql-Query-Cost` header
- **Deferred Entry Handling**: Automatically fills missing entries from Rich Text

### Data Fetching Strategy

**GraphQL-first approach**:
- All queries use GraphQL (not REST SDK)
- GraphQL Code Generator generates TypeScript types
- Fragments organized by content type
- Queries organized by page type

**Fragment Pattern**:
```typescript
// Base fragment (used in deferred entries)
fragment CallToAction on CallToAction {
  ...Entry
  heading
  body { json }
}

// Personalized fragment (used in root queries)
fragment PersonalizedCallToAction on CallToAction {
  ...CallToAction
  ntExperiencesCollection(limit: 10) {
    items { ...NtExperience }
  }
}
```

**Query Pattern**:
```typescript
export const getLandingPageBySlug = createQuery({
  document: GetLandingPageBySlug,
  selector: (data) => data?.landingPageCollection?.items?.[0],
});
```

---

## 3. Live Preview Setup

### Provider Configuration

**Location**: `src/lib/live-preview.tsx`

- Provider wraps the app in `src/app/[locale]/(p13n-routes)/layout.tsx`

**Key Functions**:
- `useLiveUpdates()`: Wrapper around `useContentfulLiveUpdates` hook
- `getPreviewProps()`: Helper for inspector mode props

### Inspector Mode Tagging

```tsx
const Alert = ({ data }: BlockProps<AlertFragment>) => {
  const { message, type } = useLiveUpdates(data);
  const { getProps } = getPreviewProps(data);

  return (
    <AlertDesignSystem variant={type}>
      <RichText 
        data={message} 
        {...getProps("message")}  // Inspector mode enabled
      />
    </AlertDesignSystem>
  );
};
```

### X-Ray Mode

Debug component adds visual borders and links to Contentful entries when `?xRay=true` query param is present.

---

## 4. Ninetailed/Personalization

### Provider Setup

**Location**: `src/personalization/provider.tsx` & `src/personalization/ninetailed-nextjs.tsx`

**Architecture**:
1. **Server Component Provider** fetches experiences and audiences
2. **Client Provider** uses `@ninetailed/experience.js-react` directly
   - Custom implementation (official package incompatible with App Router)
   - Custom `Tracker` component using `next/navigation`

**Provider Hierarchy**:
```tsx
<PersonalizationProvider locale={locale} draftMode={isEnabled}>
  <ProductProvider>
    <CartProvider>
      <LayoutWrapper>
        <LivePreviewProvider>
          {children}
        </LivePreviewProvider>
      </LayoutWrapper>
    </CartProvider>
  </ProductProvider>
</PersonalizationProvider>
```

### Experience/Variant Handling

**Location**: `src/personalization/personalized-component.tsx`

**Flow**:
1. `BlockRenderer` detects personalization via `isPersonalized()`
2. Routes to `PersonalizedComponent` wrapper
3. Uses Ninetailed `<Experience>` component
4. Maps Contentful experiences to Ninetailed format
5. Selected variant passed back to `BlockRenderer`

```tsx
<Experience
  id={data.sys.id}
  experiences={mappedExperiences}
  component={(props) => {
    const { ntExperiencesCollection, ninetailed, ...rest } = props;
    return <BlockRenderer data={rest} />;
  }}
/>
```

---

## 5. Component ↔ Content Type Mapping

### Block Renderer System

**Location**: `src/block-renderer/block-renderer.tsx`

**Architecture**:
1. **Registry Pattern**: Configs registered in `src/block-renderer/configs/index.ts`
2. **Type Matching**: Uses `__typename` from GraphQL
3. **Layout Support**: Components can have multiple layout variants

**Component Config Structure**:
```typescript
const componentConfig: BlockConfig<AlertFragment> = {
  typename: "Alert",
  layouts: {
    default: () => Alert,
  },
};
```

**Rendering Flow**:
```
Page → BlockRenderer → getComponentConfig(data.__typename) 
  → getComponent(config, layoutType) 
  → Component(data)
```

### Layout System

Collections can specify layout type (grid, carousel, etc.):
```tsx
<LayoutRenderer layout={collection.layout}>
  {(layoutType) => items.map(item => 
    <BlockRenderer data={item} layoutType={layoutType} />
  )}
</LayoutRenderer>
```

---

## 6. Theme/Variant System

### CSS Variables Approach

**Location**: `src/design-system/tokens/color-variables.tsx`

- Dynamic CSS variables from Contentful `AppSettings.colorTokens`
- Three color sets: `expressive`, `light`, `dark`
- Uses `next-themes` for theme switching

```tsx
<ColorVariables colorTokens={appSettings.colorTokens} />
// Generates:
// :root { --primary1: #000; }
// .light { --primary1: #fff; }
// .dark { --primary1: #333; }
```

---

## 7. Key Patterns to Adopt or Avoid

### ✅ Patterns to Adopt

1. **Fragment Separation Pattern** - Base vs. personalized fragments
2. **Deferred Entry System** - Fetches Rich Text embedded entries separately
3. **Component Config Registry** - Centralized typename → component mapping
4. **Query Selector Pattern** - Clean data transformation
5. **Layout System** - Reusable layout wrappers
6. **Error Boundaries** - Graceful error handling
7. **X-Ray Mode** - Debug mode for development

### ⚠️ Patterns to Simplify

1. **Custom Ninetailed Provider** - Forced by App Router incompatibility
2. **Collection nesting** - Page → Collection → CTA pattern is overly complex
3. **Fragment organization** - Many separate files per content type

### 🔍 Complex But Necessary

1. **Deferred Entry Logic** - Prevents query cost explosion
2. **Personalization Flow** - Multiple rendering layers
3. **GraphQL Fragment Strategy** - Prevents infinite loops

---

## Content Model Summary

**Total Content Types**: 43

**Key Content Types**:
- `landingPage` - Main page type
- `collection` - Layout wrapper (grid, carousel, etc.)
- `callToAction` - CTA components
- `hero` - Hero sections
- `feature` - Feature highlights
- `testimonial` - Customer quotes
- `ntAudience` - Ninetailed audiences
- `ntExperience` - Ninetailed experiences
- `appSettings` - Theme/config

**Nesting Pattern (to simplify)**:
```
Page → sectionsCollection → Collection → itemsCollection → Component
```

**Simplified Alternative**:
```
Page → sectionsCollection → Component (with variant field)
```
