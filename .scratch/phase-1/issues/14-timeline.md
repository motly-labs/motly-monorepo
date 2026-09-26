# 14: Timeline

Status: resolved
Blocked by: 08

**What to build:** A developer can sequence several Instances on one Timeline and play, pause, seek and reverse them together. A Timeline is a Driver that maps its own Playhead onto its Instances' Playheads, not a second playback engine (ADR-0009, ADR-0010).

- [x] A Timeline places Instances at start offsets and drives them through the Driver interface.
- [x] Play, pause, seek and reverse on the Timeline act on every Instance in it.
- [x] A Timeline's duration is derived from its Instances.
- [x] Instances need no change to run under a Timeline.
- [x] A Timeline and its Instances are released together by `destroy()`, with no module-level state.

## Comments

**Implementation notes (ticket 14 build).**

- **API (decided with the user):** `scope.timeline()` returns a Timeline played by the Scope's Driver. `timeline.shape(spec, binding, at?)` and `timeline.burst(spec, binding, at?)` create Instances on it. With no `at`, an Instance goes after everything on the Timeline so far, as in GSAP; pass `at` to overlap. The Timeline has `play()` (a Promise, as an Instance's), `pause()`, `resume()`, `reverse()`, `seek(t)`, `setProgress(p)`, `duration` and `destroy()`.
- **A Driver, not a second engine (ADR-0009):** each Instance on a Timeline is created with a Driver of the Timeline's, whose `attach()` records the Instance's target and start. The Timeline is itself one target on the Scope's Driver; rendering it renders each Instance at its own Playhead, held within 0 and its duration, so an Instance is at its first frame before its start and at its last after its end, as a delayed Child is. When the Timeline's Playhead passes an Instance's end moving forward, it calls that target's `finish()`. Pause, reverse and seek therefore need no code of their own: the Scope's Driver does them to the Timeline's one Playhead.
- **Duration** is the latest end on the Timeline, read live, so it grows as Instances are added and shrinks when one is destroyed.
- **An Instance's own controls (decided with the user):** they do nothing, since the Timeline decides its Playhead. `await instance.play()` still resolves when the Timeline carries it past its end, since the Timeline calls its `finish()`; `instance.destroy()` takes it off the Timeline.
- **Instances attach when created.** Until now an Instance attached to its Driver on first use. The Timeline has to know every Instance on it from the start to derive its duration and draw them, so `SpecInstance` now attaches in its constructor. Attaching draws nothing and starts no frame loop, so nothing else changes; the playback tests pass untouched.
- **Release:** `timeline.destroy()` destroys its Instances, detaches from the Scope's Driver and resolves a pending `play()`. `scope.destroy()` destroys its Timelines with its Instances. No module-level state.
- **"Instances need no change":** true of the developer's Instances, which run on a Timeline as created, with no Spec or binding change. Internally `SpecInstance` changed once, to attach when created (above).
- **After review:**
  - **Fixed, with a test:** where the Scope's Driver cannot run at all, as rAF on a server, the Timeline's `finish()` now settles every Instance on it too. An Instance's own `play()` hung there before.
  - **Tested:** scrubbing over the end resolves `play()` once, and a replay resolves it again (story 19).
  - **Fixed:** a second `stop()` of one Instance could splice out another's placement; `stop()` now does nothing twice.
  - **Tidied:** each Timeline control says when to reach for it; the `Instance` docs say what its controls do on a Timeline; `setProgress` no longer relies on `this`; the Scope's set of what it owns is `owned`, not `instances`.
  - **Documented, not changed:**
    - An Instance's `onStart` follows its own `play()`, so it fires on the Timeline's next draw of it, even while it is held at its first frame before its start. Firing callbacks at an Instance's start on the Timeline would be a feature of its own.
    - A custom Driver now sees `attach()` when an Instance is created, not on its first `play()` or `seek()`. A host Driver that moves every attached Playhead at once, as the test Driver's `seek()` does, moves never-played Instances too.
    - The waiters and guarded controls repeat `SpecInstance`'s in a few lines; not shared, as the two settle differently (a Timeline also settles its Instances).
- **Not built:** Timelines inside Timelines, labels, and callbacks on the Timeline itself. An Instance's `onUpdate` fires on each draw the Timeline makes; its `onStart` and `onComplete` follow its own `play()`, as before.
