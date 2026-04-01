import { describe, expect, it } from 'vitest';

import {
  DEFAULT_SECTION_STYLE_CONFIG,
  parseSectionStyle,
} from './section-style-types';

describe('parseSectionStyle', () => {
  it('returns defaults when passed null', () => {
    const result = parseSectionStyle(null);
    expect(result).toEqual({ ...DEFAULT_SECTION_STYLE_CONFIG });
  });

  it('returns defaults when passed undefined', () => {
    const result = parseSectionStyle(undefined);
    expect(result).toEqual({ ...DEFAULT_SECTION_STYLE_CONFIG });
  });

  it('returns defaults when passed empty string', () => {
    const result = parseSectionStyle('');
    expect(result).toEqual({ ...DEFAULT_SECTION_STYLE_CONFIG });
  });

  it('parses a valid JSON string', () => {
    const json = JSON.stringify({ useStyleOverride: true, layout: 'split' });
    const result = parseSectionStyle(json);
    expect(result.useStyleOverride).toBe(true);
    expect(result.layout).toBe('split');
  });

  it('accepts a pre-parsed object (Contentful GraphQL JSON field)', () => {
    const obj = { useStyleOverride: true, layout: 'overlay' };
    const result = parseSectionStyle(obj);
    expect(result.useStyleOverride).toBe(true);
    expect(result.layout).toBe('overlay');
  });

  it('returns defaults for invalid JSON string', () => {
    const result = parseSectionStyle('{ not valid json !!');
    expect(result).toEqual({ ...DEFAULT_SECTION_STYLE_CONFIG });
  });

  it('sets textAlign left', () => {
    const result = parseSectionStyle({ textAlign: 'left' });
    expect(result.textAlign).toBe('left');
  });

  it('sets textAlign center', () => {
    const result = parseSectionStyle({ textAlign: 'center' });
    expect(result.textAlign).toBe('center');
  });

  it('sets textAlign right', () => {
    const result = parseSectionStyle({ textAlign: 'right' });
    expect(result.textAlign).toBe('right');
  });

  it('ignores invalid textAlign value — leaves textAlign undefined', () => {
    const result = parseSectionStyle({ textAlign: 'justify' });
    expect(result.textAlign).toBeUndefined();
  });

  it('sets valid buttonPlacement', () => {
    const result = parseSectionStyle({ buttonPlacement: 'right' });
    expect(result.buttonPlacement).toBe('right');
  });

  it('ignores invalid buttonPlacement — leaves it undefined', () => {
    const result = parseSectionStyle({ buttonPlacement: 'top' });
    expect(result.buttonPlacement).toBeUndefined();
  });

  it('sets valid buttonSpacing', () => {
    const result = parseSectionStyle({ buttonSpacing: 'lg' });
    expect(result.buttonSpacing).toBe('lg');
  });

  it('ignores invalid buttonSpacing — leaves it undefined', () => {
    const result = parseSectionStyle({ buttonSpacing: 'xxl' });
    expect(result.buttonSpacing).toBeUndefined();
  });

  it('passes headlineColor and subheadlineColor through as strings', () => {
    const result = parseSectionStyle({
      headlineColor: '#ffffff',
      subheadlineColor: '#cccccc',
    });
    expect(result.headlineColor).toBe('#ffffff');
    expect(result.subheadlineColor).toBe('#cccccc');
  });

  it('excludes headlineColor / subheadlineColor when not a string', () => {
    const result = parseSectionStyle({
      headlineColor: 42,
      subheadlineColor: null,
    });
    expect(result.headlineColor).toBeUndefined();
    expect(result.subheadlineColor).toBeUndefined();
  });

  it('passes buttonBgColor through as a string', () => {
    const result = parseSectionStyle({ buttonBgColor: '#0B1F41' });
    expect(result.buttonBgColor).toBe('#0B1F41');
  });

  it('sets useStyleOverride to true', () => {
    const result = parseSectionStyle({ useStyleOverride: true });
    expect(result.useStyleOverride).toBe(true);
  });

  it('sets gridColumns, gridRows, tiles when layout is customGrid', () => {
    const result = parseSectionStyle({
      layout: 'customGrid',
      gridColumns: 4,
      gridRows: 3,
      tiles: [
        { id: 'content', gridCol: 1, gridRow: 1, colSpan: 2, rowSpan: 2 },
        { id: 'media', gridCol: 4, gridRow: 1, colSpan: 2, rowSpan: 2 },
      ],
    });
    expect(result.layout).toBe('customGrid');
    expect(result.gridColumns).toBe(4);
    expect(result.gridRows).toBe(3);
    expect(result.tiles).toHaveLength(2);
    expect(result.tiles?.[0].id).toBe('content');
  });
});
