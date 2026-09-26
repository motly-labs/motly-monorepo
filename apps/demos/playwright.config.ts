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
      // No pixel may differ at all, by any amount of color. The pinned container renders the
      // pinned Playheads identically, run after run and runner after runner, so any allowance
      // would only hide geometry changes. Playwright's default per-pixel threshold of 0.2 nearly
      // hid them: every radius grown by 2% failed 2 snapshots at 1 pixel each, and 28 at 0.
      maxDiffPixels: 0,
      threshold: 0,
    },
  },
  webServer: {
    command: 'node serve.mjs',
    url: 'http://localhost:4173/canonical.html',
    reuseExistingServer: !process.env.CI,
  },
});
