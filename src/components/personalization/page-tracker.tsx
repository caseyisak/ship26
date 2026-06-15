'use client';

import { useNinetailed } from '@ninetailed/experience.js-react';
import { useEffect } from 'react';

import { getPersona } from '@/lib/persona-session';

/**
 * Persona trait keys that must be explicitly cleared for anonymous visitors.
 * NT SDK's reset() only regenerates the anonymous ID — it does NOT wipe
 * accumulated traits from the internal profile. Overwriting with empty
 * values ensures stale persona data doesn't leak into the logged-out state.
 */
const ANONYMOUS_OVERWRITE: Record<string, string | number | boolean> = {
  customer_type: 'anonymous',
  is_logged_in: false,
  first_name: '',
  last_name: '',
  display_name: '',
  loyalty_tier: '',
  next_loyalty_tier: '',
  last_order: '',
  favorite_item: '',
  points: 0,
  location: '',
  promo_discount: 0,
  session_ai_product_category: '',
};

export function PageTracker({ traits }: { traits: Record<string, string | number | boolean | null> }) {
  const ninetailed = useNinetailed();
  useEffect(() => {
    // Defer to next event loop tick: React effects fire bottom-up, so a child's
    // useEffect runs before parent subscriptions are ready. Without setTimeout,
    // identify() fires before NinetailedProvider's onProfileChange listeners
    // (including LocalAudienceEvaluator) have subscribed.
    setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const utmCampaign = params.get('utm_campaign');
      const utmTraits: Record<string, string> = {};
      if (utmCampaign) utmTraits.utm_campaign = utmCampaign;

      const isLoggedIn = Boolean(getPersona());
      if (!isLoggedIn) {
        // Anonymous visitor: overwrite stale persona traits with empty values,
        // then layer on the behavioral trait for this page.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ninetailed.identify('', { ...ANONYMOUS_OVERWRITE, ...traits, ...utmTraits } as any);
      } else {
        // Logged in: just add behavioral trait on top of existing persona.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ninetailed.identify('visitor', { ...traits, ...utmTraits } as any);
      }
    }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
