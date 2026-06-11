'use client';

/**
 * Shared merge tag resolution for Contentful rich text fields.
 *
 * Provides a React hook (`useMergeTagRenderOptions`) that returns
 * `documentToReactComponents` options with INLINES.EMBEDDED_ENTRY handling.
 * Any component rendering rich text that may contain NtMergetag inline entries
 * should use these options.
 *
 * Resolution order for ntMergetagId paths:
 *   1. Direct dot-path on profile (e.g. "traits.first_name" → profile.traits.first_name)
 *   2. Auto-prefix "traits." (e.g. "firstName" → profile.traits.firstName)
 *   3. camelCase → snake_case under traits (e.g. "firstName" → profile.traits.first_name)
 */

import type { Options } from '@contentful/rich-text-react-renderer';
import { INLINES } from '@contentful/rich-text-types';
import { useProfile } from '@ninetailed/experience.js-react';
import { useMemo } from 'react';

import { useMergeTags } from '@/personalization/merge-tags-context';

// ── Resolution logic ────────────────────────────────────────────────────────

function walkPath(obj: unknown, path: string): unknown {
  const parts = path.split('.');
  let val: unknown = obj;
  for (const part of parts) {
    if (val === null || val === undefined || typeof val !== 'object') return undefined;
    val = (val as Record<string, unknown>)[part];
  }
  return val;
}

function toSnakeCase(s: string): string {
  return s.replace(/([A-Z])/g, '_$1').toLowerCase();
}

/**
 * Resolve a merge tag ID against the NT profile.
 * Handles dot-notation paths, auto-prefixing "traits.", and camelCase→snake_case.
 */
export function resolveMergeTagValue(
  profile: Record<string, unknown> | null,
  mergeTagId: string,
): string | null {
  if (!profile) return null;

  // 1. Direct path (e.g. "traits.first_name", "location.city", "session.count")
  let val = walkPath(profile, mergeTagId);
  if (val != null) return String(val);

  // 2. Auto-prefix "traits." (e.g. "firstName" → "traits.firstName")
  if (!mergeTagId.startsWith('traits.') && !mergeTagId.startsWith('location.') && !mergeTagId.startsWith('session.')) {
    val = walkPath(profile, `traits.${mergeTagId}`);
    if (val != null) return String(val);

    // 3. camelCase → snake_case under traits (e.g. "firstName" → "traits.first_name")
    const snake = toSnakeCase(mergeTagId);
    if (snake !== mergeTagId) {
      val = walkPath(profile, `traits.${snake}`);
      if (val != null) return String(val);
    }
  }

  return null;
}

// ── React hook ──────────────────────────────────────────────────────────────

/**
 * Returns `documentToReactComponents` render options that resolve NtMergetag
 * inline entries against the current NT profile. Merge with any component-specific
 * render options.
 *
 * Usage:
 * ```tsx
 * const mergeTagOptions = useMergeTagRenderOptions();
 * documentToReactComponents(rt.json, { ...baseOptions, ...mergeTagOptions });
 * ```
 */
export function useMergeTagRenderOptions(baseOptions?: Options): Options {
  const mergeTagMap = useMergeTags();
  const { profile } = useProfile();
  const fullProfile = profile as Record<string, unknown> | null;

  return useMemo<Options>(() => ({
    ...baseOptions,
    renderNode: {
      ...baseOptions?.renderNode,
      [INLINES.EMBEDDED_ENTRY]: (node, children) => {
        const id = (node.data?.target as { sys?: { id?: string } })?.sys?.id;
        if (!id) {
          // Fall through to base handler if present
          return baseOptions?.renderNode?.[INLINES.EMBEDDED_ENTRY]?.(node, children) ?? null;
        }
        const mergeTag = mergeTagMap.get(id);
        if (!mergeTag) {
          return baseOptions?.renderNode?.[INLINES.EMBEDDED_ENTRY]?.(node, children) ?? null;
        }
        const resolved = resolveMergeTagValue(fullProfile, mergeTag.ntMergetagId);
        return <span>{resolved ?? mergeTag.ntFallback ?? ''}</span>;
      },
    },
  }), [mergeTagMap, fullProfile, baseOptions]);
}
