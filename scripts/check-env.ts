#!/usr/bin/env bun
/**
 * Pre-dev environment guard.
 * Checks required Contentful vars, resolves the master alias, and shows
 * exactly which Contentful environment will be hit — so you always know.
 */

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dir, '..');
const ENV_FILE = resolve(ROOT, '.env.local');
const BASE_ENV_FILE = resolve(ROOT, '.env');

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

/** Resolve a Contentful environment alias to its actual env ID via CMA. */
async function resolveAlias(
  spaceId: string,
  envName: string,
  cmaKey: string,
): Promise<{ resolved: string; isAlias: boolean }> {
  try {
    const res = await fetch(
      `https://api.contentful.com/spaces/${spaceId}/environment_aliases/${envName}`,
      { headers: { Authorization: `Bearer ${cmaKey}` } },
    );
    if (res.ok) {
      const data = await res.json();
      const target = data?.environment?.sys?.id;
      if (target) return { resolved: target, isAlias: true };
    }
  } catch {
    // fall through
  }
  return { resolved: envName, isAlias: false };
}

async function checkEnv(): Promise<boolean> {
  // Merge .env + .env.local values (.env.local wins, process.env wins over both)
  const baseVars = parseEnvFile(BASE_ENV_FILE);
  const localVars = parseEnvFile(ENV_FILE);
  const env = { ...baseVars, ...localVars, ...process.env };

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

  const ctflEnv = env['CONTENTFUL_ENVIRONMENT'] ?? '';
  const spaceId = env['CONTENTFUL_SPACE_ID'] ?? '';
  const cmaKey = env['CONTENTFUL_CMA_KEY'] ?? '';

  // --- Non-master environment warning ---
  if (ctflEnv && ctflEnv !== 'master') {
    console.warn(`
\x1b[33m╔══════════════════════════════════════════════════════════╗
║  ⚠  ENV GUARD WARNING                                    ║
║                                                          ║
║  CONTENTFUL_ENVIRONMENT = "${ctflEnv.padEnd(28)}"║
║                                                          ║
║  You are NOT pointing at master.                         ║
║  .env.local should always use CONTENTFUL_ENVIRONMENT=master ║
║  The master alias handles sandbox vs demo switching.     ║
╚══════════════════════════════════════════════════════════╝\x1b[0m
`);
  }

  // --- Resolve alias and show actual target ---
  if (ctflEnv && spaceId && cmaKey) {
    const { resolved, isAlias } = await resolveAlias(spaceId, ctflEnv, cmaKey);
    if (isAlias) {
      const isSandbox = resolved === 'sandbox-master';
      const icon = isSandbox ? '✓' : '⚠';
      const color = isSandbox ? '\x1b[32m' : '\x1b[33m';
      const label = isSandbox ? 'sandbox' : 'DEMO';
      console.log(
        `${color}${icon} Environment: ${ctflEnv} → ${resolved} (${label})\x1b[0m`,
      );
      if (!isSandbox) {
        console.log(
          `\x1b[33m  Demo mode active. Run \x1b[1mbash scripts/alias-swap.sh --reset\x1b[0m\x1b[33m to restore sandbox.\x1b[0m`,
        );
      }
    } else {
      console.log(`\x1b[36m→ Environment: ${ctflEnv} (direct, not an alias)\x1b[0m`);
    }
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

const passed = await checkEnv();
if (!passed) {
  console.error('\x1b[31m[env-guard] Fix missing vars above before running dev.\x1b[0m');
  process.exit(1);
}
