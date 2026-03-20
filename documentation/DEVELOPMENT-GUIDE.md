# Metafi Development Guide

Quick reference for common development tasks and patterns.

---

## Getting Started

```bash
# Install dependencies
bun install

# Start development server (with Turbopack)
bun run dev

# Open http://localhost:3000
```

---

## Common Tasks

### Adding a New Page

1. Create directory in `src/app/`:
   ```
   src/app/new-page/
   └── page.tsx
   ```

2. Export a default component:
   ```tsx
   export default function NewPage() {
     return (
       <>
         <SectionComponent />
         <MetafiCta />
       </>
     );
   }
   ```

Route will be available at `/new-page`.

---

### Adding a New Section Component

1. Create file in `src/components/sections/`:
   ```
   src/components/sections/metafi-new-section.tsx
   ```

2. Follow the naming convention:
   ```tsx
   const MetafiNewSection = () => {
     return (
       <section className="container py-16">
         {/* Content */}
       </section>
     );
   };

   export default MetafiNewSection;
   ```

3. Import and use in page files.

---

### Adding a Blog Post

1. Create MDX file in `src/blog/`:
   ```
   src/blog/my-new-post.mdx
   ```

2. Add frontmatter:
   ```yaml
   ---
   tagline: Category
   title: 'Post Title'
   description: 'Brief description'
   author: 'Author Name'
   date: '2024-01-15'
   featured: false
   latest: true
   tags: ['Tag1', 'Tag2']
   coverImage: '/images/blog/image.webp'
   ---
   ```

3. Write content in MDX below the frontmatter.

4. Post will appear at `/blog/my-new-post`.

---

### Adding a UI Component (shadcn/ui)

Use the shadcn CLI via bunx:

```bash
bunx shadcn add [component-name]

# Examples:
bunx shadcn add dialog
bunx shadcn add dropdown-menu
bunx shadcn add toast
```

Components are added to `src/components/ui/`.

---

### Modifying Theme Colors

Edit CSS variables in `src/app/globals.css`:

```css
:root {
  --primary: oklch(0.172 0.006 286.3);
  --primary-foreground: oklch(1 0 89.88);
  /* ... */
}

.dark {
  --primary: oklch(0.98 0.01 255);
  /* ... */
}
```

Colors use OKLCH color space for better perceptual uniformity.

---

### Adding Navigation Links

Edit the `ITEMS` array in `src/components/layout/navbar.tsx`:

```tsx
const ITEMS = [
  { label: 'Features', href: '/features' },
  { label: 'Integrations', href: '/integrations' },
  { label: 'About Us', href: '/about' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
  // Add new links here
];
```

For footer links, edit `columns` array in `src/components/layout/footer.tsx`.

---

### Media (Images, Video, Assets)

All media is served from **Contentful's asset delivery API** — never hardcoded in the codebase.

Upload assets to Contentful (via the UI or MCP tools), then reference them via GraphQL:

```graphql
fragment MyBlockFragment on MyBlock {
  media {
    url
    width
    height
    description
  }
}
```

In the component, use the `url` from Contentful directly with Next.js `<Image>`:

```tsx
import Image from 'next/image';

<Image
  src={media.url}
  alt={media.description ?? ''}
  width={media.width ?? 1200}
  height={media.height ?? 800}
/>
```

Add `images.ctfassets.net` to `next.config.ts` if not already present:

```ts
images: {
  remotePatterns: [{ hostname: 'images.ctfassets.net' }],
}
```

**Field naming convention:** Image fields in Contentful use `media` (not `image`) as the field ID. The GraphQL fragment maps this to `image` for component use where needed. See `documentation/lessons-learned.md` LL-001.

---

## Code Patterns

### Conditional Styling

Use the `cn()` utility:

```tsx
import { cn } from '@/lib/utils';

<div
  className={cn(
    'base-styles',
    isActive && 'active-styles',
    variant === 'outline' && 'outline-styles'
  )}
/>
```

---

### Client Components

Add `'use client'` directive for:
- Hooks (`useState`, `useEffect`, etc.)
- Event handlers
- Browser APIs
- Third-party client libraries

```tsx
'use client';

import { useState } from 'react';

export default function InteractiveComponent() {
  const [isOpen, setIsOpen] = useState(false);
  // ...
}
```

---

### Form Handling

Use React Hook Form with Zod validation:

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

type FormData = z.infer<typeof schema>;

export default function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

---

### Animations

Use the Motion library:

```tsx
import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Animated content
</motion.div>
```

---

## Build & Deploy

### Development Build

```bash
bun run dev
# For HTTPS (required for Contentful Section Style Editor):
bun run dev:https
```

**Note:** Turbopack is disabled — there's a manifest bug in Next.js 15.1.1.

---

### Production Build

```bash
bun run build
```

Generates static export in `out/` directory.

---

### Preview Production

```bash
bun run build
bun run start
```

---

### Linting

```bash
# Check for issues
bun run lint

# Auto-fix issues
bun run lint:fix
```

---

## File Conventions

| File | Purpose |
|------|---------|
| `page.tsx` | Route page component |
| `layout.tsx` | Layout wrapper |
| `not-found.tsx` | 404 page |
| `*.mdx` | MDX content |
| `metafi-*.tsx` | Section components |

---

## TypeScript

### Path Aliases

```typescript
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BlogPost } from '@/lib/blog';
```

### Strict Mode

TypeScript is configured in strict mode. All props and return types should be typed.

---

## Environment

Create `.env.local` with your Contentful credentials:

```bash
CONTENTFUL_SPACE_ID=uumzxfocy3ef
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_ACCESS_TOKEN=...
CONTENTFUL_PREVIEW_ACCESS_TOKEN=...
CONTENTFUL_PREVIEW_SECRET=kaz

# For customer demos — activates [data-theme='customer'] CSS vars
NEXT_PUBLIC_BRAND=
```

---

## Troubleshooting

### Build Errors

1. Clear Next.js cache:
   ```bash
   rm -rf .next
   bun run build
   ```

2. Clear node_modules:
   ```bash
   rm -rf node_modules
   bun install
   ```

### Styling Issues

1. Check for conflicting Tailwind classes
2. Verify CSS variable definitions in `globals.css`
3. Use browser DevTools to inspect computed styles

### MDX Issues

1. Verify frontmatter YAML syntax
2. Check for unsupported JSX in MDX content
3. Ensure file extension is `.mdx`
