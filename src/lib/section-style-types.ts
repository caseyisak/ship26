/**
 * Section style config (JSON) edited by the Section style editor app.
 * Used by Hero and other sections that support style override.
 */

export type SectionStyleLayout = 'overlay' | 'split';
export type SectionStyleContentPosition = 'center' | 'left' | 'right';
export type SectionStyleContentWidth = '50%' | '33%';
export type SectionStyleContentColor = 'light' | 'dark' | 'auto';

export interface SectionStyleConfig {
  useStyleOverride: boolean;
  layout?: SectionStyleLayout;
  contentPosition?: SectionStyleContentPosition;
  contentWidth?: SectionStyleContentWidth;
  backgroundColor?: string;
  overlayOpacity?: number;
  imageBlur?: number;
  contentColor?: SectionStyleContentColor;
}

export const DEFAULT_SECTION_STYLE_CONFIG: SectionStyleConfig = {
  useStyleOverride: false,
  layout: 'overlay',
  contentPosition: 'center',
  contentWidth: '50%',
  overlayOpacity: 10,
  imageBlur: 5,
  contentColor: 'auto',
};

/**
 * Parse sectionStyle JSON from Contentful (string or null). Returns defaults when invalid/missing.
 */
export function parseSectionStyle(
  json: string | null | undefined,
): SectionStyleConfig {
  if (json == null || json === '') {
    return { ...DEFAULT_SECTION_STYLE_CONFIG };
  }
  try {
    const parsed = JSON.parse(
      typeof json === 'string' ? json : String(json),
    ) as Record<string, unknown>;
    if (parsed && typeof parsed === 'object') {
      return {
        ...DEFAULT_SECTION_STYLE_CONFIG,
        useStyleOverride: Boolean(parsed.useStyleOverride),
        layout:
          parsed.layout === 'overlay' || parsed.layout === 'split'
            ? parsed.layout
            : DEFAULT_SECTION_STYLE_CONFIG.layout,
        contentPosition:
          parsed.contentPosition === 'center' ||
          parsed.contentPosition === 'left' ||
          parsed.contentPosition === 'right'
            ? parsed.contentPosition
            : DEFAULT_SECTION_STYLE_CONFIG.contentPosition,
        contentWidth:
          parsed.contentWidth === '50%' || parsed.contentWidth === '33%'
            ? parsed.contentWidth
            : DEFAULT_SECTION_STYLE_CONFIG.contentWidth,
        backgroundColor:
          typeof parsed.backgroundColor === 'string'
            ? parsed.backgroundColor
            : undefined,
        overlayOpacity:
          typeof parsed.overlayOpacity === 'number' &&
          parsed.overlayOpacity >= 0 &&
          parsed.overlayOpacity <= 100
            ? parsed.overlayOpacity
            : DEFAULT_SECTION_STYLE_CONFIG.overlayOpacity,
        imageBlur:
          typeof parsed.imageBlur === 'number' &&
          parsed.imageBlur >= 0 &&
          parsed.imageBlur <= 100
            ? parsed.imageBlur
            : DEFAULT_SECTION_STYLE_CONFIG.imageBlur,
        contentColor:
          parsed.contentColor === 'light' ||
          parsed.contentColor === 'dark' ||
          parsed.contentColor === 'auto'
            ? parsed.contentColor
            : DEFAULT_SECTION_STYLE_CONFIG.contentColor,
      };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_SECTION_STYLE_CONFIG };
}
