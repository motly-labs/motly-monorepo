# 08: Playback control and completion rules

Status: resolved
Blocked by: 02

**What to build:** A developer can pause, resume, reverse, seek and scrub an Instance, and hook lifecycle callbacks, with completion behaving the way ADR-0016 fixes. All of it belongs to the Driver; the Instance holds no clock (ADR-0009).

- [x] `pause()`, `resume()`, `reverse()` and a seek in seconds work under the default rAF Driver.
- [x] `setProgress(p)` gives the same Draw list as `sample(p * duration)`.
- [x] `play()`'s Promise resolves once, the first time the Playhead reaches the end moving forward. Scrubbing back over the end does not resolve it again.
- [x] `destroy()` before the end resolves the Promise; it never rejects.
- [x] Start, update and complete callbacks fire at the right moments. Callbacks are given at Instance creation, never in the Spec.
- [x] There is no repeat count on an Instance.
- [x] A custom Driver passed to `createScope` can do everything the rAF Driver does, shown by a test.

## Comments

**Implementation notes (ticket 08 build).**

- **Port (decided with the user):** `Driver.play(target)` became `Driver.attach(target)`, returning a Playback paused at 0: `play()`, `pause()`, `resume()`, `reverse()`, `seek(t)`, `stop()`. This is a breaking change to the port, fine before 1.0. It maps onto a paused GSAP tween for Phase 2. The Instance delegates each control to its Playback and attaches lazily, so `seek()` and `setProgress()` work before any `play()`.
- **Who decides completion:** the Driver, because it alone knows the direction. `DriverTarget.finish()` now means "the Playhead reached the end moving forward", by playing or by a seek, or "this Driver cannot run here at all" (rAF on a server). The Instance no longer settles on `t >= duration` in `render`, so a backward pass or a scrub back over the end cannot settle anything.
- **Semantics:**
  - `play()` restarts from 0, forward.
  - `resume()` carries on in the last direction.
  - `reverse()` runs backward from the Playhead and stops at 0 without settling.
  - `seek(t)` clamps to 0 and the duration, draws at once, and leaves the Playback advancing or paused as it was. Reaching the end at the Playback's heading stops it.
  - `setProgress(p)` is `seek(p * duration)`, and is tested equal to `sample(p * duration)` on a never-played Burst with `rand()` and stagger.
- **Completion:** the Promise resolves the first time the Playhead reaches the end moving forward after a `play()`, including by `setProgress(1)` while paused. `destroy()` resolves it, never rejects. After it settles, scrubbing back and to the end again settles nothing. Several pending `play()`s settle together.
- **Callbacks (decided with the user):** `onStart`, `onUpdate(t)`, `onComplete` on the InstanceBinding.
  - `onStart` fires on the first draw after each `play()`.
  - `onUpdate(t)` fires after every draw, seeks included; `sample()` stays pure and fires nothing.
  - `onComplete` fires once per `play()`, after the last `onUpdate`, and not on `destroy()` or on a seek to the end with no `play()` pending.
  - On a server, where `play()` settles at once without drawing, `onComplete` fires and `onStart` does not.
- **No repeat count:** neither on the binding (a type error) nor in the Spec (a strict-validation error). Repeating belongs to a Driver (ADR-0016).
- **Custom Driver:** `src/testing/manual-driver.ts` implements the port from the public types alone. `playback.test.ts` runs every playback, completion and callback scenario against it and against the rAF Driver over stubbed frames, via `describe.each`. It replaced three hand-rolled test Drivers. It lives under `src/` for the typecheck but is not a build entry, so it does not ship.
- **rAF loop:** it runs only while some Playback is advancing. A pause, reaching an end, or a seek on a never-played Instance leaves no frame pending.
- **After review:**
  - **Fixed, with a test:** nothing fires after `destroy()`, even when a callback destroys the Instance mid-draw.
  - **Fixed, with a test:** a seek mid-play, or a `reverse()` while running, no longer loses a frame of time. The rAF Driver keeps counting from the last frame, and resets only when a still Playhead starts moving.
  - **Documented, not changed:**
    - Several pending `play()`s settle together with one `onComplete`.
    - A seek forward to the end settles `play()` even while the Playhead runs backward.
    - On a server, `onComplete` fires with nothing drawn.
- **Invariant 6, noted:** the Playhead bookkeeping (clamp, stop at the heading's end, `finish()` on reaching the end forward) is written twice, in the rAF Driver and in the test Driver, which must be written from the port alone to prove it. The GSAP adapter should not need a third copy: a GSAP tween already clamps, tracks direction and fires on completion, so the adapter maps its hooks onto `render` and `finish`. If it turns out to need the bookkeeping, move it into core as an exported helper.
- **Fidelity of the test Driver:** it gives the same outcomes as rAF, not the same frames. rAF draws the Playhead where it stands on the first frame after `play()`; the manual Driver draws only when advanced.
