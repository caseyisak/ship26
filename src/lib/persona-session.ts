/**
 * Persona session — demo-grade auth.
 *
 * Stores the active persona in both localStorage (for client reads) and a
 * cookie (so the Next.js server component at /dashboard can read it and
 * redirect to /login if absent).
 *
 * No real JWT or auth backend — this is intentional for the demo story.
 * The cookie is httpOnly=false so it's writable from the browser.
 */

export type Persona = {
  name: string;
  label: string;
  customer_type: string;
  color: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  industry?: string;
  location?: string;
  promo_discount?: number;
  loyalty_tier?: string;
  last_order?: string | null;
  favorite_item?: string;
  points?: number;
  interested_in?: string;
};

export const PERSONA_COOKIE = 'metafi-persona';

export function setPersona(persona: Persona): void {
  try {
    localStorage.setItem(PERSONA_COOKIE, JSON.stringify(persona));
  } catch {
    // Ignore SSR/iframe localStorage errors
  }
  document.cookie = `${PERSONA_COOKIE}=${encodeURIComponent(JSON.stringify(persona))};path=/;max-age=86400`;

  // Also persist the shared session key used by the legacy auth guard
  try {
    localStorage.setItem('metafi_session', '1');
  } catch {
    // ignore
  }

  // Notify hooks (e.g. useDiscountedCatalog) that persona changed
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('persona-changed'));
  }

  // Fire NT identify so the audience rules match
  if (typeof window !== 'undefined') {
    (
      window as unknown as {
        ninetailed?: {
          identify?: (id: string, traits: Record<string, unknown>) => void;
        };
      }
    ).ninetailed?.identify?.('', {
      ...persona,
      is_logged_in: true,
      // Clear behavioral traits from previous browsing/persona so they
      // don't leak across profile switches.
      interested_in: persona.interested_in ?? '',
    });
  }
}

export function getPersona(): Persona | null {
  try {
    const raw = localStorage.getItem(PERSONA_COOKIE);
    return raw ? (JSON.parse(raw) as Persona) : null;
  } catch {
    return null;
  }
}

export function clearPersona(): void {
  try {
    localStorage.removeItem(PERSONA_COOKIE);
    localStorage.removeItem('metafi_session');
  } catch {
    // ignore
  }
  document.cookie = `${PERSONA_COOKIE}=;path=/;max-age=0`;

  // Notify hooks (e.g. useDiscountedCatalog) that persona changed
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('persona-changed'));
  }
}
