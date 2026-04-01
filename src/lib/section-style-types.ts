/**
 * Section style config (JSON) edited by the Section style editor app.
 * Used by Hero and other sections that support style override.
 */

export type SectionStyleLayout = 'overlay' | 'split' | 'customGrid';
export type SectionStyleTextAlign = 'left' | 'center' | 'right';
export type SectionStyleSpacing = 'sm' | 'md' | 'lg' | 'xl';
export type SectionStyleContentPosition = 'center' | 'left' | 'right';
export type SectionStyleContentWidth = '50%' | '33%';
export type SectionStyleContentColor = 'light' | 'dark' | 'auto';

/** Tile IDs for Custom Grid layout */
export type SectionStyleTileId = 'content' | 'media' | 'background';

/** A tile in the Custom Grid layout */
export interface SectionStyleTile {
  id: SectionStyleTileId;
  gridCol: number; // 1-based column start
  gridRow: number; // 1-based row start
  colSpan: number; // number of columns to span
  rowSpan: number; // number of rows to span
  visible?: boolean; // default true; false = hidden
}

export interface SectionStyleConfig {
  useStyleOverride: boolean;
  layout?: SectionStyleLayout;
  contentPosition?: SectionStyleContentPosition;
  contentWidth?: SectionStyleContentWidth;
  backgroundColor?: string;
  overlayOpacity?: number;
  imageBlur?: number;
  contentColor?: SectionStyleContentColor;
  // Custom Grid fields (only used when layout === 'customGrid')
  gridColumns?: number; // fixed at 6
  gridRows?: number; // 2-6, default 3
  tiles?: SectionStyleTile[];
  // Content Style (banner + future blocks)
  textAlign?: SectionStyleTextAlign;
  contentSpacing?: SectionStyleSpacing;
  headlineColor?: string;
  subheadlineColor?: string;
  // Button Style (banner + future blocks)
  buttonBgColor?: string;
  buttonHoverColor?: string;
  buttonSpacing?: SectionStyleSpacing;
  buttonPlacement?: SectionStyleTextAlign;
}

/** Default grid dimensions for Custom Grid */
export const DEFAULT_GRID_COLUMNS = 6;
export const DEFAULT_GRID_ROWS = 3;

/** Generate default tiles for Custom Grid (optionally including background) */
export function getDefaultTiles(hasBackground: boolean): SectionStyleTile[] {
  const tiles: SectionStyleTile[] = [
    {
      id: 'content',
      gridCol: 1,
      gridRow: 1,
      colSpan: 2,
      rowSpan: 2,
      visible: true,
    },
    {
      id: 'media',
      gridCol: 4,
      gridRow: 1,
      colSpan: 2,
      rowSpan: 2,
      visible: true,
    },
  ];
  if (hasBackground) {
    tiles.push({
      id: 'background',
      gridCol: 1,
      gridRow: 1,
      colSpan: DEFAULT_GRID_COLUMNS,
      rowSpan: DEFAULT_GRID_ROWS,
      visible: true,
    });
  }
  return tiles;
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

/** Validate and parse a single tile */
function parseTile(t: unknown): SectionStyleTile | null {
  if (!t || typeof t !== 'object') return null;
  const tile = t as Record<string, unknown>;
  const id = tile.id;
  if (id !== 'content' && id !== 'media' && id !== 'background') return null;
  const gridCol = typeof tile.gridCol === 'number' ? tile.gridCol : 1;
  const gridRow = typeof tile.gridRow === 'number' ? tile.gridRow : 1;
  const colSpan = typeof tile.colSpan === 'number' ? tile.colSpan : 1;
  const rowSpan = typeof tile.rowSpan === 'number' ? tile.rowSpan : 1;
  const visible = tile.visible !== false; // default true
  return { id, gridCol, gridRow, colSpan, rowSpan, visible };
}

/** Parse tiles array from JSON */
function parseTiles(arr: unknown): SectionStyleTile[] | undefined {
  if (!Array.isArray(arr)) return undefined;
  const tiles: SectionStyleTile[] = [];
  for (const item of arr) {
    const tile = parseTile(item);
    if (tile) tiles.push(tile);
  }
  return tiles.length > 0 ? tiles : undefined;
}

/**
 * Parse sectionStyle from Contentful. Accepts a JSON string, a pre-parsed object (Contentful
 * GraphQL JSON fields return objects, not strings), or null/undefined. Returns defaults when
 * invalid/missing.
 */
export function parseSectionStyle(
  json: unknown,
): SectionStyleConfig {
  if (json == null || json === '') {
    return { ...DEFAULT_SECTION_STYLE_CONFIG };
  }
  try {
    const parsed = (typeof json === 'string' ? JSON.parse(json) : json) as Record<string, unknown>;
    if (parsed && typeof parsed === 'object') {
      const layout =
        parsed.layout === 'overlay' ||
        parsed.layout === 'split' ||
        parsed.layout === 'customGrid'
          ? parsed.layout
          : DEFAULT_SECTION_STYLE_CONFIG.layout;

      const result: SectionStyleConfig = {
        ...DEFAULT_SECTION_STYLE_CONFIG,
        useStyleOverride: Boolean(parsed.useStyleOverride),
        layout,
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

      // Content Style fields
      if (
        parsed.textAlign === 'left' ||
        parsed.textAlign === 'center' ||
        parsed.textAlign === 'right'
      ) {
        result.textAlign = parsed.textAlign;
      }
      if (
        parsed.contentSpacing === 'sm' ||
        parsed.contentSpacing === 'md' ||
        parsed.contentSpacing === 'lg' ||
        parsed.contentSpacing === 'xl'
      ) {
        result.contentSpacing = parsed.contentSpacing;
      }
      if (typeof parsed.headlineColor === 'string') {
        result.headlineColor = parsed.headlineColor;
      }
      if (typeof parsed.subheadlineColor === 'string') {
        result.subheadlineColor = parsed.subheadlineColor;
      }
      // Button Style fields
      if (typeof parsed.buttonBgColor === 'string') {
        result.buttonBgColor = parsed.buttonBgColor;
      }
      if (typeof parsed.buttonHoverColor === 'string') {
        result.buttonHoverColor = parsed.buttonHoverColor;
      }
      if (
        parsed.buttonSpacing === 'sm' ||
        parsed.buttonSpacing === 'md' ||
        parsed.buttonSpacing === 'lg' ||
        parsed.buttonSpacing === 'xl'
      ) {
        result.buttonSpacing = parsed.buttonSpacing;
      }
      if (
        parsed.buttonPlacement === 'left' ||
        parsed.buttonPlacement === 'center' ||
        parsed.buttonPlacement === 'right'
      ) {
        result.buttonPlacement = parsed.buttonPlacement;
      }

      // Custom Grid fields
      if (layout === 'customGrid') {
        result.gridColumns =
          typeof parsed.gridColumns === 'number' &&
          parsed.gridColumns >= 2 &&
          parsed.gridColumns <= 6
            ? parsed.gridColumns
            : DEFAULT_GRID_COLUMNS;
        result.gridRows =
          typeof parsed.gridRows === 'number' &&
          parsed.gridRows >= 2 &&
          parsed.gridRows <= 6
            ? parsed.gridRows
            : DEFAULT_GRID_ROWS;
        result.tiles = parseTiles(parsed.tiles);
      }

      return result;
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_SECTION_STYLE_CONFIG };
}
