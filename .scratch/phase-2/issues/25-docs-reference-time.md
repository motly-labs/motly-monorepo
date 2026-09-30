# 25: Docs: Spec reference — time

**What to build:** How a burst unfolds in time, standalone and under GSAP. Spec: `.scratch/phase-2/spec.md`, "Demos and docs", user story 62.

**Blocked by:** 21

**Status:** resolved

- [x] `duration`, `delay` and `restAt`, and how an Element's duration is computed (ADR-0016).
- [x] Stagger: a fixed step, and `{ each, easing }`.
- [x] Timeline and Playback in core: play, pause, seek, reverse; the Driver, and when to pass your own.
- [x] The Resting frame and reduced motion (ADR-0012), standalone and through `vars.reducedMotion`.
- [x] A live example for each; the Playback example has controls.
- [x] The anchors the Shapes and Burst pages already link to exist: `#stagger` and `#the-resting-frame`.

## Comments

Done 2026-09-30. `reference/time` covers duration and delay (ADR-0016), Stagger, Playback, Timelines and Scopes, Drivers, and the Resting frame (ADR-0012). Five new examples (`time-delay`, `time-stagger`, `time-stagger-curve`, `time-playback` with controls and a `setProgress()` slider, `time-timeline`) and `core-reduced-motion` reused; all drew in headless Chrome 154 with no errors.

The ticket asked when to pass "a manual" Driver. Core's manual Driver is a test fixture in `src/testing`, not public, so the page documents the Driver port through `createScope({ driver })` instead.
