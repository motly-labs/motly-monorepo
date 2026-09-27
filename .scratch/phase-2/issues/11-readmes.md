# 11: READMEs for `@motly/core` and `@motly/gsap`

**What to build:** A developer can start from npm without a docs site. `@motly/gsap`: copy-paste install (bundler and script tag), a first burst, the vocabulary rule (top-level keys are GSAP's, motly's words live in `spec`), the targets and container options, the cleanup rules including the `tl.kill()` case and what to call instead, and reduced motion. `@motly/core`: standalone install and a first burst. Spec: `.scratch/phase-2/spec.md`, "Demos and docs".

**Blocked by:** 03, 04, 05, 06, 07, 08

**Status:** resolved

- [x] Every code sample in both READMEs runs against the built packages.
- [x] The `tl.kill()` gap is stated plainly, with kill or revert of the burst's own tween, or a context's revert, as the fix.
- [x] The vocabulary rule names `delay`/`spec.delay` and `ease`/`spec.easing`.
- [x] No competitor metrics quoted.

## Comments

From ticket 04: besides `tl.kill()`, the cleanup rules should say that the burst's `onInterrupt` belongs in `vars`. Replacing it later with `tween.eventCallback('onInterrupt', fn)` drops the adapter's release, so a later `kill()` leaves the burst drawn, and reading it back returns the adapter's wrapper. See ticket 04's comments.

From ticket 10: the adapter's reduced motion covers the bursts only. A page's own GSAP tweens around them keep moving; say so beside the reduced-motion section, and point at `gsap.matchMedia()`.

Resolved: `packages/core/README.md` covers install, a first `Burst` with `SVGRenderer`, what the Spec's arrays, Descriptors and Seed mean, the three Renderers, and reduced motion. `packages/gsap/README.md` covers install with a bundler and by script tags, a first burst and `tl.burst`, the vocabulary rule with its four binding keys, where a burst comes from and where it is painted, cleanup with the `tl.kill()` gap and the `onInterrupt` rule, reduced motion with `gsap.matchMedia()` for the page's own tweens, and the types. Every fenced JavaScript sample was run as written, pulled out of the Markdown, in headless Chromium against the built packages, and `scrollTrigger` in a burst's vars was checked the same way.

No changeset: ticket 12 replaces the pending ones with one initial-release changeset per package.

Left as they are:

- The script-tag URL names `@motly/gsap@0.1`, which resolves once 0.1.0 is published (ticket 14).
- The sample harness lives outside the repo; a doc test in the suite would keep the samples honest as the API moves.

