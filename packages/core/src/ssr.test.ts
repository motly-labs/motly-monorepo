import { describe, expect, it } from 'vitest';
import pkg from '../package.json' with { type: 'json' };

/** Every entry the package exports, by its subpath. */
const entries: Record<string, () => Promise<unknown>> = {
  '.': () => import('./index.js'),
  './utils': () => import('./utils/index.js'),
  './svg': () => import('./svg/index.js'),
  './canvas': () => import('./canvas/index.js'),
  './auto': () => import('./auto/index.js'),
};

describe('importing on a server', () => {
  it('runs where there is no DOM', () => {
    expect(globalThis.document).toBeUndefined();
    expect(globalThis.window).toBeUndefined();
  });

  it('covers every entry the package exports', () => {
    const exported = Object.keys(pkg.exports).filter((path) => path !== './package.json');
    expect(Object.keys(entries).sort()).toEqual(exported.sort());
  });

  it.each(Object.entries(entries))('imports %s without touching the DOM', async (_path, load) => {
    await expect(load()).resolves.toBeDefined();
  });
});
