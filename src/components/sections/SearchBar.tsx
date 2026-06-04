'use client';

import { Search, X, FileText, Package, BookOpen } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { cn } from '@/lib/utils';

// ── Document type colors — matches DocumentSection.tsx ────────────────────────

const DOC_COLORS: Record<string, string> = {
  COA: '#16a34a', // green
  SDS: '#dc2626', // red
  IFU: '#2563eb', // blue
};

// ── Hardcoded demo results ────────────────────────────────────────────────────

interface SearchResult {
  id: string;
  title: string;
  type: 'Product' | 'Document' | 'Page';
  docType?: 'COA' | 'SDS' | 'IFU';
  isAuthenticated?: boolean;
  excerpt: string;
  href: string;
}

const DEMO_RESULTS: SearchResult[] = [
  {
    id: '1',
    title: 'Escherichia coli derived from ATCC 25922',
    type: 'Product',
    excerpt: 'CLSI and EUCAST control for antimicrobial susceptibility testing. SKU: 0335P. KWIK-STIK 2 Pack.',
    href: '/products/0335P',
  },
  {
    id: '2',
    title: '0335P — KWIK-STIK E. coli Reference Strain',
    type: 'Product',
    excerpt: 'BSL-1 strain. In stock. Catalog number 0335P. Bacteria, AST, CLSI, EUCAST, ISO 11133.',
    href: '/products/0335P',
  },
  {
    id: '3',
    title: 'Certificate of Analysis — Escherichia coli ATCC 25922',
    type: 'Document',
    docType: 'COA',
    excerpt: 'COA for 0335P. Public access. Includes QC test results, organism identity confirmation, and lot-specific data.',
    href: '/products/0335P',
  },
  {
    id: '4',
    title: 'Safety Data Sheet — Escherichia coli ATCC 25922',
    type: 'Document',
    docType: 'SDS',
    isAuthenticated: true,
    excerpt: 'SDS for 0335P. Authenticated access required. Hazard classification, handling, storage, and disposal data.',
    href: '/products/0335P',
  },
  {
    id: '5',
    title: 'Instructions for Use — KWIK-STIK Format',
    type: 'Document',
    docType: 'IFU',
    isAuthenticated: true,
    excerpt: 'IFU for KWIK-STIK product line. Authenticated access required. Preparation, inoculation, and QC procedures.',
    href: '/products/0335P',
  },
  {
    id: '6',
    title: 'KWIK-STIK Reference Strains',
    type: 'Page',
    excerpt: 'Product listing for all KWIK-STIK format reference materials. Includes E. coli, S. aureus, C. parapsilosis.',
    href: '/products/kwik-stik',
  },
];

const TYPE_ICON = {
  Product: Package,
  Document: FileText,
  Page: BookOpen,
};

const DOC_BADGE_COLORS: Record<string, string> = {
  COA: 'bg-green-100 text-green-700',
  SDS: 'bg-red-100 text-red-700',
  IFU: 'bg-blue-100 text-blue-700',
};

const TYPE_BADGE_COLORS: Record<SearchResult['type'], string> = {
  Product: 'bg-blue-100 text-blue-700',
  Document: 'bg-green-100 text-green-700',
  Page: 'bg-slate-100 text-slate-600',
};

// ── Result card ───────────────────────────────────────────────────────────────

function ResultCard({ result }: { result: SearchResult }) {
  const Icon = TYPE_ICON[result.type];
  const isColoredDoc = result.type === 'Document' && result.docType;
  const badgeColor = result.docType
    ? DOC_BADGE_COLORS[result.docType]
    : TYPE_BADGE_COLORS[result.type];
  const badgeLabel = result.docType ?? result.type;

  return (
    <a
      href={result.href}
      className={cn(
        'flex items-start gap-4 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50',
        result.isAuthenticated && 'doc-private',
      )}
    >
      <div className="mt-0.5 flex-shrink-0">
        {isColoredDoc ? (
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold"
            style={{ background: DOC_COLORS[result.docType!] }}
          >
            {result.docType}
          </span>
        ) : (
          <div className={cn(
            'rounded-md p-2',
            result.type === 'Product' ? 'bg-blue-100' : 'bg-slate-100',
          )}>
            <Icon className={cn(
              'h-4 w-4',
              result.type === 'Product' ? 'text-blue-700' : 'text-slate-500',
            )} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-900 truncate">{result.title}</p>
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0', badgeColor)}>
            {badgeLabel}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500 line-clamp-2">{result.excerpt}</p>
      </div>
    </a>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchPanel({ isOpen, onClose }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter demo results by query (case-insensitive substring match)
  const results = query.trim()
    ? DEMO_RESULTS.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.excerpt.toLowerCase().includes(query.toLowerCase()),
      )
    : DEMO_RESULTS;

  return (
    <div className="border-b border-slate-200 bg-slate-50 shadow-sm">
      <div className="mx-auto max-w-5xl px-6 py-5">
        {/* Search input */}
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try "E. coli", "0335P", or "COA"'
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="mt-4 flex flex-col gap-2">
          {results.length > 0 ? (
            <>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                {query ? `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"` : 'Featured products and documents'}
              </p>
              {results.map((r) => (
                <ResultCard key={r.id} result={r} />
              ))}
            </>
          ) : (
            <p className="py-6 text-center text-sm text-slate-400">
              No results found for &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Search icon toggle button (used in navbar) ────────────────────────────────

export function SearchToggleButton({
  isOpen,
  onClick,
  className,
}: {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? 'Close search' : 'Open search'}
      aria-expanded={isOpen}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        isOpen && 'bg-muted text-foreground',
        className,
      )}
    >
      {isOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
    </button>
  );
}
