/**
 * setup-nt-audience-rules.ts
 *
 * Adds NT audience rules via the Contentful rule builder UI for the 3 sandbox demo audiences.
 * Runs headed so you can watch and intervene if needed.
 *
 * Run:
 *   node --env-file=.env.local --import=tsx/esm playwright/setup-nt-audience-rules.ts
 *   OR (simpler):
 *   CONTENTFUL_LOGIN_EMAIL=you@example.com CONTENTFUL_LOGIN_PASSWORD=xxx bunx tsx playwright/setup-nt-audience-rules.ts
 *
 * Requires in .env.local (never hardcode):
 *   CONTENTFUL_LOGIN_EMAIL
 *   CONTENTFUL_LOGIN_PASSWORD
 *
 * Why Playwright and not MCP: MCP reliably fails writing to the NT rule builder iframe.
 * This script uses the actual Contentful UI to set rules via the NT app's embedded rule builder.
 */

import { chromium, type Page, type Frame } from '@playwright/test';

const SPACE = 'uumzxfocy3ef';
const ENV   = 'master';
const BASE  = 'https://app.contentful.com';

const AUDIENCES = [
  {
    name:    'New Visitor',
    entryId: '1nLRlw8OxGgvQx5cjMsr1J',
    trait:   'customer_type',
    op:      'equal',
    value:   'new-visitor',
  },
  {
    name:    'Return Visitor — Low Engagement',
    entryId: '4lGcc6sP37mBPDUA7fmxwx',
    trait:   'customer_type',
    op:      'equal',
    value:   'returning',
  },
  {
    name:    'High Intent',
    entryId: '44TqmMBSfzojdSbujjqaX4',
    trait:   'customer_type',
    op:      'equal',
    value:   'premium',
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

async function screenshot(page: Page, label: string) {
  const file = `/tmp/nt-setup-${label.replace(/\s+/g, '-')}.png`;
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  📸 ${file}`);
}

/** Wait for the NT rule builder iframe and return it. */
async function getNtFrame(page: Page): Promise<Frame> {
  console.log('  ↳ waiting for NT rule builder iframe…');
  // The NT app iframe URL contains "ninetailed" or the Contentful app subdomain.
  // We wait until at least one iframe matching the pattern is attached.
  await page.waitForFunction(() => {
    const frames = Array.from(document.querySelectorAll('iframe'));
    return frames.some(
      (f) =>
        f.src.includes('ninetailed') ||
        f.src.includes('ctfassets') ||
        // Contentful apps are also loaded at app.contentful.com with a /apps/ path
        f.src.includes('/apps/'),
    );
  }, { timeout: 20_000 });

  // Find the frame that has the "Add AND Rule" button
  for (let attempt = 0; attempt < 30; attempt++) {
    for (const frame of page.frames()) {
      try {
        const btn = frame.getByRole('button', { name: /Add AND Rule/i });
        if (await btn.isVisible({ timeout: 500 })) {
          console.log(`  ↳ found rule builder in frame: ${frame.url()}`);
          return frame;
        }
      } catch {
        // keep looking
      }
    }
    await page.waitForTimeout(500);
  }

  // Last resort: take a screenshot so we can see what's on screen
  await screenshot(page, 'no-nt-frame-found');
  throw new Error('Could not find NT rule builder iframe. See screenshot above.');
}

/** Add a single AND rule to the rule builder. */
async function addAndRule(
  frame: Frame,
  trait: string,
  op: string,
  value: string,
) {
  console.log(`  ↳ clicking "Add AND Rule"…`);
  await frame.getByRole('button', { name: /Add AND Rule/i }).click();
  await frame.waitForTimeout(800);

  // The new rule row should appear. NT's rule builder typically renders:
  //   [trait combobox / input] [operator select] [value input]
  // Try combobox first (newer NT versions), fall back to plain input.
  const rows = frame.locator('[data-testid="rule-row"], .rule-row, [class*="rule"]');
  const lastRow = rows.last();

  // --- Trait ---
  const traitCombo = lastRow.getByRole('combobox').first();
  const traitInput = lastRow.getByRole('textbox').first();

  if (await traitCombo.isVisible({ timeout: 2_000 }).catch(() => false)) {
    console.log(`  ↳ setting trait (combobox): ${trait}`);
    await traitCombo.click();
    await frame.waitForTimeout(300);
    // Type to filter the dropdown
    await traitCombo.fill(trait);
    await frame.waitForTimeout(400);
    // Accept first option or press Enter
    const option = frame.getByRole('option', { name: trait }).first();
    if (await option.isVisible({ timeout: 1_500 }).catch(() => false)) {
      await option.click();
    } else {
      await traitCombo.press('Enter');
    }
  } else if (await traitInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
    console.log(`  ↳ setting trait (textbox): ${trait}`);
    await traitInput.fill(trait);
    await traitInput.press('Tab');
  } else {
    throw new Error('Could not find trait input in rule row');
  }

  await frame.waitForTimeout(400);

  // --- Operator ---
  // Operator is usually a <select> or a combobox in the second slot
  const opSelect = lastRow.getByRole('combobox').nth(1);
  const opSelectFallback = lastRow.locator('select').first();

  if (await opSelect.isVisible({ timeout: 2_000 }).catch(() => false)) {
    console.log(`  ↳ setting operator: ${op}`);
    await opSelect.selectOption(op);
  } else if (await opSelectFallback.isVisible({ timeout: 1_000 }).catch(() => false)) {
    await opSelectFallback.selectOption(op);
  }
  // If only 1 operator option exists ("equal"), it may be pre-selected — skip silently.

  await frame.waitForTimeout(400);

  // --- Value ---
  const valueInput = lastRow.getByRole('textbox').last();
  if (await valueInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
    console.log(`  ↳ setting value: ${value}`);
    await valueInput.fill(value);
    await valueInput.press('Tab');
  } else {
    throw new Error('Could not find value input in rule row');
  }

  await frame.waitForTimeout(600);
}

// ─── Login ──────────────────────────────────────────────────────────────────

async function login(page: Page) {
  const email    = process.env.CONTENTFUL_LOGIN_EMAIL;
  const password = process.env.CONTENTFUL_LOGIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      'CONTENTFUL_LOGIN_EMAIL and CONTENTFUL_LOGIN_PASSWORD must be set in .env.local',
    );
  }

  console.log('→ Logging into Contentful…');
  await page.goto('https://be.contentful.com/login');
  await page.waitForLoadState('networkidle');

  // Email step
  await page.getByLabel(/email/i).fill(email);
  const pwField = page.getByLabel(/password/i);
  if (await pwField.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await pwField.fill(password);
    await page.getByRole('button', { name: /log in|sign in/i }).click();
  } else {
    await page.getByRole('button', { name: /continue|next/i }).click();
    await page.waitForTimeout(1_000);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /log in|sign in/i }).click();
  }

  // Wait for redirect into the app
  await page.waitForURL(/app\.contentful\.com/, { timeout: 30_000 });
  await page.waitForLoadState('networkidle');
  console.log('  ✓ logged in');
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 80 });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page    = await context.newPage();

  try {
    await login(page);

    for (const audience of AUDIENCES) {
      console.log(`\n→ [${audience.name}] entry: ${audience.entryId}`);
      const url = `${BASE}/spaces/${SPACE}/environments/${ENV}/entries/${audience.entryId}`;
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2_000); // let Contentful app iframes mount

      await screenshot(page, `${audience.name}-before`);

      const frame = await getNtFrame(page);

      // Check if rules are already set — skip if "AND Rule" buttons exist alongside
      // existing rule rows (rule rows would be present)
      const existingRows = await frame
        .locator('[data-testid="rule-row"], .rule-row')
        .count()
        .catch(() => 0);
      if (existingRows > 0) {
        console.log(`  ⚠ rule rows already present (${existingRows}) — skipping add step`);
      } else {
        await addAndRule(frame, audience.trait, audience.op, audience.value);
        await screenshot(page, `${audience.name}-rule-added`);
      }

      // Publish the entry
      console.log('  ↳ publishing…');
      // Contentful's publish button is in the sidebar / status bar
      const publishBtn = page
        .getByRole('button', { name: /publish/i })
        .filter({ hasNotText: /unpublish/i });
      if (await publishBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await publishBtn.click();
        await page.waitForTimeout(1_500);
        await screenshot(page, `${audience.name}-published`);
        console.log(`  ✓ published`);
      } else {
        console.log('  ⚠ publish button not visible — entry may already be up-to-date or requires manual publish');
      }
    }

    console.log('\n✅ All audience rules set. Close the browser when done.');
    // Leave browser open so you can inspect the result
    await page.waitForTimeout(10_000);
  } catch (err) {
    console.error('\n❌ Script failed:', err);
    await screenshot(page, 'error-state');
  } finally {
    await browser.close();
  }
}

main();
