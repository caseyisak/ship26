import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { ContentfulAppRedirect } from '@/components/contentful-app-redirect';
import { ConditionalSiteChrome } from '@/components/layout/conditional-site-chrome';
import { LivePreviewProviderWrapper } from '@/components/live-preview-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { PersonalizationProvider } from '@/personalization/provider';
import { SettingsProvider } from '@/personalization/settings-context';
import { getSettings, themeToStyle } from '@/services/contentful/settings';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Metafi - Modern Next.js Template',
    template: '%s | Metafi',
  },
  description:
    'A modern, fully featured Next.js template built with Shadcn/UI, TailwindCSS and TypeScript, perfect for your next web application.',
  keywords: [
    'Next.js',
    'React',
    'JavaScript',
    'TypeScript',
    'TailwindCSS',
    'Template',
    'Shadcn/UI',
    'Web Development',
  ],
  authors: [{ name: 'Metafi Team' }],
  creator: 'Metafi Team',
  publisher: 'Metafi',
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: '48x48' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon.ico' },
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: [{ url: '/favicon/favicon.ico' }],
  },
  openGraph: {
    title: 'Metafi - Modern Next.js Template',
    description:
      'A modern, fully featured Next.js template built with Shadcn/UI, TailwindCSS and TypeScript, perfect for your next web application.',
    siteName: 'Metafi',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Metafi - Modern Next.js Template',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Metafi - Modern Next.js Template',
    description:
      'A modern, fully featured Next.js template built with Shadcn/UI, TailwindCSS and TypeScript, perfect for your next web application.',
    images: ['/og-image.jpg'],
    creator: '@metafi',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();
  const themeStyle = themeToStyle(settings?.theme);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {themeStyle && (
          <style dangerouslySetInnerHTML={{ __html: themeStyle }} />
        )}
      </head>
      <body
        className={`h-screen ${inter.variable} antialiased`}
        data-theme={process.env.NEXT_PUBLIC_BRAND}
      >
        {/* Inline script runs before React: when Contentful iframes root (/) we redirect immediately so the Section Style Editor loads, not the homepage */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(window.self!==window.top&&(window.location.pathname==='/'||window.location.pathname==='')){window.location.replace('/contentful-app');}}catch(e){}})();`,
          }}
        />
        <ContentfulAppRedirect />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsProvider settings={settings}>
            <PersonalizationProvider>
              <LivePreviewProviderWrapper
                space={process.env.CONTENTFUL_SPACE_ID}
                environment={process.env.CONTENTFUL_ENVIRONMENT ?? 'master'}
              >
                <ConditionalSiteChrome>{children}</ConditionalSiteChrome>
              </LivePreviewProviderWrapper>
            </PersonalizationProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
