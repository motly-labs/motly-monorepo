import { defineConfig, devices } from '@playwright/test';

/**
 * Visual regression for the five canonical bursts (ADR-0003). Baselines are rendered in the
 * Playwright container, pinned by tag, so run it there: `pnpm test:visual:docker`.
 */
export default defineConfig({
  testDir: 'tests',
  // One baseline per snapshot, for the container's platform only.
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'list',
  use: { baseURL: 'http://localhost:4173' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], deviceScaleFactor: 1 } }],
  expect: {
    toHaveScreenshot: {
      // No pixel may differ beyond Playwright's default per-pixel color threshold of 0.2. The
      // pinned container renders the pinned Playheads identically: five consecutive runs showed
      // no differing pixel at all, so any tolerance would only hide small geometry changes.
      maxDiffPixels: 0,
    },
  },
  webServer: {
    command: 'node serve.mjs',
    url: 'http://localhost:4173/canonical.html',
    reuseExistingServer: !process.env.CI,
  },
});
