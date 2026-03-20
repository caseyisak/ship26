# Brand Scraping Reference

## Goal

Extract design tokens from a customer's website and generate a scoped `[data-theme='[customer]']`
CSS block that activates their look and feel across the demo site.

## Firecrawl scrape

```
mcp__docker__firecrawl_scrape
  url: "[customer-url]"
  formats: ["extract"]
  extract:
    schema:
      primaryColor: "main brand color (hex)"
      secondaryColor: "secondary/supporting color (hex)"
      accentColor: "CTA/highlight color (hex)"
      fontFamily: "primary font name"
      borderRadius: "button/card border radius (px or rem)"
      buttonStyle: "filled | outlined | ghost"
```

## CSS var mapping

| Token | CSS variable | Notes |
|-------|-------------|-------|
| primaryColor | `--primary` | Convert hex → oklch |
| secondaryColor | `--secondary` | |
| accentColor | `--accent` | Used for CTAs, tags |
| accentColor (light tint) | `--background` | `oklch(L+0.78 C*0.05 H)` |
| fontFamily | `--font-sans` | Add Google Fonts import if not proprietary |

## Hex → oklch conversion

Use this formula mentally or ask Claude to convert:
- `#0B1F41` (dark navy) → `oklch(0.19 0.068 258)`
- `#C83803` (orange) → `oklch(0.55 0.205 38)`
- Lightness: 0=black, 1=white. Chroma: 0=gray, 0.3=vivid. Hue: 0=red, 120=green, 258=blue.

## Output CSS block

Write to `src/app/globals.css` after the existing theme blocks:

```css
/* ─── [Customer Name] Demo Theme ─────────────────────────────────────────── */
[data-theme='[customer-slug]'] {
  --primary: oklch(...);
  --secondary: oklch(...);
  --accent: oklch(...);
  --background: oklch(...);
  --foreground: oklch(0.15 0.01 [hue]);
  --[customer-slug]-primary: oklch(...);   /* keep named var for component use */
  --[customer-slug]-accent: oklch(...);
}
```

## Fallback (no website / scrape fails)

Ask the user:
1. Primary hex color
2. Accent/CTA hex color
3. Font name (Google Fonts preferred; flag if proprietary)
4. Rounded or sharp corners? → `border-radius: 0.5rem` or `0`

## Proprietary font handling

Common proprietary fonts and safe substitutes:
| Brand font | Google Fonts substitute |
|-----------|------------------------|
| SF Pro | Inter |
| Gotham | Montserrat |
| Proxima Nova | Nunito Sans |
| GT Walsheim | DM Sans |

Always flag if a font is proprietary and confirm the substitute with the user.
