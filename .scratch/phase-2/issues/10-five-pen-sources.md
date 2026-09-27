# 10: Sources for the five CodePens

**What to build:** Five demos that each show something only a GSAP plugin can do, written so they can be pasted into CodePen at launch: Heart burst, Confetti, Firework, Sparkle click and Ripple. Between them they show timeline sequencing, scrubbing with ScrollTrigger, bursting at a click point, placement with `tl.burst`'s position, and reversing. The ScrollTrigger pen uses container mode; Sparkle click uses point targets. Sources live in `apps/demos` and build against the workspace. Spec: `.scratch/phase-2/spec.md`, "Demos and docs".

**Blocked by:** 03, 04, 06, 09

**Status:** ready-for-agent

- [ ] Five pages in `apps/demos`, one per pen, each using only `@motly/gsap`'s public API.
- [ ] Each pen's source is self-contained enough to paste into CodePen with the IIFE and GSAP script tags.
- [ ] The five together cover sequencing, ScrollTrigger scrubbing (container mode), a click point, `tl.burst` position, and reversing.
- [ ] The pens clean up on repeated interaction: no overlay left after bursts finish.
- [ ] Not snapshotted by Playwright; the canonical-burst snapshots are unchanged.
- [ ] `apps/demos` stays private.
