#!/usr/bin/env bun
/**
 * Pre-dev environment guard.
 * Checks that required Contentful vars are present and warns if CONTENTFUL_ENVIRONMENT
 * is not 'master' — prevents GraphQL 400s from accidentally running against the wrong env.
 */

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dir, '..');
const ENV_FILE = resolve(ROOT, '.env.local');

function parseEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) return {};
  const vars: Record<string, string> = {};
  const lines = readFileSync(filePath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    vars[key] = value;
  }
  return vars;
}

function checkEnv(): boolean {
  // Merge .env.local values under process.env (process.env takes precedence)
  const fileVars = parseEnvFile(ENV_FILE);
  const env = { ...fileVars, ...process.env };

  let ok = true;

  // --- Required vars ---
  const required = ['CONTENTFUL_SPACE_ID', 'CONTENTFUL_ENVIRONMENT'];
  const hasDeliveryToken =
    env['CONTENTFUL_ACCESS_TOKEN'] || env['CONTENTFUL_PREVIEW_ACCESS_TOKEN'];

  for (const key of required) {
    if (!env[key]) {
      console.error(`\x1b[31m[env-guard] MISSING required var: ${key}\x1b[0m`);
      ok = false;
    }
  }

  if (!hasDeliveryToken) {
    console.error(
      '\x1b[31m[env-guard] MISSING required var: CONTENTFUL_ACCESS_TOKEN or CONTENTFUL_PREVIEW_ACCESS_TOKEN\x1b[0m',
    );
    ok = false;
  }

  // --- Non-master environment warning ---
  const ctflEnv = env['CONTENTFUL_ENVIRONMENT'];
  if (ctflEnv && ctflEnv !== 'master') {
    console.warn(`
\x1b[33m╔══════════════════════════════════════════════════════════╗
║  ⚠  ENV GUARD WARNING                                    ║
║                                                          ║
║  CONTENTFUL_ENVIRONMENT = "${ctflEnv.padEnd(28)}"║
║                                                          ║
║  You are NOT pointing at master.                         ║
║  GraphQL queries that reference missing content types    ║
║  or entries will return 400 errors.                      ║
║                                                          ║
║  If this is intentional (demo branch), ignore this.     ║
║  If not, update .env.local → CONTENTFUL_ENVIRONMENT=master ║
╚══════════════════════════════════════════════════════════╝\x1b[0m
`);
  }

  // --- NEXT_PUBLIC_BRAND warning (prospect name leak) ---
  const brand = env['NEXT_PUBLIC_BRAND'];
  if (brand && brand !== 'metafi' && brand !== '') {
    console.warn(
      `\x1b[33m[env-guard] WARNING: NEXT_PUBLIC_BRAND="${brand}" — make sure this is intentional (demo branch, not main sandbox)\x1b[0m`,
    );
  }

  return ok;
}

const passed = checkEnv();
if (!passed) {
  console.error('\x1b[31m[env-guard] Fix missing vars above before running dev.\x1b[0m');
  process.exit(1);
}
