import { Globe, Link2, Share2 } from 'lucide-react';
import Link from 'next/link';

import type { FormFragment } from '@/block-renderer/types';
import { Form } from '@/cms-components/form';
import { sectionBgClass, sectionMutedTextClass, sectionTextClass } from '@/lib/theme-colors';
import type { FooterColumn } from '@/services/contentful/settings';
import { cn } from '@/lib/utils';

const socials = [
  { Icon: Link2, href: 'https://linkedin.com' },
  { Icon: Share2, href: 'https://twitter.com' },
  { Icon: Globe, href: 'https://facebook.com' },
];

type FooterProps = {
  footerForm?: FormFragment | null;
  colorVariant?: string | null;
  col1?: FooterColumn | null;
  col2?: FooterColumn | null;
  col3?: FooterColumn | null;
};

/**
 * Determines whether the logo should be inverted (white) for contrast.
 * Light and default backgrounds need dark logo; dark/primary/accent/secondary need inverted.
 */
function shouldInvertLogo(colorVariant: string | null | undefined): boolean {
  return colorVariant === 'dark' || colorVariant === 'primary' || colorVariant === 'accent' || colorVariant === 'secondary';
}

/** Resolve a NavLink to an href string. */
function resolveHref(link: { url?: string; page?: { __typename: string; slug: string } }): string {
  if (link.page) {
    return link.page.__typename === 'ProductListing'
      ? `/products/${link.page.slug === 'products' ? '' : link.page.slug}`
      : `/page/${link.page.slug}`;
  }
  return link.url ?? '#';
}

export const Footer = ({ footerForm, colorVariant, col1, col2, col3 }: FooterProps) => {
  const resolvedVariant = colorVariant ?? 'accent';

  const bgClass = sectionBgClass(resolvedVariant);
  const textClass = sectionTextClass(resolvedVariant);
  const mutedClass = sectionMutedTextClass(resolvedVariant);
  const invertLogo = shouldInvertLogo(resolvedVariant);

  // Build columns from CMS data, filtering out empty ones
  const populatedCols = [col1, col2, col3]
    .filter((c): c is FooterColumn => c != null && c.links.length > 0);

  return (
    <footer className={cn(bgClass, textClass, 'px-2.5 lg:px-0')}>
      <div className="container py-12 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-6 md:max-w-[280px]">
            <Link href="/" aria-label="Arko Home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.ctfassets.net/uumzxfocy3ef/1FlCXA1AAb3wwS1rLfTmX5/bdad4da6d6f8a3c11918d9c9321ba319/arko-2.png"
                alt="Arko Home"
                width={160}
                height={53}
                className={invertLogo ? 'invert' : ''}
              />
            </Link>
            {footerForm && (
              <div className={cn(
                textClass,
                '[&_h2]:text-inherit [&_h3]:text-inherit [&_p]:text-inherit [&_label]:text-inherit',
                '[&_input]:border-current/30 [&_input]:text-inherit [&_input::placeholder]:text-inherit/50',
              )}>
                <Form data={footerForm} className="bg-transparent p-0" />
              </div>
            )}
          </div>

          {populatedCols.length > 0 && (
            <div className="flex flex-wrap justify-end gap-20">
              {populatedCols.map((col) => (
                <div key={col.heading ?? 'col'} className="min-w-0">
                  {col.heading && (
                    <h3 className={cn('mb-4 text-sm leading-tight font-bold', mutedClass)}>
                      {col.heading}
                    </h3>
                  )}
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={resolveHref(link)}
                          className="text-sm font-normal opacity-90 transition-colors hover:opacity-100"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* divider */}
        <div className="mt-12 border-t border-current/20" />

        {/* bottom bar */}
        <div className="mt-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className={cn('text-sm font-normal', mutedClass)}>
            &copy; {new Date().getFullYear()} Arko Home. All rights reserved
          </p>

          <div className="flex items-center gap-4">
            {socials.map(({ Icon, href }) => (
              <Link
                key={href}
                href={href}
                aria-label={href}
                className={cn('transition-colors hover:opacity-100', mutedClass)}
              >
                <Icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
