# LL-051: CSS grid animation for default-open accordions

## Symptom
FAQ items default to open, but answer text is clipped/truncated on initial render. Toggling closed then open fixes it. The JS height animation sets `height: 0` initially and transitions to measured `scrollHeight`, but the measurement happens before content is fully laid out.

## Root cause
The JS height-animation pattern (`useState(0)` → `useLayoutEffect` → `setHeight(scrollHeight)`) has a timing gap:
1. React renders with `height: 0` + `overflow: hidden`
2. Browser paints the clipped state (visible flash)
3. `useLayoutEffect` fires and measures `scrollHeight`
4. State updates to measured height

For items that START closed and animate open on click, this works fine (user triggers it). For items that START open, the initial `height: 0` → measured height transition causes a visible clip on first paint.

## Fix
Use CSS `grid-template-rows` animation instead of JS height measurement:

```tsx
<div className={cn(
  'grid transition-[grid-template-rows] duration-200',
  open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
)}>
  <div className="overflow-hidden">
    <div className="mt-2 pb-2">{answer}</div>
  </div>
</div>
```

Benefits:
- No JS measurement needed
- No timing issues — CSS handles the animation
- `grid-rows-[1fr]` = full height (no measurement), `grid-rows-[0fr]` = collapsed
- `overflow: hidden` on the inner wrapper clips during animation
- Works correctly for default-open items on first render

## Related files
- `src/cms-components/faq/faq.tsx` — FaqItem component
