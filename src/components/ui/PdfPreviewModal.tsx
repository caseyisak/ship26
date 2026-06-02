'use client';

import { Download, X } from 'lucide-react';
import { useEffect } from 'react';

import type { ProductDocument } from '@/lib/integration-adapters/types';

interface PdfPreviewModalProps {
  document: ProductDocument;
  onClose: () => void;
}

export function PdfPreviewModal({ document, onClose }: PdfPreviewModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="relative flex h-[85vh] w-[90vw] max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-sm font-semibold text-foreground truncate pr-4">
            {document.name}
          </h2>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={document.assetUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90 transition-opacity"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* PDF viewer */}
        <div className="flex-1 overflow-hidden">
          <object
            data={document.assetUrl}
            type="application/pdf"
            className="h-full w-full"
          >
            <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
              <p className="text-sm">PDF preview unavailable in this browser.</p>
              <a
                href={document.assetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
              >
                <Download className="h-4 w-4" />
                Open PDF
              </a>
            </div>
          </object>
        </div>
      </div>
    </div>
  );
}
