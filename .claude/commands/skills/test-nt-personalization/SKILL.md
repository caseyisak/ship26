---
name: test-nt-personalization
description: Test Ninetailed personalization flows visually using Playwright. Reads NT audience and nav config from the active Contentful environment, builds the correct click-path test, runs it headfully, and visually confirms hero/banner variants change with NT state validation. Invoke when user says "test personalization", "verify NT", "check if personalization works", "test the demo flow", or "does the variant swap work".
version: 1.0.0
author: casey-lisak
---

# Test NT Personalization Skill

Verifies that NT personalization variant swaps work end-to-end using the actual demo navigation flow. Reads config from Contentful — does not assume anything hardcoded.

**Do not skip any phase. Do not run with headless: true. Visual confirmation is mandatory.**

---

## Phase 0 — Pre-flight check

Before doing anything else:

1. Confirm the dev server is running: `lsof -ti :3000` — if no PID, tell the user to start it with `bun dev` (or `bun rf` to clear cache first).
2. Confirm Playwright is available: `cd ~/Dev/scraper/gpt-crawler && node -e "require('playwright')" 2>&1` — if missing, `cd ~/Dev/scraper/gpt-crawler && bun add playwright`.
3. Read `.env.local` from the active worktree to get `CONTENTFUL_ENVIRONMENT` and `CONTENTFUL_SPACE_ID`.

---

## Phase 1 — Read NT config from Contentful

Use Contentful MCP with the space + env from Phase 0 to fetch:

**1a. Nav links** — find the `nav` content type entry, read its `links` collection. For each link, note: `label`, `url`, `page.slug`. The effective href is `link.url || (link.page ? /page/${slug} : #)`.

**1b. NT audiences** — search for entries with `content_type: nt_audience`. For each, extract:
- `sys.id` (= audience ID used in `activateAudience`)
- `nt_audience_id` (should equal `sys.id`)
- `nt_name`
- `nt_rules.any[].all` — find the `type: 'identify'` condition(s). Extract `key` and `value` (e.g. `interest: 'fiber'`).
- The nav URL that triggers this audience (look for the `type: 'page'` condition `value` in `nt_rules`, match to a nav link href).

**1c. Build the scenario map** — for each audience that has BOTH an identify rule AND a page URL condition:

```
scenario: {
  label: "Fiber Internet",
  navHref: "/fiber-internet",       // URL from page rule
  identifyTrait: { interest: 'fiber' },  // from identify rule
  audienceId: "56oWuinrUlYervWj6b5GlO", // sys.id
  audienceName: "Fiber Interest"
}
```

Only include audiences with identify rules (type: 'identify'). Skip logged-in or page-only audiences.

Present the scenario map to the user and confirm before running the test.

---

## Phase 2 — Generate and run the Playwright test

Generate a test script at `~/Dev/scraper/gpt-crawler/nt-personalization-test.mjs` using this template, substituting the real scenario data from Phase 1:

```js
import { chromium } from 'playwright';

const HOME = 'http://localhost:3000/page/home'; // adjust if demo uses different home route
const getHero = (page) => page.locator('h1, h2').first().innerText().catch(() => 'none');
const getNTState = (page) => page.evaluate(() => {
  const p = window.ninetailed?.plugins?.preview;
  return p ? {
    activeAudiences: p.activeAudiences,
    experienceIndexes: p.experienceVariantIndexes
  } : null;
});

const scenarios = [
  // GENERATED FROM CONTENTFUL — one entry per audience scenario
  {
    label: 'Fiber Interest',
    navHref: '/fiber-internet',
    homeNavHref: '/page/home',
    audienceId: '56oWuinrUlYervWj6b5GlO',
  },
  // ... additional scenarios
];

const browser = await chromium.launch({ channel: 'chrome', headless: false });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
page.setDefaultTimeout(25000);

const results = [];

try {
  // BASELINE — clean slate
  await page.goto(HOME, { waitUntil: 'networkidle', timeout: 30000 });
  await page.evaluate(() => window.ninetailed?.reset());
  await page.waitForTimeout(500);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const baselineHero = await getHero(page);
  const baselineState = await getNTState(page);
  console.log('BASELINE hero:', baselineHero);
  await page.screenshot({ path: '/tmp/nt-test-00-baseline.png' });

  // Run each scenario sequentially — NO reset between scenarios
  // Each identify() call naturally overwrites previous traits
  for (let i = 0; i < scenarios.length; i++) {
    const s = scenarios[i];
    console.log(`\n--- Scenario: ${s.label} ---`);

    // Navigate to trigger page via nav link
    await page.click(`nav a[href="${s.navHref}"]`);
    await page.waitForURL(`**${s.navHref}`, { timeout: 10000 });
    await page.waitForTimeout(2000);

    const onPageState = await getNTState(page);
    const audienceActive = onPageState?.activeAudiences?.includes(s.audienceId);
    console.log(`On ${s.navHref}: audience active = ${audienceActive}`);
    await page.screenshot({ path: `/tmp/nt-test-${String(i+1).padStart(2,'0')}-on-${s.label.toLowerCase().replace(/\s+/g,'-')}.png` });

    // Navigate home via Home nav link (client-side nav — preview plugin state persists)
    await page.click(`nav a[href="${s.homeNavHref}"]`);
    await page.waitForURL(`**${s.homeNavHref.replace('/page/','').replace('home','')}*`, { timeout: 10000 });
    await page.waitForTimeout(2000);

    const homeHero = await getHero(page);
    const homeState = await getNTState(page);
    const variantActive = homeState?.activeAudiences?.includes(s.audienceId);
    const experienceSwapped = homeState?.experienceIndexes &&
      Object.values(homeState.experienceIndexes).some(v => v > 0);

    console.log(`Homepage hero: ${homeHero}`);
    console.log(`Audience still active: ${variantActive}, experience swapped: ${experienceSwapped}`);
    await page.screenshot({ path: `/tmp/nt-test-${String(i+1).padStart(2,'0')}-home-after-${s.label.toLowerCase().replace(/\s+/g,'-')}.png` });

    results.push({
      scenario: s.label,
      audienceActive,
      variantActive,
      experienceSwapped,
      hero: homeHero,
      pass: variantActive && experienceSwapped,
    });
  }

} catch(e) {
  console.error('Test error:', e.message);
} finally {
  await browser.close();
}

// Summary
console.log('\n====== RESULTS ======');
for (const r of results) {
  const status = r.pass ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}  ${r.scenario}: hero="${r.hero}" | audience=${r.audienceActive} | swapped=${r.experienceSwapped}`);
}
```

Run it: `cd ~/Dev/scraper/gpt-crawler && node nt-personalization-test.mjs 2>&1`

---

## Phase 3 — Evaluate results and report

For each scenario, report:

| Scenario | Audience Active | Experience Swapped | Hero Text | Status |
|----------|----------------|-------------------|-----------|--------|
| Fiber Interest | ✅ | ✅ | "Fiber just arrived..." | ✅ PASS |
| Streaming Interest | ✅ | ✅ | "Stream everything..." | ✅ PASS |

Show the screenshot paths for visual review.

**If a scenario FAILS**, run this diagnostic checklist before declaring a bug:

1. **Is the audience `evaluateRules` returning false?** — Check `local-audience-evaluator.tsx`. The condition `if (cond.type !== 'identify') return false` must be `false` not `true`.
2. **Is the nav link href correct?** — The trigger page nav link must use `link.url` not the page slug route.
3. **Does the trigger page have a `PageTracker` component?** — Check `src/app/[trigger-slug]/page.tsx`. It must render `<PageTracker traits={{ [key]: '[value]' }} />`.
4. **Does the homepage hero entry have the experience in `nt_experiences`?** — Fetch the baseline hero entry from Contentful. Confirm the experience is linked.
5. **Does the experience entry have the right `nt_audience` sys.id?** — Confirm `nt_audience.ntAudienceId === audience sys.id`.
6. **Is `NEXT_PUBLIC_NINETAILED_ENVIRONMENT` set correctly in `.env.local`?** — Must match the Contentful environment name.

---

## Phase 4 — Post-test checklist

After all scenarios pass:

- [ ] All hero texts confirmed changed from baseline
- [ ] All audience IDs present in `activeAudiences` on homepage return
- [ ] All `experienceVariantIndexes` show index > 0 for relevant experiences
- [ ] Screenshots captured for each scenario
- [ ] No scenarios used `ninetailed.reset()` between runs (reset breaks preview plugin state)

Report final status. If everything passes, say: "Personalization verified — all [N] scenarios pass."
