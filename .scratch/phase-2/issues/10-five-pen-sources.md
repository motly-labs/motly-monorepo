# 10: Sources for the five CodePens

**What to build:** Five demos that each show something only a GSAP plugin can do, written so they can be pasted into CodePen at launch: Heart burst, Confetti, Firework, Sparkle click and Ripple. Between them they show timeline sequencing, scrubbing with ScrollTrigger, bursting at a click point, placement with `tl.burst`'s position, and reversing. The ScrollTrigger pen uses container mode; Sparkle click uses point targets. Sources live in `apps/demos` and build against the workspace. Spec: `.scratch/phase-2/spec.md`, "Demos and docs".

**Blocked by:** 03, 04, 06, 09

**Status:** resolved

- [x] Five pages in `apps/demos`, one per pen, each using only `@motly/gsap`'s public API.
- [x] Each pen's source is self-contained enough to paste into CodePen with the IIFE and GSAP script tags.
- [x] The five together cover sequencing, ScrollTrigger scrubbing (container mode), a click point, `tl.burst` position, and reversing.
- [x] The pens clean up on repeated interaction: no overlay left after bursts finish.
- [x] Not snapshotted by Playwright; the canonical-burst snapshots are unchanged.
- [x] `apps/demos` stays private.

## Comments

Resolved: `apps/demos/pens/` holds `heart.html` (sequencing: squash, `tl.shape` ring, pop, `tl.burst` sparks), `confetti.html` (`tl.burst` position: the button, then two points `'<0.25'` and `'<'`), `firework.html` (a pinned section scrubbed by ScrollTrigger, with `container: '.sky'`), `sparkle.html` (a point from `clientX`/`clientY`) and `ripple.html` (a timeline toggled by `play()` and `reverse()`). Each loads GSAP, ScrollTrigger where needed, and `motly.iife.js` by plain script tags from the workspace's `node_modules`, uses only the global `Motly`, and keeps its CSS, markup and JS in one block each, for CodePen's panes; the jsDelivr URL in each is pinned to `@0.1`. `apps/demos` gains `@motly/gsap` and `gsap` as dependencies, `serve.mjs` serves `.js`, and the README says how to run and paste them. Checked headless in Chromium: no page errors, and no layer left once each settles, after repeated clicks, a reverse mid-ripple and scrubbing the firework both ways.

Left as they are:

- Under reduced motion the bursts show their Resting frame, but each pen's own GSAP tweens (the heart's squash, the button pulse, the ripple icon, the rockets) still move. Noted for the README (ticket 11); `gsap.matchMedia()` would be the way if the pens should model it.
- Not checked by hand in Safari and Firefox yet; that is the launch check the spec names.

