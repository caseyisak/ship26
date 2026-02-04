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

Use the shadcn CLI:

```bash
npx shadcn-ui@latest add [component-name]

# Examples:
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
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

### Adding Images

1. Place images in `public/images/`:
   - `public/images/blog/` - Blog cover images
   - `public/images/homepage/` - Homepage assets
   - `public/images/layout/` - Logo, icons

2. Reference in components:
   ```tsx
   import Image from 'next/image';

   <Image
     src="/images/folder/image.webp"
     alt="Description"
     width={800}
     height={600}
   />
   ```

**Note:** Project uses static export with unoptimized images.

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
```

Uses Turbopack for fast refresh.

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

No environment variables are currently required. The project runs entirely on static data.

For future API integrations, create `.env.local`:

```bash
# Example
NEXT_PUBLIC_API_URL=https://api.example.com
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
