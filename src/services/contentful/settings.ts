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
  page?: { __typename: string; slug: string };
}

export interface Nav {
  internalName: string;
  logo?: SettingsAsset | null;
  linksCollection: {
    items: NavLink[];
  };
}

export interface FooterColumn {
  heading: string | null;
  links: NavLink[];
}

export interface Footer {
  internalName: string;
  tagline?: string | null;
  logo?: SettingsAsset | null;
  colorVariant?: string | null;
  linksCollection: {
    items: NavLink[];
  };
  col1?: FooterColumn | null;
  col2?: FooterColumn | null;
  col3?: FooterColumn | null;
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
  thirdPartyCatalog?: Record<string, unknown[]> | null;
}

const NAV_LINKS_FRAGMENT = `
  linksCollection(limit: 10) {
    items {
      sys { id }
      label
      url
      page {
        __typename
        ... on Page { slug }
        ... on ProductListing { slug }
      }
    }
  }
`;

/** Inline fragment for a column links reference field (col1Links, col2Links, col3Links). */
const COLUMN_LINKS_FRAGMENT = `
  items {
    sys { id }
    label
    url
    page {
      __typename
      ... on Page { slug }
      ... on ProductListing { slug }
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
          colorVariant
          logo { url title width height }
          ${NAV_LINKS_FRAGMENT}
          col1Heading
          col1LinksCollection(limit: 10) { ${COLUMN_LINKS_FRAGMENT} }
          col2Heading
          col2LinksCollection(limit: 10) { ${COLUMN_LINKS_FRAGMENT} }
          col3Heading
          col3LinksCollection(limit: 10) { ${COLUMN_LINKS_FRAGMENT} }
        }
        productCatalog
        assetCatalog
        thirdPartyCatalog
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
  page?: { __typename: string; slug: string } | null;
};

type RawNav = {
  internalName: string;
  logo?: SettingsAsset | null;
  linksCollection: { items: RawNavLink[] };
};

type RawFooter = {
  internalName: string;
  tagline?: string | null;
  colorVariant?: string | null;
  logo?: SettingsAsset | null;
  linksCollection: { items: RawNavLink[] };
  col1Heading?: string | null;
  col1LinksCollection?: { items: RawNavLink[] } | null;
  col2Heading?: string | null;
  col2LinksCollection?: { items: RawNavLink[] } | null;
  col3Heading?: string | null;
  col3LinksCollection?: { items: RawNavLink[] } | null;
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
      thirdPartyCatalog?: Record<string, unknown[]> | null;
    }>;
  };
};

function resolveNavLinks(items: RawNavLink[]): NavLink[] {
  return items.map((item) => ({
    label: item.label,
    ...(item.url ? { url: item.url } : {}),
    ...(item.page ? { page: { __typename: item.page.__typename, slug: item.page.slug } } : {}),
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
            colorVariant: raw.footer.colorVariant ?? null,
            logo: raw.footer.logo ?? null,
            linksCollection: {
              items: resolveNavLinks(raw.footer.linksCollection?.items ?? []),
            },
            col1: raw.footer.col1LinksCollection
              ? { heading: raw.footer.col1Heading ?? null, links: resolveNavLinks(raw.footer.col1LinksCollection.items ?? []) }
              : null,
            col2: raw.footer.col2LinksCollection
              ? { heading: raw.footer.col2Heading ?? null, links: resolveNavLinks(raw.footer.col2LinksCollection.items ?? []) }
              : null,
            col3: raw.footer.col3LinksCollection
              ? { heading: raw.footer.col3Heading ?? null, links: resolveNavLinks(raw.footer.col3LinksCollection.items ?? []) }
              : null,
          }
        : null,
      productCatalog: raw.productCatalog ?? null,
      assetCatalog: raw.assetCatalog ?? null,
      thirdPartyCatalog: raw.thirdPartyCatalog ?? null,
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
 * Special keys "fontDisplay" / "fontBody" generate Google Fonts @import URLs
 * and set --font-display / --font-body CSS vars.
 * Special key "fontDisplayWeight" sets --font-display-weight.
 */
export function themeToStyle(
  theme: Record<string, string> | null | undefined,
): string {
  if (!theme || Object.keys(theme).length === 0) return '';
  const imports: string[] = [];
  const styles: Record<string, string> = {};

  for (const [k, v] of Object.entries(theme)) {
    if (k === 'cornerStyle') {
      if (CORNER_RADIUS[v]) {
        styles['--radius'] = CORNER_RADIUS[v];
      }
    } else if (k === 'fontDisplay') {
      // Skip if "Inter" — already loaded by Next.js via --font-inter; avoids
      // double-load and lets the optimized next/font version take precedence.
      if (v.toLowerCase() !== 'inter') {
        const familyParam = v.replace(/ /g, '+');
        imports.push(`@import url('https://fonts.googleapis.com/css2?family=${familyParam}:wght@300;400;500;600;700;800&display=swap');`);
        styles['--font-display'] = `'${v}', sans-serif`;
      }
    } else if (k === 'fontBody') {
      if (v.toLowerCase() !== 'inter') {
        const familyParam = v.replace(/ /g, '+');
        imports.push(`@import url('https://fonts.googleapis.com/css2?family=${familyParam}:wght@100;200;300;400;500;600;700;800;900&display=swap');`);
        styles['--font-body'] = `'${v}', sans-serif`;
      }
    } else if (k === 'fontDisplayWeight') {
      styles['--font-display-weight'] = v;
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
  const rootBlock = `:root {\n${vars}\n}`;
  return imports.length > 0 ? `${imports.join('\n')}\n${rootBlock}` : rootBlock;
}
