/**
 * ContentMatchReveal -- shows which product tags (from ProductRecord.tags)
 * matched the agent/search query. Displayed alongside PLP results.
 *
 * Tags are classified into semantic categories (style, roomType, lightType,
 * material) for the demo narrative: "The agent matched these because the
 * product metadata was structured in Contentful."
 */
'use client';

import { X } from 'lucide-react';

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

const CHIP_COLOR = 'bg-primary/10 text-primary border-primary/20';

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
  /** Callback when a tag's X button is clicked */
  onRemoveTag?: (tag: string) => void;
}

export function ContentMatchReveal({
  matchedTags,
  className,
  onRemoveTag,
}: ContentMatchRevealProps) {
  if (matchedTags.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {matchedTags.map((tag) => {
        return (
          <span
            key={tag}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium',
              CHIP_COLOR,
            )}
          >
            {tag}
            {onRemoveTag && (
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="ml-0.5 rounded-full p-0.5 opacity-60 transition-opacity hover:opacity-100"
                aria-label={`Remove ${tag} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
}
