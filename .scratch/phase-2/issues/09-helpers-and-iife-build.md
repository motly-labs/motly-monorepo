# 09: Helpers and the IIFE build

**What to build:** One install is enough to use motly with GSAP. `rand`, `each` and the easing curves are named exports of `@motly/gsap` (re-exported from core) and properties of `Motly`. The package builds ESM, CJS and an IIFE: the IIFE bundles core, makes `Motly` the page's global, and registers itself when a global `gsap` exists, as GSAP's own script-tag plugins do, so a CodePen needs two script tags and no build step. The ESM and CJS builds stay free of side effects. No IIFE for core. Spec: `.scratch/phase-2/spec.md`, "Registration", "Builds and packaging".

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] `rand`, `each` and the curves import from `@motly/gsap` and are reachable as `Motly.rand` etc.
- [ ] The IIFE, loaded after GSAP in a page, registers the plugin and makes `gsap.effects.burst` usable with a Spec using `Motly.rand`.
- [ ] Loaded before GSAP (no global `gsap`), the IIFE only defines `Motly`; registering by hand still works.
- [ ] Importing the ESM or CJS build registers nothing; the package stays `"sideEffects": false`.
- [ ] The IIFE is listed in the published files and reachable from a CDN path.
- [ ] `pnpm build` and `pnpm lint && pnpm typecheck && pnpm test` green.
