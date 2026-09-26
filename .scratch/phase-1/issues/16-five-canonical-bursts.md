# 16: Five canonical bursts in `apps/demos`

Status: ready-for-human
Blocked by: 03, 04, 07, 09, 11

**What to build:** The phase exit criterion: five canonical bursts, written in plain HTML against `@motly/core`, working in Safari, Chrome and Firefox. They are also the fixtures ticket 17 snapshots.

- [x] Five demos, each with a fixed Seed, together exercising distribution and randomness, Keyframes and color, Stagger, Swirl, and a high Element count.
- [x] Each demo runs under either Renderer.
- [x] Each demo can be pinned to a chosen Playhead through a manual Driver, for ticket 17.
- [ ] Checked by hand in Safari, Chrome and Firefox; browser versions recorded in a comment on this ticket.
- [x] `apps/demos` stays private and unpublished.

**Implementation notes (ticket 16).**

- `apps/demos/canonical.html`, Seeds 1 to 5: Confetti (`rand` and `each` over four kinds), Bloom (Keyframes on radius, scale, angle, fill, stroke and opacity), Ripple (Stagger with an easing), Swirl, and Fireworks (12 × 40 = 480 Elements).
- `?renderer=svg|canvas` picks the Renderer; `?progress=p` pins every demo there through a manual Driver written in the page, since core's own one is test-only and not exported.
- **Left for a human:** the check by hand. Pinned frames were checked under both Renderers in Chrome 154.0.8037.57 on macOS, and headless Chromium 1.63 in the Playwright container rendered them. Live playback was not seen: the automated Chrome tab was hidden, so rAF did not run. Safari 26.6.2 is installed but was not checked; Firefox is not installed.
