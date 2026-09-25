# 08: Playback control and completion rules

Status: ready-for-agent
Blocked by: 02

**What to build:** A developer can pause, resume, reverse, seek and scrub an Instance, and hook lifecycle callbacks, with completion behaving the way ADR-0016 fixes. All of it belongs to the Driver; the Instance holds no clock (ADR-0009).

- [ ] `pause()`, `resume()`, `reverse()` and a seek in seconds work under the default rAF Driver.
- [ ] `setProgress(p)` gives the same Draw list as `sample(p * duration)`.
- [ ] `play()`'s Promise resolves once, the first time the Playhead reaches the end moving forward. Scrubbing back over the end does not resolve it again.
- [ ] `destroy()` before the end resolves the Promise; it never rejects.
- [ ] Start, update and complete callbacks fire at the right moments. Callbacks are given at Instance creation, never in the Spec.
- [ ] There is no repeat count on an Instance.
- [ ] A custom Driver passed to `createScope` can do everything the rAF Driver does, shown by a test.
