import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // The Renderer subpaths own the DOM: ticket 17's snapshots verify them, not a fake DOM. The
      // testing folder holds test helpers.
      exclude: ['src/**/*.test.ts', 'src/svg/**', 'src/canvas/**', 'src/auto/**', 'src/testing/**'],
      // product.md §1.6: the core engine is covered to 85% or more.
      thresholds: { statements: 85, branches: 85, functions: 85, lines: 85 },
    },
  },
});
