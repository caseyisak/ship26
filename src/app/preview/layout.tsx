import React from 'react';

/**
 * Minimal layout for Contentful live preview routes.
 * Renders only the preview content (no Navbar/Footer) so the iframe shows just the component.
 */
export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-background min-h-screen">{children}</div>;
}
