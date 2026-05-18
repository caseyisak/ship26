# Analytics Patterns

## What NT Tracks Automatically

With `NinetailedInsightsPlugin` installed:

| Event | Fired when | Properties |
|-------|-----------|------------|
| `page` | Every navigation | `url`, `path`, `referrer` |
| `component` | Experience component enters viewport | `experience_id`, `variant_id`, `audience_id` |
| `identify` | `identify()` called | trait key/value pairs |

## Viewing in NT Dashboard

NT → Insights → Experience Performance:
- Audience membership over time
- Which variant was shown (% baseline vs variant)
- If goals configured: conversion rates per variant

This is a key demo moment: show personalization working AND show the analytics proving ROI.

## Connecting to Third-Party Analytics

### Segment

```typescript
import { NinetailedSegmentPlugin } from '@ninetailed/experience.js-plugin-segment';

// In NinetailedWrapper
new NinetailedInsightsPlugin({
  plugins: [
    new NinetailedSegmentPlugin()
  ]
})
```

NT events are forwarded to Segment as standard `page()`, `identify()`, and `track()` calls.

### Google Tag Manager

```typescript
import { NinetailedGoogleTagManagerPlugin } from '@ninetailed/experience.js-plugin-gtm';

new NinetailedInsightsPlugin({
  plugins: [
    new NinetailedGoogleTagManagerPlugin({
      containerId: 'GTM-XXXXXX'
    })
  ]
})
```

### Custom Tracking

```typescript
import { NinetailedInsightsPlugin } from '@ninetailed/experience.js-insights';

new NinetailedInsightsPlugin({
  onEvent: (eventName, eventProperties) => {
    // Send to any analytics platform
    window.analytics?.track(eventName, eventProperties);
  }
})
```

## Demo Analytics Storytelling

For sales demos, the analytics story is:
1. "Here's a visitor who identified as enterprise" → show identify() call
2. "NT immediately serves them the enterprise variant" → show variant switch
3. "Over time, we see that enterprise visitors convert 34% better" → show NT dashboard
4. "All of this is driven by content in Contentful — no code deployments for new variants"
