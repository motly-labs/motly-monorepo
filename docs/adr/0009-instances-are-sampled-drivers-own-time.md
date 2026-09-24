# Instances are sampled; Drivers own time

An Instance is a pure function of its Playhead: `sample(t)` returns the draw list and holds no playback state. A replaceable Driver (core's rAF loop, the GSAP ticker, Motion) decides `t`, and play, pause, reverse and seek belong to the Driver. `setProgress(p)` is `sample(p * duration)`. An Instance never reads the wall clock. This settles Invariant 5 before `setProgress()` is written.

## Considered Options

- **The Instance owns a playhead and the Driver only sends ticks.** Rejected: every Instance would have to handle rewinds, scrubbing and time jumps itself, and each adapter would have to keep two clocks in sync.

## Consequences

- A Timeline is a Driver that maps its Playhead onto its children's Playheads. It is not a separate playback engine.
- Seeded tests and visual snapshots call `sample(t)` directly, with no clock to fake.
- Anything that depends on history (not only on `t`) cannot live in an Instance. That rules out physics that integrates step by step, which is consistent with "no spring physics in v1".
