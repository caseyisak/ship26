'use client';

import { LayoutDashboard, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProfilePreviewerHost } from '@/components/profile-previewer/profile-previewer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check } from 'lucide-react';
import { sectionBgClass, sectionMutedTextClass, sectionTextClass } from '@/lib/theme-colors';
import { cn } from '@/lib/utils';
import { useNinetailed } from '@ninetailed/experience.js-react';
import { useSettings } from '@/personalization/settings-context';
import { NT_EVENTS } from '@/lib/nt-events';
import { getPersona, setPersona, clearPersona } from '@/lib/persona-session';
import type { Persona } from '@/lib/persona-session';
import { PersonaButtons } from '@/app/login/persona-buttons';
import { SearchPanel, SearchToggleButton } from '@/components/sections/SearchBar';

// Gear icon dropdown — opens NT panel or Profile Previewer
function ToolsDropdown({
  className,
  onProfilePreviewerToggle,
}: {
  className?: string;
  onProfilePreviewerToggle: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className={cn('px-2', className)}
          aria-label="Demo tools"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-none">
        <DropdownMenuItem
          onClick={() => {
            (
              window as unknown as {
                ninetailed?: { plugins?: { preview?: { toggle?: () => void } } };
              }
            ).ninetailed?.plugins?.preview?.toggle?.();
          }}
        >
          Personalization Preview
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onProfilePreviewerToggle}>
          Profile Previewer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Logged-in persona dropdown — shows active persona's displayName + color dot, persona switcher + log out inside
function PersonaDropdown({
  activePersona,
  allPersonas,
  className,
  onPersonaChange,
  afterLogout,
}: {
  activePersona: Persona;
  allPersonas: Persona[];
  className?: string;
  onPersonaChange: (p: Persona) => void;
  afterLogout?: () => void;
}) {
  const ninetailed = useNinetailed();
  const router = useRouter();

  const handleSwitch = (p: Persona) => {
    if (p.customer_type === activePersona.customer_type) return;
    setPersona(p);
    ninetailed.identify('', { ...p, is_logged_in: true, interested_in: p.interested_in ?? '' });
    onPersonaChange(p);
    // No router.refresh() — NT <Experience> swap is client-side
  };

  const handleLogout = async () => {
    await ninetailed.reset();
    clearPersona();
    document.body.classList.remove('authenticated');
    afterLogout?.();
    router.refresh();
  };

  const triggerLabel = activePersona.display_name || activePersona.label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 rounded-none border border-border bg-card px-2.5 py-1.5 text-sm font-medium hover:bg-accent transition-colors',
            className,
          )}
          aria-label="Account menu"
        >
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ background: activePersona.color }}
            aria-hidden="true"
          />
          <span className="text-foreground">{triggerLabel}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-none">
        {allPersonas.map((p) => {
          const isActive = p.customer_type === activePersona.customer_type;
          return (
            <DropdownMenuItem
              key={p.customer_type}
              onClick={() => handleSwitch(p)}
              className="gap-2 cursor-pointer"
            >
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: p.color }}
                aria-hidden="true"
              />
              <span className="flex-1">{p.label}</span>
              {isActive && <Check className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer gap-2">
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Login button — shown when logged out; opens the login dialog
function LoginButton({ className, onClick }: { className?: string; onClick: () => void }) {
  return (
    <Button size="sm" variant="outline" onClick={onClick} className={className}>
      Login
    </Button>
  );
}

const HEADER_HEIGHT = 80;

const Navbar = ({ colorVariant }: { colorVariant?: string | null } = {}) => {
  const pathname = usePathname();
  const settings = useSettings();
  const nav = settings?.nav ?? null;

  const navLogo = nav?.logo ?? null;
  const navLinks = nav?.linksCollection?.items ?? [];

  const displayName =
    (settings?.loggedInMetadata?.displayName as string) || 'Signed In';
  const personas: Array<Persona & { key: string }> = Array.isArray(
    settings?.loggedInMetadata?.personas,
  )
    ? (settings!.loggedInMetadata!.personas as Persona[]).map((p, i) => ({
        ...p,
        key: String.fromCharCode(65 + i),
      }))
    : [
        { key: 'A', name: 'Persona A', label: 'New Visitor', customer_type: 'new-visitor', color: '#6366f1' },
        { key: 'B', name: 'Persona B', label: 'Returning Customer', customer_type: 'returning', color: '#10b981' },
        { key: 'C', name: 'Persona C', label: 'Premium User', customer_type: 'premium', color: '#f59e0b' },
      ];

  const ninetailed = useNinetailed();
  const { track } = ninetailed;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activePersona, setActivePersona] = useState<Persona | null>(null);

  useEffect(() => {
    const p = getPersona();
    setActivePersona(p);
    // Only set UI state from localStorage — do NOT call identify() here.
    // identify() is called explicitly on login/persona-switch actions.
    // Calling reset()+identify() on every page load wipes behavioral traits
    // (e.g. interested_in from PageTracker) and re-identifies with stale
    // persona data even when the user expects a logged-out experience.
    // LocalAudienceEvaluator will evaluate against whatever traits are
    // already in the NT profile from prior identify() calls.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoggedIn = Boolean(activePersona);

  // Listen for external "open-login" events (e.g. from CalloutCard promptToLogIn)
  useEffect(() => {
    const handler = () => setIsLoginOpen(true);
    window.addEventListener('open-login', handler);
    return () => window.removeEventListener('open-login', handler);
  }, []);

  // Listen for external "open-search-panel" events (e.g. from PDP add-to-cart)
  useEffect(() => {
    const handler = () => setIsSearchOpen(true);
    window.addEventListener('open-search-panel', handler);
    return () => window.removeEventListener('open-search-panel', handler);
  }, []);

  // Listen for add-to-cart events globally (navbar is always mounted)
  // Stores the product on window so SearchPanel can pick it up when it opens.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.product) return;
      (window as unknown as Record<string, unknown>).__pendingCartProduct = detail.product;
      setIsSearchOpen(true);
    };
    window.addEventListener('add-to-cart', handler);
    return () => window.removeEventListener('add-to-cart', handler);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', isMenuOpen);
    return () => document.body.classList.remove('overflow-hidden');
  }, [isMenuOpen]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState<number | 'auto'>(0);
  const [minOpenHeight, setMinOpenHeight] = useState<number>(0);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    const viewportRemainder = Math.max(0, window.innerHeight - HEADER_HEIGHT);
    setMinOpenHeight(viewportRemainder);

    const onEnd = () => {
      if (isMenuOpen) setPanelHeight('auto');
      wrapper.removeEventListener('transitionend', onEnd);
    };

    if (isMenuOpen) {
      const target = Math.max(content.scrollHeight, viewportRemainder);
      setPanelHeight(target);
      wrapper.addEventListener('transitionend', onEnd);
    } else {
      const current = wrapper.getBoundingClientRect().height || 0;
      setPanelHeight(current);
      requestAnimationFrame(() => setPanelHeight(0));
    }
  }, [isMenuOpen, pathname]);

  useEffect(() => {
    const onResize = () => {
      if (!isMenuOpen || !contentRef.current) return;
      const viewportRemainder = Math.max(0, window.innerHeight - HEADER_HEIGHT);
      setMinOpenHeight(viewportRemainder);
      if (panelHeight !== 'auto') {
        const target = Math.max(contentRef.current.scrollHeight, viewportRemainder);
        setPanelHeight(target);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isMenuOpen, panelHeight]);

  const handleProfilePreviewerToggle = () => {
    (window as { __profilePreviewer?: { toggle: () => void } }).__profilePreviewer?.toggle?.();
  };

  return (
    <>
      <ProfilePreviewerHost />
      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">
              Sign in to Metafi
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              Choose a persona to explore the dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2 pb-4">
            <PersonaButtons
              personas={personas}
              onSuccess={() => {
                const p = getPersona();
                setIsLoginOpen(false);
                setActivePersona(p);
                document.body.classList.add('authenticated');
                if (p) {
                  setTimeout(async () => {
                    await ninetailed.reset();
                    ninetailed.identify('', { ...p, is_logged_in: true, interested_in: p.interested_in ?? '' });
                  }, 0);
                }
              }}
            />
            <p className="text-muted-foreground text-center text-xs mt-6">
              This is a demo environment. No real credentials required.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <header className={cn(
        'sticky top-0 z-50 h-20 border-b border-border px-2.5 lg:px-0',
        sectionBgClass(colorVariant),
        sectionTextClass(colorVariant),
      )}>
        <div className="container flex h-20 items-center justify-between lg:grid lg:grid-cols-[auto_1fr_auto]">
          <Link href="/" className="flex items-center gap-2">
            {navLogo?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={
                  navLogo.url.startsWith('//')
                    ? `https:${navLogo.url}`
                    : navLogo.url
                }
                alt="Site logo"
                className="h-10 w-auto object-contain"
              />
            ) : (
              <Image
                src="/images/layout/logo.svg"
                alt="Metafi"
                width={129}
                height={32}
                className="invert-0 dark:invert"
                priority
              />
            )}
          </Link>

          <nav className="hidden items-center justify-center gap-8 lg:flex">
            {navLinks.map((link) => {
              const href = link.page
                ? link.page.__typename === 'ProductListing'
                  ? `/products/${link.page.slug === 'products' ? '' : link.page.slug}`
                  : `/page/${link.page.slug}`
                : (link.url ?? '#');
              return (
                <Link
                  key={link.label}
                  href={href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:opacity-100',
                    pathname === href
                      ? sectionTextClass(colorVariant)
                      : cn(sectionMutedTextClass(colorVariant), 'hover:opacity-100'),
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            {isLoggedIn && activePersona ? (
              <PersonaDropdown
                activePersona={activePersona}
                allPersonas={personas}
                className="hidden sm:flex lg:flex"
                onPersonaChange={(p) => setActivePersona(p)}
                afterLogout={() => setActivePersona(null)}
              />
            ) : (
              <LoginButton
                className="hidden sm:flex lg:flex"
                onClick={() => { track(NT_EVENTS.AUTH_MODAL_OPENED, { triggerSource: 'nav' }); setIsLoginOpen(true); }}
              />
            )}
            <SearchToggleButton
              isOpen={isSearchOpen}
              onClick={() => setIsSearchOpen((v) => !v)}
              className="hidden sm:flex lg:flex"
            />
            <ToolsDropdown className="hidden sm:flex lg:flex" onProfilePreviewerToggle={handleProfilePreviewerToggle} />

            <button
              className={cn('relative flex size-8 lg:hidden', sectionMutedTextClass(colorVariant))}
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-expanded={isMenuOpen}
              aria-label="Toggle main menu"
            >
              <span className="sr-only">Toggle main menu</span>
              <div className="absolute top-1/2 left-1/2 block w-[18px] -translate-x-1/2 -translate-y-1/2">
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out',
                    isMenuOpen ? 'rotate-45' : '-translate-y-1.5',
                  )}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out',
                    isMenuOpen ? 'opacity-0' : 'opacity-100',
                  )}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out',
                    isMenuOpen ? '-rotate-45' : 'translate-y-1.5',
                  )}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="lg:hidden">
          <div
            ref={wrapperRef}
            style={{
              height: panelHeight === 'auto' ? 'auto' : panelHeight,
              minHeight: isMenuOpen ? `${minOpenHeight}px` : undefined,
              transition: 'height 320ms cubic-bezier(.22,.61,.36,1)',
            }}
            className={cn(
              'border-border bg-background overflow-hidden border-t',
              'relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen',
            )}
            aria-hidden={!isMenuOpen}
          >
            <div ref={contentRef} className="max-h-[calc(100vh-80px)] overflow-auto">
              <div className="container px-2.5">
                <div className="px-5">
                  <nav
                    className={cn(
                      'mt-6 flex flex-col',
                      'transition-[transform,opacity] duration-300',
                      isMenuOpen
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-2 opacity-0',
                    )}
                  >
                    <div className="flex flex-col gap-6">
                      {navLinks.map((link) => {
                        const href = link.page
                          ? link.page.__typename === 'ProductListing'
                            ? `/products/${link.page.slug === 'products' ? '' : link.page.slug}`
                            : `/page/${link.page.slug}`
                          : (link.url ?? '#');
                        return (
                          <Link
                            key={link.label}
                            href={href}
                            className={cn(
                              'text-lg tracking-[-0.36px]',
                              pathname === href
                                ? 'text-foreground'
                                : 'text-muted-foreground',
                            )}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {link.label}
                          </Link>
                        );
                      })}
                    </div>

                    <div className="mt-4 mb-6 flex flex-col gap-3">
                      {isLoggedIn && activePersona ? (
                        <PersonaDropdown
                          activePersona={activePersona}
                          allPersonas={personas}
                          className="w-full"
                          onPersonaChange={(p) => setActivePersona(p)}
                          afterLogout={() => {
                            setActivePersona(null);
                            setIsMenuOpen(false);
                          }}
                        />
                      ) : (
                        <LoginButton
                          className="w-full"
                          onClick={() => {
                            setIsMenuOpen(false);
                            track(NT_EVENTS.AUTH_MODAL_OPENED, { triggerSource: 'mobile-menu' });
                            setIsLoginOpen(true);
                          }}
                        />
                      )}
                      <ToolsDropdown className="w-full" onProfilePreviewerToggle={handleProfilePreviewerToggle} />
                    </div>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <SearchPanel isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
