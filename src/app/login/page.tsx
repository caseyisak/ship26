import Image from 'next/image';
import { getDashboardSettings } from '@/services/contentful/dashboard-settings';
import { PersonaButtons } from './persona-buttons';
import type { PersonaData } from '@/services/contentful/dashboard-settings';

export const revalidate = 60;

// Fallback personas used if Contentful is unreachable
const FALLBACK_PERSONAS: Array<PersonaData & { key: string }> = [
  { key: 'A', name: 'Persona A', label: 'New Visitor', customerType: 'new-visitor', color: '#6366f1' },
  { key: 'B', name: 'Persona B', label: 'Returning', customerType: 'returning', color: '#10b981' },
  { key: 'C', name: 'Persona C', label: 'Premium', customerType: 'premium', color: '#f59e0b' },
];

export default async function LoginPage() {
  const settings = await getDashboardSettings();

  const personas: Array<PersonaData & { key: string }> = settings
    ? [
        settings.personaA && { ...settings.personaA, key: 'A' },
        settings.personaB && { ...settings.personaB, key: 'B' },
        settings.personaC && { ...settings.personaC, key: 'C' },
      ].filter((p): p is PersonaData & { key: string } => Boolean(p))
    : FALLBACK_PERSONAS;

  return (
    <section className="bg-background min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/images/layout/logo-single.svg"
            alt="Metafi logo"
            width={48}
            height={48}
            className="h-12 w-12"
            priority
          />
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Sign in to Metafi
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Choose a persona to explore the dashboard
          </p>
        </div>

        {/* Persona buttons */}
        <PersonaButtons personas={personas} />

        {/* Footer note */}
        <p className="text-muted-foreground text-center text-xs mt-8">
          This is a demo environment. No real credentials required.
        </p>
      </div>
    </section>
  );
}
