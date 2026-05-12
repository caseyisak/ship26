# NT Analytics and Preview

## Insights Plugin (Analytics)

```typescript
import { NinetailedInsightsPlugin } from '@ninetailed/experience.js-insights';

new NinetailedInsightsPlugin()
```

What it tracks automatically:
- `page` events — every navigation
- `component` events — when personalized components become visible
- `identify` events — when you call `identify()`

Data goes to NT's own analytics dashboard and any connected integrations.

## Preview Plugin (Demo Bar)

```typescript
import { NinetailedPreviewPlugin } from '@ninetailed/experience.js-preview';

new NinetailedPreviewPlugin({
  clientId: process.env.NEXT_PUBLIC_NINETAILED_API_KEY!,
  environment: process.env.NEXT_PUBLIC_NINETAILED_ENVIRONMENT as 'main' | 'development',
})
```

What it adds:
- A floating bar at the bottom of the page
- Lists all experiences on the current page
- Lets you manually select which audience to preview
- Shows current profile state

**Activation options:**
1. Register the plugin → always shows (dev/demo environments only)
2. URL param: `?ninetailed=true` → shows without plugin (if enabled in NT app settings)

**For demos:** Register the plugin in all non-production environments so the bar is always available for presentations.

## Analytics Integrations

For sending NT events to third-party analytics:

```typescript
// With Segment
import { NinetailedSegmentPlugin } from '@ninetailed/experience.js-plugin-segment';

new NinetailedInsightsPlugin({
  plugins: [new NinetailedSegmentPlugin()]
})

// With GTM
import { NinetailedGoogleTagManagerPlugin } from '@ninetailed/experience.js-plugin-gtm';

new NinetailedInsightsPlugin({
  plugins: [new NinetailedGoogleTagManagerPlugin({ containerId: 'GTM-XXXXXX' })]
})
```

## Viewing Analytics

NT dashboard → Insights:
- Shows audience membership over time
- Shows which variant was shown to whom
- Experience performance (conversion rates if goals configured)

This is a key demo story — show personalization working AND show the analytics proving it worked.
