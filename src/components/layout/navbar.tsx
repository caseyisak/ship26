'use client';

import { Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useSettings } from '@/personalization/settings-context';
import { getPersona, clearPersona } from '@/lib/persona-session';
import type { Persona } from '@/lib/persona-session';

// Gear icon — navigates to dashboard (if logged in) or /login (if not)
function PersonalizationToggle({ className, isLoggedIn }: { className?: string; isLoggedIn: boolean }) {
  const router = useRouter();
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => router.push(isLoggedIn ? '/dashboard' : '/login')}
      className={cn('px-2', className)}
      aria-label="Go to dashboard"
      title="Dashboard"
    >
      <Settings className="h-4 w-4" />
    </Button>
  );
}

// Persona status + logout dropdown (shown when logged in on marketing pages)
// No persona switching here — that's dashboard-only.
function PersonaDropdown({
  activePersona,
  className,
  afterAction,
}: {
  activePersona: Persona;
  className?: string;
  afterAction?: () => void;
}) {
  const router = useRouter();

  const handleLogout = () => {
    clearPersona();
    afterAction?.();
    router.push('/page/home');
  };

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
          <span className="text-foreground">{activePersona.label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-none">
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            Dashboard →
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

// Login button — shown when not logged in
function LoginButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => router.push('/login')}
      className={className}
    >
      Login
    </Button>
  );
}

const HEADER_HEIGHT = 80;

const Navbar = () => {
  const pathname = usePathname();
  const settings = useSettings();
  const nav = settings?.nav ?? null;

  // Logo: use nav-level logo only
  const navLogo = nav?.logo ?? null;

  // Nav links from CMS — no hardcoded fallback
  const navLinks = nav?.linksCollection?.items ?? [];

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Persona state — read from localStorage on mount
  const [activePersona, setActivePersona] = useState<Persona | null>(null);

  useEffect(() => {
    setActivePersona(getPersona());
  }, []);

  const isLoggedIn = Boolean(activePersona);

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
        const target = Math.max(
          contentRef.current.scrollHeight,
          viewportRemainder,
        );
        setPanelHeight(target);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isMenuOpen, panelHeight]);

  return (
    <header className="bg-background border-border relative z-50 h-20 border-b px-2.5 lg:px-0">
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
              ? `/page/${link.page.slug}`
              : (link.url ?? '#');
            return (
              <Link
                key={link.label}
                href={href}
                className={cn(
                  'text-muted-foreground hover:text-foreground text-sm font-medium transition-colors',
                  pathname === href && 'text-foreground',
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
              className="hidden sm:flex lg:flex"
              afterAction={() => setActivePersona(getPersona())}
            />
          ) : (
            <LoginButton className="hidden sm:flex lg:flex" />
          )}
          <PersonalizationToggle
            className="hidden sm:flex lg:flex"
            isLoggedIn={isLoggedIn}
          />

          <button
            className="text-muted-foreground relative flex size-8 lg:hidden"
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

      {/* Full-bleed, in-flow mobile menu below the bar */}
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
            // full-bleed: escape container padding and span edge-to-edge
            'relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen',
          )}
          aria-hidden={!isMenuOpen}
        >
          {/* scrollable content area constrained to the remaining viewport */}
          <div
            ref={contentRef}
            className="max-h-[calc(100vh-80px)] overflow-auto"
          >
            {/* keep content aligned with your layout while background is full-bleed */}
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
                        ? `/page/${link.page.slug}`
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
                        className="w-full"
                        afterAction={() => {
                          setActivePersona(getPersona());
                          setIsMenuOpen(false);
                        }}
                      />
                    ) : (
                      <LoginButton className="w-full" />
                    )}
                    <PersonalizationToggle className="w-full" isLoggedIn={isLoggedIn} />
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
