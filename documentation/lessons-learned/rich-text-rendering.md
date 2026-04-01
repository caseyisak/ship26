# Rich Text Renders as [object Object]

**Symptom:** Rich Text field shows literal "[object Object]" in the UI.

**Root cause:** Contentful Rich Text is a document object (`{ nodeType, content, [...] }`). Rendering it with `{field}` or `String(field)` in React coerces the object to a string.

**Fix:** Use the Rich Text renderer:

```tsx
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { Document } from '@contentful/rich-text-types';

// In component
<div>{documentToReactComponents(body as Document)}</div>
```

For custom node rendering (e.g. embedded entries, custom links):
```tsx
import { BLOCKS, INLINES } from '@contentful/rich-text-types';

const options = {
  renderNode: {
    [BLOCKS.EMBEDDED_ENTRY]: (node) => <MyEmbeddedEntry node={node} />,
    [INLINES.HYPERLINK]: (node, children) => (
      <a href={node.data.uri}>{children}</a>
    ),
  },
};

<div>{documentToReactComponents(body as Document, options)}</div>
```

**Prevention:** Treat any Contentful "Rich Text" field as a document structure, not a string. Add a shared Rich Text renderer component rather than inlining rendering in every component.
