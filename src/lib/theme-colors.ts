/**
 * theme-colors.ts — Single source of truth for all color-variant → style mappings.
 *
 * Every class and CSS variable here resolves to a value set by themeToStyle()
 * in src/services/contentful/settings.ts, which reads the `theme` JSON field
 * from the Global Settings Contentful entry (ID: 2cgyEdELIF1EbwlLLdSZgR).
 *
 * Changing the theme in that entry re-themes the entire site with no code change.
 *
 * DO NOT hardcode color values in components. Import from here instead.
 * Exception: src/app/contentful-app/** (custom Contentful UI apps).
 *
 * CSS variable reference (set by themeToStyle from Settings JSON):
 *   --background        page surface
 *   --foreground        primary text / darkest surface
 *   --card              card surface (can differ from --background)
 *   --muted             subtle gray surface
 *   --muted-foreground  secondary text
 *   --accent            brand accent tint
 *   --accent-foreground text on accent surface
 *   --primary           brand primary color
 *   --primary-foreground text on primary surface
 *   --secondary         secondary surface
 *   --secondary-foreground text on secondary surface
 *   --border            default border color
 *   --border-light      lighter border variant
 *   --tagline           tagline / highlight text color
 */

// ─────────────────────────────────────────────────────────────────────────────
// Section-level (full-width sections: CardsWrapper, Hero, Banner, CTA, etc.)
// Applied to the outermost <section> element.
// ─────────────────────────────────────────────────────────────────────────────

/** Background class for a section based on colorVariant / backgroundColor. */
export function sectionBgClass(
  colorVariant: string | null | undefined,
): string {
  switch (colorVariant) {
    case 'light':     return 'bg-muted';
    case 'dark':      return 'bg-foreground';
    case 'alt':       return 'bg-secondary';
    case 'accent':    return 'bg-accent';
    case 'primary':   return 'bg-primary';
    case 'secondary': return 'bg-secondary';
    default:          return 'bg-background';
  }
}

/** Foreground text class that pairs with sectionBgClass. */
export function sectionTextClass(
  colorVariant: string | null | undefined,
): string {
  switch (colorVariant) {
    case 'dark':      return 'text-background';
    case 'alt':       return 'text-secondary-foreground';
    case 'accent':    return 'text-accent-foreground';
    case 'primary':   return 'text-primary-foreground';
    case 'secondary': return 'text-secondary-foreground';
    default:          return 'text-foreground';
  }
}

/** Muted/secondary text class within a section (e.g. descriptions, captions). */
export function sectionMutedTextClass(
  colorVariant: string | null | undefined,
): string {
  switch (colorVariant) {
    case 'dark':    return 'text-background/70';
    case 'primary': return 'text-primary-foreground/80';
    case 'accent':  return 'text-primary-foreground/80';
    default:        return 'text-muted-foreground';
  }
}

/**
 * Combined bg + text for sections — convenience when you need both classes.
 * Usage: <section className={cn(sectionClasses(colorVariant), 'px-6 ...')} />
 */
export function sectionClasses(
  colorVariant: string | null | undefined,
): string {
  return `${sectionBgClass(colorVariant)} ${sectionTextClass(colorVariant)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Card-level (individual Card CT entries rendered by CardRenderer)
// Applied to the card container div. Includes border/shadow where appropriate.
// ─────────────────────────────────────────────────────────────────────────────

export function cardBgClass(
  colorVariant: string | null | undefined,
  style: string | null | undefined,
): string {
  if (style === 'borderless') return '';
  switch (colorVariant) {
    case 'transparent': return ''; // legacy — kept for existing entries
    case 'default':     return 'bg-card border border-border-light shadow-[0_2px_8px_-1px_rgba(13,13,18,0.04)]';
    case 'light':       return 'bg-muted/60 border border-border';
    case 'dark':        return 'bg-foreground border-transparent';
    case 'accent':      return 'bg-accent border border-accent/20';
    default:
      return 'bg-card border border-border-light shadow-[0_2px_8px_-1px_rgba(13,13,18,0.04)]';
  }
}

/**
 * Text color for card content based on colorVariant.
 * Returns '' for null/default → inherits section text color (correct on dark sections).
 */
export function cardTextClass(colorVariant: string | null | undefined): string {
  switch (colorVariant) {
    case 'dark':    return 'text-background';
    case 'accent':  return 'text-accent-foreground';
    case 'light':
    case 'default': return 'text-foreground';
    default:        return ''; // inherit section color
  }
}

/**
 * Muted/description text for cards. Uses opacity for null/default so it
 * stays readable on any section background (light or dark).
 */
export function cardMutedTextClass(colorVariant: string | null | undefined): string {
  switch (colorVariant) {
    case 'dark':    return 'text-background/70';
    case 'accent':  return 'text-accent-foreground/80';
    case 'light':
    case 'default': return 'text-muted-foreground';
    default:        return 'opacity-70'; // inherit section color at 70%
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pricing plan cards (Pricing component)
// ─────────────────────────────────────────────────────────────────────────────

export function planCardBgClass(
  colorVariant: string | null | undefined,
): string {
  switch (colorVariant) {
    case 'dark':    return 'bg-foreground border-transparent text-background';
    case 'primary': return 'bg-primary border-transparent text-primary-foreground';
    default:        return 'bg-card border-border-light text-foreground';
  }
}

export function planCardMutedClass(
  colorVariant: string | null | undefined,
): string {
  switch (colorVariant) {
    case 'dark':    return 'text-background/70';
    case 'primary': return 'text-primary-foreground/80';
    default:        return 'text-muted-foreground';
  }
}

export function planCardBtnClass(
  colorVariant: string | null | undefined,
): string {
  switch (colorVariant) {
    case 'dark':    return 'bg-background text-foreground hover:bg-background/90';
    case 'primary': return 'bg-primary-foreground text-primary hover:bg-primary-foreground/90';
    default:        return 'bg-primary text-primary-foreground hover:bg-primary/90';
  }
}

export function planCardCheckClass(
  colorVariant: string | null | undefined,
): string {
  switch (colorVariant) {
    case 'dark':    return 'text-background';
    case 'primary': return 'text-primary-foreground';
    default:        return 'text-tagline';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CTA section buttons (CtaSection component)
// Returns inline style objects so callers can spread onto <button style={...}>.
// ─────────────────────────────────────────────────────────────────────────────

export function ctaPrimaryBtnStyle(
  colorVariant: string | null | undefined,
): Record<string, string> {
  switch (colorVariant) {
    case 'accent':
    case 'dark':
      return { backgroundColor: 'var(--background)', color: 'var(--foreground)' };
    default:
      return { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' };
  }
}

export function ctaSecondaryBtnStyle(
  colorVariant: string | null | undefined,
): Record<string, string> {
  switch (colorVariant) {
    case 'accent':
    case 'dark':
      return { color: 'var(--background)', borderColor: 'var(--background)' };
    default:
      return { color: 'var(--foreground)', borderColor: 'var(--border)' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Feature section cards (FeatureSection component)
// Note: these use named color tokens (blue, green, etc.) rather than semantic
// theme tokens. They will be migrated to CSS variables when theme support for
// named palette colors is added to the Settings JSON.
// ─────────────────────────────────────────────────────────────────────────────

export function featureCardBgClass(
  colorVariant: string | null | undefined,
): string {
  switch (colorVariant) {
    case 'blue':   return 'bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100';
    case 'green':  return 'bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100';
    case 'purple': return 'bg-purple-50 text-purple-900 dark:bg-purple-950 dark:text-purple-100';
    case 'orange': return 'bg-orange-50 text-orange-900 dark:bg-orange-950 dark:text-orange-100';
    case 'red':    return 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100';
    case 'gray':   return 'bg-muted text-muted-foreground';
    default:       return 'bg-card';
  }
}
