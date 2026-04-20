import Image from 'next/image';
import { getSettings } from '@/services/contentful/settings';
import { PersonaButtons } from './persona-buttons';
import type { Persona } from '@/lib/persona-session';

export const revalidate = 60;

const FALLBACK_PERSONAS: Array<Persona & { key: string }> = [
  { key: 'A', name: 'Persona A', label: 'New Visitor', customerType: 'new-visitor', color: '#6366f1' },
  { key: 'B', name: 'Persona B', label: 'Returning Customer', customerType: 'returning', color: '#10b981' },
  { key: 'C', name: 'Persona C', label: 'Premium User', customerType: 'premium', color: '#f59e0b' },
];

export default async function LoginPage() {
  const settings = await getSettings();
  const rawPersonas = settings?.loggedInMetadata?.personas as Array<Persona> | undefined;

  const personas: Array<Persona & { key: string }> =
    rawPersonas && rawPersonas.length > 0
      ? rawPersonas.map((p, i) => ({ ...p, key: String.fromCharCode(65 + i) }))
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
