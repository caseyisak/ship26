# Integration Simulator

Simulates third-party integrations (e-commerce, DAM, booking, custom apps) directly inside the Contentful field editor. Instead of building a separate Contentful app for every vendor, define "connectors" in a single app installation and attach them to any JSON field.

## Installation

1. Create or open a Contentful App Definition.
2. Set the **App URL** to `http://localhost:3000` (development) or the deployed Vercel URL.
3. Enable **App configuration screen** and **Entry field** (JSON Object) locations.
4. Install the app into your space/environment.

The configuration screen opens automatically on first install.

## Connectors tab

Each connector represents a third-party data source. Fields:

| Field | Description |
|-------|-------------|
| **Label** | Display name shown in the field editor (e.g. "Shopify", "Bynder") |
| **Category** | Grouping label. Choose from predefined categories (E-Commerce, DAM, Custom App, Booking) or add custom categories |
| **Brand color / Text color** | Hex values used for the connector pill in the field editor |
| **Picker mode** | `gallery` (image cards), `table` (sortable rows), or `embed` (custom React component loaded in an iframe) |
| **Seed data (JSON)** | Picker-mode-specific configuration. For `gallery`/`table`, this is the array of items shown in the picker. For `embed`, this is the config object passed to the embedded component |

Click **+ Add connector** to create a new one. The ID is auto-derived from the label. All edits are saved when you click the Contentful **Save** button at the top of the screen.

### Custom categories

Below the Category dropdown, use **Custom categories** to define additional groupings. Type a name and click **Add** (or press Enter). Custom categories appear in the Category dropdown for all connectors. A custom category cannot be deleted while any connector uses it.

## Mappings tab

Attach connectors to content type fields.

1. Toggle a content type ON to activate it.
2. Choose which **field** receives the integration data (must be a JSON Object field).
3. Choose which **connector** provides the data.
4. Choose the **mode**:
   - **Single** -- the field stores one selected item: `{ id, name, thumbnail, ... }`
   - **Multi** -- the field stores an array of selected items: `[{ id, name, thumbnail, ... }, ...]` and shows a thumbnail strip in the editor

When you save, the app automatically sets itself as the appearance widget for each mapped field.

## Field editor

When an editor opens an entry with a mapped field:

- **Single mode**: Click the field to open the picker dialog. Select one item. The field value is set to the selected item object.
- **Multi mode**: Click "Add items" to open the picker. Select one or more items. Selected items appear as a thumbnail strip below the field. Click the **x** on a thumbnail to remove it.

The picker dialog renders differently based on the connector's `pickerMode`:
- **Gallery**: Grid of image cards with name labels
- **Table**: Sortable table rows with column headers derived from seed data keys
- **Embed**: Loads a custom React component via iframe (`postMessage` protocol)

## Custom App integration (embed mode)

For the `embed` picker mode, the dialog loads an external React component inside an iframe. Communication uses `window.postMessage`.

### Protocol

The iframe receives an init message:

```typescript
// Sent to iframe on load
interface InitMessage {
  type: 'integration-sim:init';
  connector: ConnectorProfile;
  mode: 'single' | 'multi';
}
```

The iframe sends back selected items:

```typescript
// Sent from iframe to parent
interface SelectMessage {
  type: 'integration-sim:select';
  items: SelectedItem[];
}

interface SelectedItem {
  id: string;
  name: string;
  thumbnail?: string;
  [key: string]: unknown; // additional metadata
}
```

### Sample embedded component

```tsx
import { useEffect, useState } from 'react';

export function EmbedPicker() {
  const [connector, setConnector] = useState<any>(null);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'integration-sim:init') {
        setConnector(e.data.connector);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleSelect = (items: Array<{ id: string; name: string }>) => {
    window.parent.postMessage(
      { type: 'integration-sim:select', items },
      '*',
    );
  };

  if (!connector) return <div>Loading...</div>;
  return (
    <div>
      <h2>{connector.label} Picker</h2>
      {/* Render your custom selection UI here */}
      <button onClick={() => handleSelect([{ id: '1', name: 'Item 1' }])}>
        Select Item
      </button>
    </div>
  );
}
```

### TypeScript interfaces

```typescript
interface ConnectorProfile {
  id: string;
  label: string;
  category: string;
  brand: { color: string; textColor: string };
  pickerMode: 'gallery' | 'table' | 'embed';
  seedData: Record<string, unknown>;
}

interface MappingRow {
  contentTypeId: string;
  fieldId: string;
  connectorId: string;
  mode?: 'single' | 'multi';
}
```

## Troubleshooting

### Save fails ("Failed to update app configuration")

- The app previously set `targetState` in `onConfigure`, which conflicts with existing EditorInterface config. This has been removed. If you see this error, check that `onConfigure` does NOT return a `targetState` key.
- Ensure `setReady()` is called only once, after `onConfigure` is registered.

### Picker opens in wrong mode

- Check the **Mappings** tab: the mode (Single/Multi) is set per content-type mapping, not per connector. A single connector can be used in Single mode on one field and Multi mode on another.

### Field shows empty after selecting items

- Verify the mapped field is a **JSON Object** type in Contentful. Text/Symbol fields cannot store the structured data.
- Check browser console for `postMessage` errors if using `embed` mode.
- For `gallery`/`table` modes, ensure `seedData` is valid JSON with items that have at least `id` and `name` keys.

### Config UI doesn't load

- The app requires the **App configuration screen** location to be enabled in the App Definition.
- Check that the App URL matches your running dev server (`localhost:3000`).

### Custom categories missing from dropdown

- Custom categories are saved alongside connectors and mappings. They only persist after clicking the Contentful **Save** button.
