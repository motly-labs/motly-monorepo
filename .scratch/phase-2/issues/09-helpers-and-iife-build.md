# 09: Helpers and the IIFE build

**What to build:** One install is enough to use motly with GSAP. `rand`, `each` and the easing curves are named exports of `@motly/gsap` (re-exported from core) and properties of `Motly`. The package builds ESM, CJS and an IIFE: the IIFE bundles core, makes `Motly` the page's global, and registers itself when a global `gsap` exists, as GSAP's own script-tag plugins do, so a CodePen needs two script tags and no build step. The ESM and CJS builds stay free of side effects. No IIFE for core. Spec: `.scratch/phase-2/spec.md`, "Registration", "Builds and packaging".

**Blocked by:** 02

**Status:** resolved

- [x] `rand`, `each` and the curves import from `@motly/gsap` and are reachable as `Motly.rand` etc.
- [x] The IIFE, loaded after GSAP in a page, registers the plugin and makes `gsap.effects.burst` usable with a Spec using `Motly.rand`.
- [x] Loaded before GSAP (no global `gsap`), the IIFE only defines `Motly`; registering by hand still works.
- [x] Importing the ESM or CJS build registers nothing; the package stays `"sideEffects": false`.
- [x] The IIFE is listed in the published files and reachable from a CDN path.
- [x] `pnpm build` and `pnpm lint && pnpm typecheck && pnpm test` green.

## Comments

Resolved: `src/descriptors-and-curves.ts` re-exports `rand`, `each` and the 30 named curves from core, and the entry re-exports it. `src/iife.ts` is the script build's entry: it makes a copy of the plugin carrying those values, registers it on a global `gsap` if one exists, and default-exports it. A second tsdown config builds it as a minified IIFE, `dist/motly.iife.js`, with every `@motly/core` entry bundled in and `Motly` as its global; `unpkg` and `jsdelivr` point at it, so `https://cdn.jsdelivr.net/npm/@motly/gsap` serves it. `iife.test.ts` builds it from the package's own config and runs GSAP's UMD script and ours in a `vm` page in both orders. `@types/node` is a dev dependency of `@motly/gsap` for that test alone, referenced from it; it was installed with Node 24, as `engineStrict` asks.

Deviation: only the script build's `Motly` carries the Descriptors and curves, not the `Motly` the package exports. Spreading them into the plugin kept every curve in any bundle that registers it, against "every export must be droppable"; the spec's R10 asks for `window.Motly.rand` in the IIFE, and with imports they are named exports.

Left as they are:

- In a worker, GSAP's UMD puts `gsap` on `self.window`, not the global, so the script build does not register itself there; register by hand.
- Invariant 6: the list of Descriptors and curves repeats core's; a Motion adapter would repeat it again. A core subpath holding just them would remove the copies. The test's count of 32 catches drift.
- The IIFE test builds with tsdown inside the suite, about a second of its run.

