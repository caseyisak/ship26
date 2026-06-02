'use client';

import React, { useState } from 'react';

import type { ProductDocument } from '@/lib/integration-adapters/types';
import { cn } from '@/lib/utils';

import { PdfPreviewModal } from '@/components/ui/PdfPreviewModal';

// ── Document type color map ───────────────────────────────────────────────────

const DOC_COLORS: Record<string, string> = {
  COA: '#16a34a',   // green
  SDS: '#dc2626',   // red
  IFU: '#2563eb',   // blue
  Technical: '#7c3aed', // purple
  Promotional: '#ea580c', // orange
};

function getDocColor(type: string): string {
  return DOC_COLORS[type] ?? '#6b7280';
}

// ── Component ─────────────────────────────────────────────────────────────────

interface DocumentSectionProps {
  documents: ProductDocument[];
}

export function DocumentSection({ documents }: DocumentSectionProps) {
  const [activeDoc, setActiveDoc] = useState<ProductDocument | null>(null);

  if (!documents.length) return null;

  return (
    <>
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-foreground">Product Documents</h3>
        {documents.map((doc, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveDoc(doc)}
            className={cn(
              'doc-row flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:bg-muted',
              doc.accessLevel === 'authenticated' && 'doc-private',
            )}
          >
            {/* Colored circle icon */}
            <span
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white text-xs font-bold"
              style={{ background: getDocColor(doc.type) }}
            >
              {doc.type.slice(0, 3)}
            </span>

            {/* Label */}
            <span className="flex-1 text-sm font-medium">{doc.name}</span>

            {/* Authenticated badge */}
            {doc.accessLevel === 'authenticated' && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Authenticated
              </span>
            )}

            {/* Arrow */}
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      {activeDoc && (
        <PdfPreviewModal
          document={activeDoc}
          onClose={() => setActiveDoc(null)}
        />
      )}
    </>
  );
}
