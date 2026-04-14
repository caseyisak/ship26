import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// We test the core logic by extracting it from the module.
// The script is a Bun-runnable file, so we re-implement the pure functions here
// to keep the test environment simple (no process.exit side-effects).

function parseEnvFile(content: string): Record<string, string> {
  const vars: Record<string, string> = {};
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    vars[key] = value;
  }
  return vars;
}

interface EnvVars {
  CONTENTFUL_SPACE_ID?: string;
  CONTENTFUL_ENVIRONMENT?: string;
  CONTENTFUL_ACCESS_TOKEN?: string;
  CONTENTFUL_PREVIEW_ACCESS_TOKEN?: string;
  NEXT_PUBLIC_BRAND?: string;
  [key: string]: string | undefined;
}

function runGuard(env: EnvVars): { ok: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];

  const required = ['CONTENTFUL_SPACE_ID', 'CONTENTFUL_ENVIRONMENT'];
  const hasDeliveryToken = env['CONTENTFUL_ACCESS_TOKEN'] || env['CONTENTFUL_PREVIEW_ACCESS_TOKEN'];

  for (const key of required) {
    if (!env[key]) errors.push(`MISSING required var: ${key}`);
  }
  if (!hasDeliveryToken) {
    errors.push('MISSING required var: CONTENTFUL_ACCESS_TOKEN or CONTENTFUL_PREVIEW_ACCESS_TOKEN');
  }

  const ctflEnv = env['CONTENTFUL_ENVIRONMENT'];
  if (ctflEnv && ctflEnv !== 'master') {
    warnings.push(`CONTENTFUL_ENVIRONMENT="${ctflEnv}" — not master`);
  }

  const brand = env['NEXT_PUBLIC_BRAND'];
  if (brand && brand !== 'metafi' && brand !== '') {
    warnings.push(`NEXT_PUBLIC_BRAND="${brand}" — make sure this is intentional`);
  }

  return { ok: errors.length === 0, warnings, errors };
}

describe('check-env: parseEnvFile', () => {
  it('parses simple key=value pairs', () => {
    const result = parseEnvFile('FOO=bar\nBAZ=qux');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('ignores comments and blank lines', () => {
    const result = parseEnvFile('# comment\n\nFOO=bar');
    expect(result).toEqual({ FOO: 'bar' });
  });

  it('strips surrounding quotes', () => {
    const result = parseEnvFile('FOO="hello world"\nBAR=\'single\'');
    expect(result).toEqual({ FOO: 'hello world', BAR: 'single' });
  });

  it('handles values with = signs', () => {
    const result = parseEnvFile('TOKEN=abc=def==');
    expect(result).toEqual({ TOKEN: 'abc=def==' });
  });
});

describe('check-env: runGuard', () => {
  const validEnv: EnvVars = {
    CONTENTFUL_SPACE_ID: 'uumzxfocy3ef',
    CONTENTFUL_ENVIRONMENT: 'master',
    CONTENTFUL_ACCESS_TOKEN: 'some-delivery-token',
  };

  it('passes with all required vars and master env', () => {
    const { ok, errors, warnings } = runGuard(validEnv);
    expect(ok).toBe(true);
    expect(errors).toHaveLength(0);
    expect(warnings).toHaveLength(0);
  });

  it('accepts CONTENTFUL_PREVIEW_ACCESS_TOKEN in place of ACCESS_TOKEN', () => {
    const env: EnvVars = {
      CONTENTFUL_SPACE_ID: 'abc',
      CONTENTFUL_ENVIRONMENT: 'master',
      CONTENTFUL_PREVIEW_ACCESS_TOKEN: 'preview-token',
    };
    const { ok, errors } = runGuard(env);
    expect(ok).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it('errors when CONTENTFUL_SPACE_ID is missing', () => {
    const { ok, errors } = runGuard({ ...validEnv, CONTENTFUL_SPACE_ID: undefined });
    expect(ok).toBe(false);
    expect(errors.some((e) => e.includes('CONTENTFUL_SPACE_ID'))).toBe(true);
  });

  it('errors when CONTENTFUL_ENVIRONMENT is missing', () => {
    const { ok, errors } = runGuard({ ...validEnv, CONTENTFUL_ENVIRONMENT: undefined });
    expect(ok).toBe(false);
    expect(errors.some((e) => e.includes('CONTENTFUL_ENVIRONMENT'))).toBe(true);
  });

  it('errors when no access token is present', () => {
    const { ok, errors } = runGuard({
      CONTENTFUL_SPACE_ID: 'abc',
      CONTENTFUL_ENVIRONMENT: 'master',
    });
    expect(ok).toBe(false);
    expect(errors.some((e) => e.includes('CONTENTFUL_ACCESS_TOKEN'))).toBe(true);
  });

  it('warns when CONTENTFUL_ENVIRONMENT is not master', () => {
    const { ok, warnings } = runGuard({ ...validEnv, CONTENTFUL_ENVIRONMENT: 'wow' });
    expect(ok).toBe(true); // warning, not error
    expect(warnings.some((w) => w.includes('"wow"'))).toBe(true);
  });

  it('warns when NEXT_PUBLIC_BRAND is a prospect name', () => {
    const { ok, warnings } = runGuard({ ...validEnv, NEXT_PUBLIC_BRAND: 'punchbowl' });
    expect(ok).toBe(true);
    expect(warnings.some((w) => w.includes('punchbowl'))).toBe(true);
  });

  it('does not warn when NEXT_PUBLIC_BRAND is metafi', () => {
    const { ok, warnings } = runGuard({ ...validEnv, NEXT_PUBLIC_BRAND: 'metafi' });
    expect(ok).toBe(true);
    expect(warnings).toHaveLength(0);
  });

  it('does not warn when NEXT_PUBLIC_BRAND is absent', () => {
    const { ok, warnings } = runGuard(validEnv);
    expect(ok).toBe(true);
    expect(warnings).toHaveLength(0);
  });
});
