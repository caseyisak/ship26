/**
 * NT event name constants.
 *
 * IMPORTANT: Ninetailed metric configs cannot be edited after creation — only name/description.
 * These strings are the canonical event names. Do NOT change them after NT metrics are created.
 *
 * Usage:
 *   const { track } = useNinetailed();
 *   track(NT_EVENTS.HERO_CTA_CLICKED, { ctaText, segment, entryId });
 *
 * Metrics setup order (per NT docs best practice):
 *   1. Ship track() calls to running dev server
 *   2. Trigger each event once so NT sees the name
 *   3. Create metric in NT: Organization Settings → Optimization → + New Metric
 *   4. Attach metric to the relevant experience(s)
 */
export const NT_EVENTS = {
  HERO_CTA_CLICKED:                'Hero CTA Clicked',
  BANNER_CTA_CLICKED:              'Banner CTA Clicked',
  BANNER_DISMISSED:                'Banner Dismissed',
  PRICING_PAGE_VISITED:            'Pricing Page Visited',
  AUTH_MODAL_OPENED:               'Auth Modal Opened',
  AUTH_COMPLETED:                  'Auth Completed',
  DASHBOARD_ACTIVATED:             'Dashboard Activated',
  SCROLL_DEPTH_REACHED:            'Scroll Depth Reached',
  PERSONALIZED_EXPERIENCE_VIEWED:  'Personalized Experience Viewed',
  NEWSLETTER_FORM_SUBMITTED:       'Newsletter Form Submitted',
  CONTACT_FORM_SUBMITTED:          'Contact Form Submitted',
} as const;

export type NtEventName = (typeof NT_EVENTS)[keyof typeof NT_EVENTS];
