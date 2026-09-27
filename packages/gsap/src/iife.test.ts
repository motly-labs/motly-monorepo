// Builds and runs the script build, so the one file here that needs Node's own modules.
/// <reference types="node" />
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createContext, runInContext } from 'node:vm';
import { build } from 'tsdown';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import configs from '../tsdown.config.js';
import * as descriptorsAndCurves from './descriptors-and-curves.js';

let outDir: string;
let motly: string;
const gsapScript = createRequire(import.meta.url).resolve('gsap/dist/gsap.js');

beforeAll(async () => {
  // The IIFE as the package's own config builds it, into a folder of its own.
  const iife = [configs].flat().find((config) => config.format === 'iife');
  outDir = await mkdtemp(join(tmpdir(), 'motly-iife-'));
  await build({ ...iife, outDir, config: false, logLevel: 'silent' });
  motly = await readFile(join(outDir, 'motly.iife.js'), 'utf8');
}, 30_000);

afterAll(async () => {
  await rm(outDir, { recursive: true, force: true });
});

/** A page with no DOM that runs `scripts` in order, as script tags do. */
async function page(...scripts: string[]): Promise<(code: string) => unknown> {
  const window = createContext({ console, setTimeout, clearTimeout });
  runInContext('this.window = this.self = this;', window);
  for (const script of scripts) runInContext(script, window);
  return (code) => runInContext(code, window);
}

// A burst whose radius uses Motly.rand, as a pen with no imports writes it.
const burstDuration = `gsap.effects.burst({ x: 0, y: 0 }, {
  spec: { kind: 'burst', radius: [0, Motly.rand(40, 80)], children: { kind: 'circle' } },
  paused: true,
}).duration()`;

describe('the script build', () => {
  it('registers itself when loaded after GSAP, so a burst needs no other setup', async () => {
    const run = await page(await readFile(gsapScript, 'utf8'), motly);

    // Every Descriptor and curve the package exports, on the global.
    const names = JSON.stringify(Object.keys(descriptorsAndCurves));
    expect(run(`${names}.filter((name) => !(name in Motly))`)).toEqual([]);
    expect(run(burstDuration)).toBeGreaterThan(0);
  });

  it('only defines Motly when loaded before GSAP, and registers by hand', async () => {
    const run = await page(motly, await readFile(gsapScript, 'utf8'));

    expect(run('Motly.name')).toBe('motly');
    expect(run('typeof gsap.effects.burst')).toBe('undefined');
    run('gsap.registerPlugin(Motly)');
    expect(run(burstDuration)).toBeGreaterThan(0);
  });

  it('bundles core, so the page needs no import map', () => {
    expect(motly).not.toMatch(/@motly\/core/);
    expect(motly).toMatch(/^var Motly=/);
  });
});
