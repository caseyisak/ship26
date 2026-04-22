/**
 * Phase 4 — Regression Guardian: Smoke Test Suite
 *
 * Checks performed after every cherry-pick branch merges to main:
 *   1. All known routes return HTTP 200
 *   2. No GraphQL 400 errors in network responses
 *   3. Hero and Banner components render (section elements present)
 *   4. No React hydration errors in browser console
 *
 * Run:
 *   bun run dev &
 *   bunx playwright test playwright/smoke.spec.ts
 *
 * Or against a built server:
 *   bun run build && bun run start &
 *   bunx playwright test playwright/smoke.spec.ts
 *
 * Override base URL:
 *   PLAYWRIGHT_BASE_URL=https://staging.example.com bunx playwright test playwright/smoke.spec.ts
 */

import { test, expect, type Page, type Response } from '@playwright/test';

// ─── Route inventory (from `bun run build` output 2026-04-03) ───────────────

/** Static routes — prerendered, no Contentful fetch at request time */
const STATIC_ROUTES = [
  '/',
  '/about',
  '/careers',
  '/contact',
  '/cookie-policy',
  '/features',
  '/integrations',
  '/login',
  '/pricing',
  '/privacy',
  '/signup',
  '/terms',
];

/** CMS-driven page slugs — rendered from Contentful `page` content type */
const CMS_PAGE_SLUGS = [
  'home', // /page/home — known static param from build
];

/** Dynamic routes that require a running Contentful connection */
const DYNAMIC_ROUTES = [
  '/blog',
];

/**
 * Preview routes — only smoke-checked if PREVIEW_ENTRY_IDS env var is set.
 * Format: PREVIEW_ENTRY_IDS=hero:abc123,banner:def456
 *
 * Example entry IDs (update per environment):
 *   hero:   set via HERO_ENTRY_ID env var
 *   banner: set via BANNER_ENTRY_ID env var
 */
const HERO_ENTRY_ID = process.env.HERO_ENTRY_ID ?? '';
const BANNER_ENTRY_ID = process.env.BANNER_ENTRY_ID ?? '';

// ─── Helpers ────────────────────────────────────────────────────────────────

type ConsoleCollector = { errors: string[]; warnings: string[] };

function attachConsoleCollector(page: Page): ConsoleCollector {
  const collector: ConsoleCollector = { errors: [], warnings: [] };
  page.on('console', (msg) => {
    if (msg.type() === 'error') collector.errors.push(msg.text());
    if (msg.type() === 'warning') collector.warnings.push(msg.text());
  });
  return collector;
}

const HYDRATION_PATTERNS = [
  /hydration failed/i,
  /hydrating/i,
  /there was an error while hydrating/i,
  /did not match.*server/i,
  /text content does not match/i,
];

const GRAPHQL_ERROR_PATTERNS = [
  /graphql.*error/i,
  /query.*failed/i,
  /unexpected token.*json/i,
];

function findHydrationErrors(messages: string[]): string[] {
  return messages.filter((m) => HYDRATION_PATTERNS.some((p) => p.test(m)));
}

function findGraphQLConsoleErrors(messages: string[]): string[] {
  return messages.filter((m) => GRAPHQL_ERROR_PATTERNS.some((p) => p.test(m)));
}

// ─── 1. HTTP 200 checks (API-level, fast) ───────────────────────────────────

test.describe('HTTP 200 — Static routes', () => {
  for (const route of STATIC_ROUTES) {
    test(`GET ${route}`, async ({ request }) => {
      const res = await request.get(route);
      expect(res.status(), `${route} returned ${res.status()}`).toBe(200);
    });
  }
});

test.describe('HTTP 200 — CMS page slugs', () => {
  for (const slug of CMS_PAGE_SLUGS) {
    test(`GET /page/${slug}`, async ({ request }) => {
      const res = await request.get(`/page/${slug}`);
      expect(res.status(), `/page/${slug} returned ${res.status()}`).toBe(200);
    });
  }
});

test.describe('HTTP 200 — Dynamic routes', () => {
  for (const route of DYNAMIC_ROUTES) {
    test(`GET ${route}`, async ({ request }) => {
      const res = await request.get(route);
      expect(res.status(), `${route} returned ${res.status()}`).toBe(200);
    });
  }
});

// ─── 2. GraphQL 400 errors (network listener) ───────────────────────────────

test.describe('No GraphQL 400 errors', () => {
  const pagesToCheck = [
    '/',
    '/blog',
    ...CMS_PAGE_SLUGS.map((s) => `/page/${s}`),
  ];

  for (const route of pagesToCheck) {
    test(`${route} — no 400 GraphQL response`, async ({ page }) => {
      const graphqlErrors: { url: string; status: number }[] = [];

      page.on('response', (res: Response) => {
        const url = res.url();
        if (url.includes('graphql') || url.includes('cdn.contentful.com')) {
          if (res.status() === 400 || res.status() === 429) {
            graphqlErrors.push({ url, status: res.status() });
          }
        }
      });

      await page.goto(route);
      await page.waitForLoadState('networkidle');

      expect(
        graphqlErrors,
        `GraphQL error responses on ${route}: ${JSON.stringify(graphqlErrors)}`,
      ).toHaveLength(0);
    });
  }
});

// ─── 3. Component render checks ─────────────────────────────────────────────

test.describe('Component render — /page/home', () => {
  test('Hero section renders with visible content', async ({ page }) => {
    await page.goto('/page/home');
    await page.waitForLoadState('networkidle');

    // Hero renders as <section> — check at least one section exists with non-empty text
    const sections = page.locator('section');
    const count = await sections.count();
    expect(count, 'Expected at least one <section> on /page/home').toBeGreaterThan(0);

    // Hero should contain a heading-level element or a CTA button
    const heroHasContent = await page
      .locator('section')
      .first()
      .locator('h1, h2, h3, button, a[href]')
      .first()
      .isVisible()
      .catch(() => false);

    expect(heroHasContent, 'Hero section has no visible heading or CTA').toBe(true);
  });

  test('Page renders at least 2 content sections', async ({ page }) => {
    await page.goto('/page/home');
    await page.waitForLoadState('networkidle');

    const sections = await page.locator('section').count();
    expect(sections, `Expected ≥2 sections, got ${sections}`).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Component render — Banner preview route', () => {
  test.skip(!BANNER_ENTRY_ID, 'Set BANNER_ENTRY_ID env var to enable banner preview checks');

  test('Banner preview renders section with content', async ({ page }) => {
    await page.goto(`/preview/banner/${BANNER_ENTRY_ID}`);
    await page.waitForLoadState('networkidle');

    const section = page.locator('section').first();
    await expect(section).toBeVisible();
  });
});

test.describe('Component render — Hero preview route', () => {
  test.skip(!HERO_ENTRY_ID, 'Set HERO_ENTRY_ID env var to enable hero preview checks');

  test('Hero preview renders section with content', async ({ page }) => {
    await page.goto(`/preview/hero/${HERO_ENTRY_ID}`);
    await page.waitForLoadState('networkidle');

    const section = page.locator('section').first();
    await expect(section).toBeVisible();
  });
});

// ─── 4. React hydration errors ───────────────────────────────────────────────

test.describe('No React hydration errors', () => {
  const hydratedRoutes = [
    '/',
    '/blog',
    ...CMS_PAGE_SLUGS.map((s) => `/page/${s}`),
  ];

  for (const route of hydratedRoutes) {
    test(`${route} — no hydration mismatch in console`, async ({ page }) => {
      const collector = attachConsoleCollector(page);

      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const hydrationErrors = findHydrationErrors(collector.errors);
      expect(
        hydrationErrors,
        `Hydration errors on ${route}:\n${hydrationErrors.join('\n')}`,
      ).toHaveLength(0);
    });
  }
});

test.describe('No GraphQL errors in console', () => {
  test('/page/home — no GraphQL error messages in console', async ({ page }) => {
    const collector = attachConsoleCollector(page);

    await page.goto('/page/home');
    await page.waitForLoadState('networkidle');

    const gqlErrors = findGraphQLConsoleErrors(collector.errors);
    expect(
      gqlErrors,
      `GraphQL console errors on /page/home:\n${gqlErrors.join('\n')}`,
    ).toHaveLength(0);
  });
});

// ─── 5. Ninetailed SDK connection (optional) ─────────────────────────────────

test.describe('Ninetailed SDK', () => {
  test.skip(
    !process.env.NEXT_PUBLIC_NINETAILED_API_KEY,
    'NT SDK check skipped — NEXT_PUBLIC_NINETAILED_API_KEY not set',
  );

  test('/page/home — NT SDK connects without console error', async ({ page }) => {
    const collector = attachConsoleCollector(page);

    await page.goto('/page/home');
    await page.waitForLoadState('networkidle');

    // NT SDK errors show up as "Ninetailed: ..." console errors
    const ntErrors = collector.errors.filter((e) => /ninetailed/i.test(e));
    expect(
      ntErrors,
      `NT SDK errors:\n${ntErrors.join('\n')}`,
    ).toHaveLength(0);
  });
});
