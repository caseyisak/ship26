'use client';

import { useState } from 'react';

/** Sticky checkout footer with terms checkbox + place order button. */
export function CheckoutFooter() {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
      <div className="container flex items-center justify-between gap-4 py-4">
        <div className="flex items-baseline gap-2 shrink-0">
          <span className="text-sm text-muted-foreground">Estimated Monthly Rate</span>
          <span className="text-2xl font-bold text-foreground">—</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
          <input
            type="checkbox"
            id="terms"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 accent-secondary shrink-0"
          />
          <label htmlFor="terms" className="leading-snug">
            I have read and agree to the{' '}
            <a href="#" className="text-secondary underline underline-offset-2 hover:text-secondary/80">
              offer terms and conditions
            </a>
          </label>
        </div>

        <button
          disabled={!agreed}
          className="shrink-0 bg-secondary text-secondary-foreground font-bold text-sm px-8 py-3 rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Place Order
        </button>
      </div>
    </div>
  );
}
