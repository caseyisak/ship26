import { fetchGraphQL } from './client';

interface SettingsAsset {
  url: string;
  title: string | null;
  width: number | null;
  height: number | null;
}

export interface SiteSettings {
  internalName: string;
  loggedInMetadata: Record<string, unknown> | null;
  siteIcon: SettingsAsset | null;
  theme: Record<string, string> | null;
  navItems: Array<{ label: string; href: string }> | null;
}

const SETTINGS_QUERY = `
  query GetSettings($preview: Boolean) {
    settingsCollection(limit: 1, preview: $preview) {
      items {
        internalName
        loggedInMetadata
        siteIcon { url title width height }
        theme
        navItems
      }
    }
  }
`;

type SettingsResponse = {
  settingsCollection: {
    items: Array<{
      internalName: string;
      loggedInMetadata: Record<string, unknown> | null;
      siteIcon: SettingsAsset | null;
      theme: Record<string, string> | null;
      navItems: Array<{ label: string; href: string }> | null;
    }>;
  };
};

export async function getSettings({
  preview = false,
}: { preview?: boolean } = {}): Promise<SiteSettings | null> {
  try {
    const data = await fetchGraphQL<SettingsResponse>({
      query: SETTINGS_QUERY,
      variables: { preview },
      preview,
    });
    const raw = data.settingsCollection?.items?.[0];
    if (!raw) return null;
    return {
      internalName: raw.internalName,
      loggedInMetadata: raw.loggedInMetadata ?? null,
      siteIcon: raw.siteIcon ?? null,
      theme: raw.theme ?? null,
      navItems: raw.navItems ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Convert a theme object (camelCase keys → CSS var values) into an inline
 * <style> string. Falls back to nothing if theme is null/empty.
 * Keys like "primaryForeground" → "--primary-foreground".
 */
export function themeToStyle(theme: Record<string, string> | null | undefined): string {
  if (!theme || Object.keys(theme).length === 0) return '';
  const vars = Object.entries(theme)
    .map(([k, v]) => `  --${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v};`)
    .join('\n');
  return `:root {\n${vars}\n}`;
}
