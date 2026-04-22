import type { FormFragment, NtExperienceFragment } from '@/block-renderer/types';
import type { AssetRecord, ProductRecord } from '@/lib/integration-adapters/types';

import { fetchGraphQL } from './client';

interface SettingsAsset {
  url: string;
  title: string | null;
  width: number | null;
  height: number | null;
}

export interface NavLink {
  label: string;
  url?: string;
  page?: { slug: string };
}

export interface Nav {
  internalName: string;
  logo?: SettingsAsset | null;
  linksCollection: {
    items: NavLink[];
  };
}

export interface Footer {
  internalName: string;
  tagline?: string | null;
  logo?: SettingsAsset | null;
  linksCollection: {
    items: NavLink[];
  };
}

export interface SiteSettings {
  internalName: string;
  loggedInMetadata: Record<string, unknown> | null;
  theme: Record<string, string> | null;
  nav: Nav | null;
  footer: Footer | null;
  footerForm?: FormFragment | null;
  productCatalog?: ProductRecord[] | null;
  assetCatalog?: AssetRecord[] | null;
}

const NAV_LINKS_FRAGMENT = `
  linksCollection {
    items {
      sys { id }
      label
      url
      page { slug }
    }
  }
`;

const SETTINGS_QUERY = `
  query GetSettings($preview: Boolean) {
    settingsCollection(limit: 1, preview: $preview) {
      items {
        internalName
        loggedInMetadata
        theme
        nav {
          internalName
          logo { url title width height }
          ${NAV_LINKS_FRAGMENT}
        }
        footer {
          internalName
          tagline
          logo { url title width height }
          ${NAV_LINKS_FRAGMENT}
        }
        productCatalog
        assetCatalog
        footerForm {
          __typename
          sys { id }
          ... on Form {
            internalName
            formId
            formType
            labelRt { json }
            titleRt { json }
            descriptionRt { json }
            submitLabel
            successMessageRt { json }
            redirectUrl
            colorVariant
          }
        }
      }
    }
  }
`;

type RawNavLink = {
  sys: { id: string };
  label: string;
  url?: string | null;
  page?: { slug: string } | null;
};

type RawNav = {
  internalName: string;
  logo?: SettingsAsset | null;
  linksCollection: { items: RawNavLink[] };
};

type RawFooter = {
  internalName: string;
  tagline?: string | null;
  logo?: SettingsAsset | null;
  linksCollection: { items: RawNavLink[] };
};

type RawFormSettings = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  formId?: string | null;
  formType?: string | null;
  labelRt?: { json: Record<string, unknown> } | null;
  titleRt?: { json: Record<string, unknown> } | null;
  descriptionRt?: { json: Record<string, unknown> } | null;
  submitLabel?: string | null;
  successMessageRt?: { json: Record<string, unknown> } | null;
  redirectUrl?: string | null;
  colorVariant?: string | null;
};

type SettingsResponse = {
  settingsCollection: {
    items: Array<{
      internalName: string;
      loggedInMetadata: Record<string, unknown> | null;
      theme: Record<string, string> | null;
      nav: RawNav | null;
      footer: RawFooter | null;
      footerForm?: RawFormSettings | null;
      productCatalog?: ProductRecord[] | null;
      assetCatalog?: AssetRecord[] | null;
    }>;
  };
};

function resolveNavLinks(items: RawNavLink[]): NavLink[] {
  return items.map((item) => ({
    label: item.label,
    ...(item.url ? { url: item.url } : {}),
    ...(item.page ? { page: { slug: item.page.slug } } : {}),
  }));
}

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
      theme: raw.theme ?? null,
      nav: raw.nav
        ? {
            internalName: raw.nav.internalName,
            logo: raw.nav.logo ?? null,
            linksCollection: {
              items: resolveNavLinks(raw.nav.linksCollection?.items ?? []),
            },
          }
        : null,
      footer: raw.footer
        ? {
            internalName: raw.footer.internalName,
            tagline: raw.footer.tagline ?? null,
            logo: raw.footer.logo ?? null,
            linksCollection: {
              items: resolveNavLinks(raw.footer.linksCollection?.items ?? []),
            },
          }
        : null,
      productCatalog: raw.productCatalog ?? null,
      assetCatalog: raw.assetCatalog ?? null,
      footerForm: raw.footerForm && raw.footerForm.__typename === 'Form'
        ? {
            __typename: 'Form' as const,
            sys: { id: raw.footerForm.sys.id },
            internalName: raw.footerForm.internalName ?? null,
            formId: raw.footerForm.formId ?? null,
            formType: (raw.footerForm.formType as FormFragment['formType']) ?? null,
            labelRt: raw.footerForm.labelRt ?? null,
            titleRt: raw.footerForm.titleRt ?? null,
            descriptionRt: raw.footerForm.descriptionRt ?? null,
            submitLabel: raw.footerForm.submitLabel ?? null,
            successMessageRt: raw.footerForm.successMessageRt ?? null,
            redirectUrl: raw.footerForm.redirectUrl ?? null,
            colorVariant: (raw.footerForm.colorVariant as FormFragment['colorVariant']) ?? null,
          }
        : null,
    };
  } catch {
    return null;
  }
}

const CORNER_RADIUS: Record<string, string> = {
  square: '0px',
  rounded: '0.375rem', // 6px
  'rounded-lg': '0.75rem', // 12px
  pill: '9999px',
};

/**
 * Convert a theme object (camelCase keys → CSS var values) into an inline
 * <style> string. Falls back to nothing if theme is null/empty.
 * Keys like "primaryForeground" → "--primary-foreground".
 * Special key "cornerStyle" maps to "--radius" via CORNER_RADIUS lookup.
 */
export function themeToStyle(
  theme: Record<string, string> | null | undefined,
): string {
  if (!theme || Object.keys(theme).length === 0) return '';
  const styles: Record<string, string> = {};

  for (const [k, v] of Object.entries(theme)) {
    if (k === 'cornerStyle') {
      if (CORNER_RADIUS[v]) {
        styles['--radius'] = CORNER_RADIUS[v];
      }
    } else if (k.startsWith('--')) {
      // Key is already a CSS var name — use as-is
      styles[k] = v;
    } else {
      // camelCase key → kebab CSS var
      styles[`--${k.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = v;
    }
  }

  const vars = Object.entries(styles)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  return `:root {\n${vars}\n}`;
}
