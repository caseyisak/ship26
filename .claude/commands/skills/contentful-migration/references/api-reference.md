# Migration API Reference

## Top-Level Methods

| Method | Description |
|--------|-------------|
| `migration.createContentType(id, opts)` | Create a new CT |
| `migration.editContentType(id)` | Get an existing CT for editing |
| `migration.deleteContentType(id)` | Delete a CT (all entries must be deleted first) |
| `migration.transformEntries(opts)` | Batch-transform entry data |
| `migration.deriveLinkedEntries(opts)` | Create new entries from links in existing entries |

## Content Type Options

```javascript
migration.createContentType('myBlock', {
  name: 'My Block',           // Display name in Contentful UI
  description: 'Purpose',    // Optional description
  displayField: 'internalName', // Field used in entry list
});
```

## Field Methods

```javascript
const ct = migration.editContentType('myBlock');

ct.createField('fieldId', {
  name: 'Display Name',
  type: 'Symbol',             // See field types below
  required: false,
  localized: false,
  disabled: false,
  omitted: false,
  validations: [],
  items: { /* for Array type */ },
  linkType: 'Entry',          // for Link type
});

ct.editField('fieldId', { /* update options */ });
ct.deleteField('fieldId');
ct.changeFieldId('oldId', 'newId');
ct.moveField('fieldId').beforeField('otherId');
ct.moveField('fieldId').afterField('otherId');
ct.moveField('fieldId').toTheTop();
ct.moveField('fieldId').toTheBottom();
```

## Field Types

| `type` | Use for |
|--------|---------|
| `Symbol` | Short text (max 256 chars) |
| `Text` | Long text (no limit) |
| `RichText` | Rich text with embedded entries/assets |
| `Integer` | Whole numbers |
| `Number` | Decimal numbers |
| `Boolean` | True/false |
| `Date` | ISO 8601 date |
| `Object` | Freeform JSON |
| `Location` | Lat/long coordinates |
| `Link` | Single link to Entry or Asset |
| `Array` | Multiple items (Symbol, Link) |

### Link field options
```javascript
type: 'Link',
linkType: 'Entry',  // or 'Asset'
validations: [
  { linkContentType: ['button', 'hero'] }  // restrict to these CTs
]
```

### Array field options
```javascript
type: 'Array',
items: {
  type: 'Link',
  linkType: 'Entry',
  validations: [{ linkContentType: ['button'] }],
}
// OR for array of symbols:
items: {
  type: 'Symbol',
  validations: [{ in: ['a', 'b', 'c'] }],
}
```

## Validations

```javascript
// String values
{ size: { min: 1, max: 100 } }
{ regexp: { pattern: '^https?://', flags: 'i' } }
{ in: ['option1', 'option2', 'option3'] }
{ prohibitRegexp: { pattern: '<script', flags: 'i' } }

// Number
{ range: { min: 0, max: 100 } }

// Date
{ dateRange: { min: '2024-01-01', max: '2030-12-31' } }

// Link restrictions
{ linkContentType: ['hero', 'banner'] }
{ linkMimetypeGroup: ['image', 'video'] }

// Array size
{ size: { min: 1, max: 10 } }
```

## Editor Controls

```javascript
ct.changeFieldControl('fieldId', 'builtin', 'singleLine');
// Common widgets:
// 'singleLine'      — default for Symbol
// 'urlEditor'       — for URL fields
// 'richTextEditor'  — for RichText
// 'dropdown'        — for Symbol with in[] validation
// 'radio'           — for Symbol with in[] validation
// 'boolean'         — for Boolean
// 'datePicker'      — for Date
// 'assetLinkEditor' — for Link/Asset
// 'entryLinkEditor' — for Link/Entry
// 'entryLinksEditor'— for Array/Entry
// 'assetLinksEditor'— for Array/Asset
// 'tagEditor'       — for Array/Symbol
// 'listInput'       — for Array/Symbol
```

## transformEntries

```javascript
migration.transformEntries({
  contentType: 'hero',
  from: ['oldField'],
  to: ['newField'],
  transformEntryForLocale: (fromFields, currentLocale) => {
    return {
      newField: fromFields.oldField[currentLocale],
    };
  },
  // Optional: only transform entries matching a condition
  shouldPublish: true,  // Publish entries after transform (default: false)
});
```

## Function Signature

```javascript
module.exports = function(migration, { makeRequest, spaceId, environmentId }) {
  // makeRequest: lower-level CMA request helper
  // spaceId: current space
  // environmentId: current environment
};
```
