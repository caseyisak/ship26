---
name: Squash merge silently drops conditional guard added in earlier commit
type: project
description: Later refactor in long feature branch drops a guard against empty EditorInterface; squash merge makes it invisible
---

## Symptom
Contentful app config save silently fails or is rejected when no content types are mapped. The `onConfigure` handler returns `targetState: { EditorInterface: {} }` which Contentful rejects.

## Root Cause
A later commit (`07383b8`) that added the tabbed connector UI refactored the `onConfigure` return and dropped the `Object.keys(EditorInterface).length > 0` conditional guard that was originally added in `6e4bec4` specifically to prevent sending empty `EditorInterface` to Contentful. Squash merges in long feature branches are prone to this — a fix gets undone by a later refactor that doesn't know about the fix.

## Fix
Restore the guard so `targetState` is only included when there are actual mappings:

```ts
...(Object.keys(EditorInterface).length > 0 ? { targetState: { EditorInterface } } : {})
```

## Related Files
- `src/app/contentful-app/integration-simulator/config-screen.tsx`
