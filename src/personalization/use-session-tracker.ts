/**
 * use-session-tracker.ts — Debounced session trait capture for NT identify().
 *
 * All trait keys are prefixed with `session_` to avoid collision with
 * audience rules that depend on customer-level traits.
 *
 * Usage:
 *   const { trackSessionEvent } = useSessionTracker();
 *   trackSessionEvent('search', { query: 'lamps' });
 */

'use client';

import { useCallback, useRef } from 'react';

import { useNinetailed } from '@ninetailed/experience.js-react';

type SessionTraits = Record<string, string | number | boolean>;

const DEBOUNCE_MS = 500;

/**
 * Standalone tracker function for use outside React components.
 * Dispatches a custom event that the hook listens for, or can be called
 * from any context where the hook is mounted higher in the tree.
 */
export function trackSessionEvent(
  eventName: string,
  data?: Record<string, unknown>,
) {
  window.dispatchEvent(
    new CustomEvent('session-track', { detail: { eventName, data } }),
  );
}

export function useSessionTracker() {
  const { identify } = useNinetailed();
  const pendingTraits = useRef<SessionTraits>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    const traits = { ...pendingTraits.current };
    if (Object.keys(traits).length === 0) return;
    // Defer identify to avoid React lifecycle conflicts (LL-pattern)
    setTimeout(() => {
      identify('', traits);
    }, 0);
    pendingTraits.current = {};
  }, [identify]);

  const enqueue = useCallback(
    (traits: SessionTraits) => {
      Object.assign(pendingTraits.current, traits);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, DEBOUNCE_MS);
    },
    [flush],
  );

  /** Track a named session event with optional data. */
  const track = useCallback(
    (eventName: string, data?: Record<string, unknown>) => {
      const traits: SessionTraits = {};

      switch (eventName) {
        case 'search':
          traits.session_search_query = String(data?.query ?? '');
          addInteraction('search');
          break;

        case 'ai_chat_active':
          traits.session_ai_chat_active = true;
          addInteraction('AI assistant');
          break;

        case 'ai_suggestion_clicked':
          traits.session_ai_suggestion_clicked = true;
          addInteraction('AI assistant');
          break;

        case 'page_view':
          traits.session_pages_viewed =
            (Number(pendingTraits.current.session_pages_viewed) || 0) + 1;
          break;

        case 'hero_cta_click':
          addInteraction('hero CTA');
          break;

        case 'ai_product_discovery':
          if (data?.category) {
            traits.session_ai_product_category = String(data.category);
          }
          addInteraction('AI product discovery');
          break;

        case 'product_card_click':
          addInteraction('product card');
          if (data?.category) {
            traits.session_product_interest = String(data.category);
          }
          break;

        default:
          break;
      }

      if (Object.keys(traits).length > 0) {
        enqueue(traits);
      }

      function addInteraction(label: string) {
        const current = String(
          pendingTraits.current.session_interacted_with ?? '',
        );
        const items = current
          ? current.split(',').map((s) => s.trim())
          : [];
        if (!items.includes(label)) {
          items.push(label);
        }
        traits.session_interacted_with = items.join(', ');
      }
    },
    [enqueue],
  );

  return { trackSessionEvent: track };
}
