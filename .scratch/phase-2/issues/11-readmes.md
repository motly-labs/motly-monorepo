# 11: READMEs for `@motly/core` and `@motly/gsap`

**What to build:** A developer can start from npm without a docs site. `@motly/gsap`: copy-paste install (bundler and script tag), a first burst, the vocabulary rule (top-level keys are GSAP's, motly's words live in `spec`), the targets and container options, the cleanup rules including the `tl.kill()` case and what to call instead, and reduced motion. `@motly/core`: standalone install and a first burst. Spec: `.scratch/phase-2/spec.md`, "Demos and docs".

**Blocked by:** 03, 04, 05, 06, 07, 08

**Status:** ready-for-agent

- [ ] Every code sample in both READMEs runs against the built packages.
- [ ] The `tl.kill()` gap is stated plainly, with kill or revert of the burst's own tween, or a context's revert, as the fix.
- [ ] The vocabulary rule names `delay`/`spec.delay` and `ease`/`spec.easing`.
- [ ] No competitor metrics quoted.

## Comments

From ticket 04: besides `tl.kill()`, the cleanup rules should say that the burst's `onInterrupt` belongs in `vars`. Replacing it later with `tween.eventCallback('onInterrupt', fn)` drops the adapter's release, so a later `kill()` leaves the burst drawn, and reading it back returns the adapter's wrapper. See ticket 04's comments.
