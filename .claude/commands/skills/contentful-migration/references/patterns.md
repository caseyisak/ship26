# Migration Patterns

## Pattern 1: Create New Content Type

```javascript
module.exports = function(migration) {
  const blockType = migration.createContentType('myBlock', {
    name: 'My Block',
    description: 'Purpose of this block',
    displayField: 'internalName',
  });

  blockType.createField('internalName', {
    name: 'Internal Name',
    type: 'Symbol',
    required: true,
  });

  blockType.createField('headline', {
    name: 'Headline',
    type: 'Symbol',
  });

  blockType.createField('body', {
    name: 'Body',
    type: 'RichText',
  });

  blockType.createField('ctaCollection', {
    name: 'CTA Links',
    type: 'Array',
    items: {
      type: 'Link',
      linkType: 'Entry',
      validations: [{ linkContentType: ['button'] }],
    },
  });
};
```

## Pattern 2: Add Field to Existing CT

```javascript
module.exports = function(migration) {
  const hero = migration.editContentType('hero');

  hero.createField('eyebrow', {
    name: 'Eyebrow Text',
    type: 'Symbol',
    required: false,
  });

  // Optional: move field position
  hero.moveField('eyebrow').beforeField('headline');
};
```

## Pattern 3: Rename Field (Safe Migration)

```javascript
module.exports = function(migration) {
  // Step 1: Create new field
  const hero = migration.editContentType('hero');
  hero.createField('headlineRt', {
    name: 'Headline (Rich Text)',
    type: 'RichText',
  });

  // Step 2: Copy data from old field to new
  migration.transformEntries({
    contentType: 'hero',
    from: ['headline'],
    to: ['headlineRt'],
    transformEntryForLocale: (fields, locale) => {
      if (!fields.headline?.[locale]) return;
      // Convert plain text to minimal RT document
      return {
        headlineRt: {
          nodeType: 'document',
          content: [{
            nodeType: 'paragraph',
            content: [{
              nodeType: 'text',
              value: fields.headline[locale],
              marks: [],
              data: {},
            }],
            data: {},
          }],
          data: {},
        },
      };
    },
  });

  // Step 3: Delete old field (separate migration or same one)
  hero.deleteField('headline');
};
```

## Pattern 4: Add Validation to Existing Field

```javascript
module.exports = function(migration) {
  const block = migration.editContentType('myBlock');

  block.editField('colorVariant').validations([
    { in: ['default', 'primary', 'secondary', 'dark', 'light'] }
  ]);
};
```

## Pattern 5: Change Field Control (UI Widget)

```javascript
module.exports = function(migration) {
  const block = migration.editContentType('myBlock');

  // Change editor widget for a field
  block.changeFieldControl('body', 'builtin', 'richTextEditor', {
    helpText: 'Supports bold, italic, links, and embedded entries',
  });

  block.changeFieldControl('colorVariant', 'builtin', 'dropdown', {});
  block.changeFieldControl('media', 'builtin', 'assetLinkEditor', {});
  block.changeFieldControl('itemsCollection', 'builtin', 'entryLinksEditor', {});
};
```

## Pattern 6: Delete Content Type (Careful!)

```javascript
module.exports = function(migration) {
  // DANGER: Only do this if no entries exist and it's not referenced
  // First unpublish all entries, then:
  migration.deleteContentType('obsoleteBlock');
};
```

## Pattern 7: Add Editor Layout (Field Groups)

```javascript
module.exports = function(migration) {
  const block = migration.editContentType('myBlock');

  block.addGroupControl('content', 'topLevelTab', {
    name: 'Content',
    controls: [
      { fieldId: 'internalName' },
      { fieldId: 'headline' },
      { fieldId: 'body' },
    ],
  });

  block.addGroupControl('settings', 'topLevelTab', {
    name: 'Settings',
    controls: [
      { fieldId: 'colorVariant' },
      { fieldId: 'displayMode' },
    ],
  });
};
```

## Naming Convention

```
migrations/
  001-initial-content-types.js    # Baseline snapshot
  002-add-nt-audience-fields.js   # NT integration
  003-hero-add-eyebrow-field.js   # Feature addition
  004-rename-headline-to-rt.js    # Breaking field change
```

Always increment — never edit existing scripts. Treat them like git commits.
