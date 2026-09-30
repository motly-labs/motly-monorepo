# 22: Docs: getting started and the GSAP guide

**What to build:** A developer arriving from a launch post gets from install to a first burst with either package. Spec: `.scratch/phase-2/spec.md`, "Demos and docs", user story 61.

**Blocked by:** 21

**Status:** resolved

- [x] "Getting started with GSAP": install with a bundler and with script tags, a first burst, `tl.burst` in a timeline. Grown from the `@motly/gsap` README.
- [x] A GSAP guide: the vocabulary rule, targets (Anchors, points, selectors), `seed`, `container` and `renderer`, cleanup including the `tl.kill()` case, reduced motion, types.
- [x] "Getting started with core": install, a first burst with `SVGRenderer`, Renderers, reduced motion. Grown from the `@motly/core` README.
- [x] Every code sample that draws something is a live example.

## Comments

Done 2026-09-30. Three pages: `start/gsap`, `start/core` and `guides/gsap`, with a sidebar. The landing page links to both start pages.

- The text follows the READMEs closely, so each fact has one wording. It adds the first-burst walkthrough (Emitter, Keyframes, Descriptor, Resting frame) and a `useGSAP` snippet and a `BurstVars` snippet, neither of which draws anything.
- Nine new live examples in `apps/docs/src/examples`: `shape-star`, `gsap-vars`, `gsap-point`, `gsap-seed`, `gsap-container`, `gsap-reduced-motion`, `core-first-burst`, `core-canvas`, `core-reduced-motion`. Each was loaded in headless Chrome 154 and drew on load or on click, with no errors.
- The stage `<svg>`s in the core examples are `aria-hidden`: the bursts are decoration.
