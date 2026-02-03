'use client';

export default function XRay({
  children,
}: {
  data?: unknown;
  layoutType?: string;
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
