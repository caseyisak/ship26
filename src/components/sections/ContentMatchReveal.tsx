/**
 * ContentMatchReveal -- shows which product tags (from ProductRecord.tags)
 * matched the agent/search query. Displayed alongside PLP results.
 *
 * Tags are classified into semantic categories (style, roomType, lightType,
 * material) for the demo narrative: "The agent matched these because the
 * product metadata was structured in Contentful."
 */
'use client';

import { Tag } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

// ── Tag classification ──────────────────────────────────────────────────────

const TAG_CATEGORIES: Record<string, string[]> = {
  style: ['statement', 'sculptural', 'minimalist', 'modern', 'contemporary', 'traditional', 'industrial', 'compact'],
  roomType: ['living-room', 'bedroom', 'reading-corner', 'studio', 'office', 'kitchen', 'dining', 'small-spaces'],
  lightType: ['warm-ambient', 'task-lighting', 'accent-lighting', 'desk-lighting', 'directional'],
  material: ['matte-black', 'brass', 'chrome', 'wood', 'steel', 'marble', 'glass'],
};

const CATEGORY_LABELS: Record<string, string> = {
  style: 'Style',
  roomType: 'Room type',
  lightType: 'Light type',
  material: 'Material',
  feature: 'Feature',
};

const CATEGORY_COLORS: Record<string, string> = {
  style: 'bg-purple-50 text-purple-700 border-purple-200',
  roomType: 'bg-blue-50 text-blue-700 border-blue-200',
  lightType: 'bg-amber-50 text-amber-700 border-amber-200',
  material: 'bg-slate-100 text-slate-700 border-slate-300',
  feature: 'bg-green-50 text-green-700 border-green-200',
};

function classifyTag(tag: string): string {
  for (const [category, tags] of Object.entries(TAG_CATEGORIES)) {
    if (tags.includes(tag)) return category;
  }
  return 'feature';
}

type GroupedTags = Record<string, string[]>;

function groupTags(tags: string[]): GroupedTags {
  const groups: GroupedTags = {};
  for (const tag of tags) {
    const cat = classifyTag(tag);
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(tag);
  }
  return groups;
}

// ── Component ────────────────────────────────────────────────────────────────

interface ContentMatchRevealProps {
  /** All matched tags from the product results */
  matchedTags: string[];
  /** The query that triggered the match */
  query?: string;
  /** Optional className */
  className?: string;
}

export function ContentMatchReveal({
  matchedTags,
  query,
  className,
}: ContentMatchRevealProps) {
  if (matchedTags.length === 0) return null;

  const grouped = groupTags(matchedTags);
  const categories = Object.keys(grouped).sort();

  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white p-4 shadow-sm',
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <Tag className="h-4 w-4 text-slate-500" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Contentful tags matched
        </h3>
      </div>

      {query && (
        <p className="mb-3 text-xs text-slate-400">
          Query: &quot;{query}&quot;
        </p>
      )}

      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat} className="flex items-start gap-2">
            <span className="mt-0.5 w-20 flex-shrink-0 text-xs font-medium text-slate-500">
              {CATEGORY_LABELS[cat] ?? cat}:
            </span>
            <div className="flex flex-wrap gap-1">
              {grouped[cat].map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
                    CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.feature,
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
