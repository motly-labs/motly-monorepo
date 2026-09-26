import { expect, test } from '@playwright/test';

/** The Playheads each demo is pinned at, as progress through its duration. */
const progresses = [0.25, 0.5, 0.75];

for (const renderer of ['svg', 'canvas']) {
  for (const progress of progresses) {
    test(`canonical bursts under ${renderer} at ${progress}`, async ({ page }) => {
      await page.goto(`/canonical.html?renderer=${renderer}&progress=${progress}`);
      await expect(page.locator('body[data-ready=true]')).toBeAttached();
      const stages = page.locator('.stage');
      await expect(stages).toHaveCount(5);
      for (const stage of await stages.all()) {
        const name = await stage.getAttribute('id');
        // Soft, so one run reports every demo that moved, not only the first.
        await expect
          .soft(stage.locator(':scope > *'))
          .toHaveScreenshot(`${name}-${renderer}-${progress}.png`);
      }
    });
  }
}
