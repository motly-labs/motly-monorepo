/**
 * The script build's entry: `<script src=".../motly.iife.js">` makes the plugin the page's global
 * `Motly`, and registers it when GSAP's own script tag came first, as GSAP's script-tag plugins do.
 * Only the IIFE is built from it; the package's entry registers nothing (ADR-0018).
 */

import * as descriptorsAndCurves from './descriptors-and-curves.js';
import { Motly } from './plugin.js';

// A page with no imports writes `Motly.rand(40, 80)`. The bundle holds every curve anyway, so the
// plugin carries them here and nowhere else, where a bundler could not drop the unused ones.
const plugin: typeof Motly & typeof descriptorsAndCurves = { ...Motly, ...descriptorsAndCurves };

const host = globalThis as { gsap?: { registerPlugin(plugin: object): void } };
host.gsap?.registerPlugin(plugin);

export default plugin;
