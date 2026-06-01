'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getAudienceName } from './audience-map';
import { useProfile } from '@ninetailed/experience.js-react';
import { cn } from '@/lib/utils';

// Allowlist of traits shown in the Profile Previewer.
// Keeps the panel focused on demo-relevant data and hides
// any stale or internal-only traits from the NT profile.
const DEMO_TRAITS = new Set([
  'first_name',
  'last_name',
  'email',
  'phone',
  'company',
  'interested_in',
  'customer_type',
  'loyalty_tier',
  'last_order',
  'favorite_item',
  'points',
  'location',
  'isNewsletterSubscribed',
  'clicked_hero_cta',
]);

const TRAIT_LABELS: Record<string, string> = {
  first_name: 'First Name',
  last_name: 'Last Name',
  email: 'Email',
  phone: 'Phone',
  company: 'Company',
  interested_in: 'Interested In',
  customer_type: 'Customer Type',
  loyalty_tier: 'Loyalty Tier',
  last_order: 'Last Order',
  favorite_item: 'Favorite Item',
  points: 'Points',
  location: 'Location',
  isNewsletterSubscribed: 'Newsletter',
  clicked_hero_cta: 'Clicked Hero CTA',
};

const LS_KEY = 'profile-previewer-open';

/** Mount inside the NinetailedProvider / layout. Exposes toggle via window.__profilePreviewer.toggle(). */
export function ProfilePreviewerHost() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(LS_KEY) === 'true') setIsOpen(true);
    } catch {
      /* ignore */
    }

    const toggle = () =>
      setIsOpen((v) => {
        const next = !v;
        try {
          localStorage.setItem(LS_KEY, String(next));
        } catch {
          /* ignore */
        }
        return next;
      });

    (window as { __profilePreviewer?: { toggle: () => void } }).__profilePreviewer =
      { toggle };
    return () => {
      delete (window as { __profilePreviewer?: unknown }).__profilePreviewer;
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    try {
      localStorage.setItem(LS_KEY, 'false');
    } catch {
      /* ignore */
    }
  };

  return <ProfilePreviewer isOpen={isOpen} onClose={handleClose} />;
}

function ProfilePreviewer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  // useProfile() is reactive — re-renders on every identify() and reset()
  const { profile } = useProfile();

  // Visitor ID — truncate to first 8 + last 4 chars
  const rawId = profile?.id ?? '';
  const visitorId =
    rawId.length > 12
      ? `${rawId.slice(0, 8)}...${rawId.slice(-4)}`
      : rawId || '—';

  // Location from NT geolocation
  const loc = profile?.location;
  const location =
    loc
      ? [loc.city, loc.region].filter(Boolean).join(', ') || '—'
      : '—';

  // Audiences — NT profile.audiences is an array of IDs
  const audienceIds: string[] = profile?.audiences ?? [];
  const audienceNames = audienceIds.map((id) => ({
    id,
    name: getAudienceName(id),
  }));

  // Session data
  const session = profile?.session;
  const visitCount = session?.count ?? 1;
  const isReturning = session?.isReturningVisitor ?? false;

  // Traits — read from NT profile.traits so behavioral traits (interested_in, etc.)
  // appear immediately after identify() without requiring a reload.
  const profileTraits = (profile?.traits ?? {}) as Record<string, unknown>;
  const traits = Object.entries(profileTraits)
    .filter(([k, v]) => DEMO_TRAITS.has(k) && v != null && v !== '')
    .map(([k, v]) => ({
      key: k,
      label:
        TRAIT_LABELS[k] ??
        k
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()),
      value: String(v),
    }));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="profile-previewer"
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className={cn(
            'fixed top-0 left-0 z-[9990] h-full w-96 shadow-xl bg-white flex flex-col',
            'border-r-2 border-[#8C2EEA]',
          )}
          role="dialog"
          aria-label="Profile previewer"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#8C2EEA]">
            <span className="text-sm font-semibold text-white">
              Profile Previewer
            </span>
            <button
              onClick={onClose}
              aria-label="Close panel"
              className="text-white/80 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 bg-white">
            {/* Visitor */}
            <div>
              <div className="mb-2">
                <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Visitor
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex gap-3">
                  <span className="text-muted-foreground w-20 shrink-0">ID</span>
                  <span className="font-mono text-xs">{visitorId}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-muted-foreground w-20 shrink-0">Location</span>
                  <span>{location}</span>
                </div>
              </div>
            </div>

            {/* Audiences — new items flash purple on entry via framer-motion initial */}
            <div>
              <div className="border-t border-border pt-4 mb-2">
                <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Audiences
                </span>
              </div>
              <ul className="space-y-1.5">
                <AnimatePresence initial={false}>
                  {audienceNames.length === 0 ? (
                    <motion.li
                      key="none"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs text-muted-foreground"
                    >
                      None — anonymous visitor
                    </motion.li>
                  ) : (
                    audienceNames.map(({ id, name }) => (
                      <motion.li
                        key={id}
                        initial={{
                          opacity: 0,
                          y: 6,
                          backgroundColor: 'rgba(140, 46, 234, 0.2)',
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          backgroundColor: 'rgba(140, 46, 234, 0)',
                        }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{
                          opacity: { duration: 0.25 },
                          y: { duration: 0.25 },
                          backgroundColor: { duration: 1.5, delay: 0.1 },
                        }}
                        className="flex items-center gap-2 text-sm rounded px-1 py-0.5"
                      >
                        <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
                        <span>{name}</span>
                      </motion.li>
                    ))
                  )}
                </AnimatePresence>
              </ul>
            </div>

            {/* Traits — reads from NT profile.traits (reactive to identify() calls) */}
            <AnimatePresence initial={false}>
              {traits.length > 0 && (
                <motion.div
                  key="traits-section"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="border-t border-border pt-4 mb-2">
                    <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                      Traits
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <AnimatePresence initial={false}>
                      {traits.map(({ key: traitKey, label, value }) => (
                        <motion.div
                          key={traitKey}
                          initial={{
                            opacity: 0,
                            y: 6,
                            backgroundColor: 'rgba(140, 46, 234, 0.2)',
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            backgroundColor: 'rgba(140, 46, 234, 0)',
                          }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{
                            opacity: { duration: 0.25 },
                            y: { duration: 0.25 },
                            backgroundColor: { duration: 1.5, delay: 0.1 },
                          }}
                          className="flex gap-3 text-sm rounded px-1 py-0.5"
                        >
                          <span className="text-muted-foreground w-28 shrink-0">
                            {label}
                          </span>
                          <span>{value}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Session */}
            <div>
              <div className="border-t border-border pt-4 mb-2">
                <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Session
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Visit #{visitCount} &bull;{' '}
                {isReturning ? 'Returning' : 'New visitor'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
