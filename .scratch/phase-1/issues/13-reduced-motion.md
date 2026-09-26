# 13: Reduced motion — the Resting frame at `restAt`

Status: resolved
Blocked by: 02

**What to build:** A viewer with `prefers-reduced-motion: reduce` sees one static Resting frame instead of motion — not a blank page — with no configuration by the developer (Invariant 10, ADR-0012).

- [x] `restAt` is a Spec field, defaulting to 1.
- [x] `reducedMotion: 'user' | 'always' | 'never'` is set on the Instance, not the Spec, defaulting to `'user'`.
- [x] `'user'` reads `matchMedia` from `globalThis` at `play()`, never at import. With none available, it treats the preference as unset.
- [x] Under reduced motion, the Instance renders `sample(restAt * duration)` once, never starts the Driver, and `play()` resolves at once.
- [x] A Burst whose final frame is empty shows Children at a `restAt` below 1.

## Comments

**Implementation notes (ticket 13 build).**

- **`restAt`** is a field of a Shape or Burst Spec, a progress from 0 to 1, defaulting to 1 and validated. It is read from the Spec an Instance is created from; a Child's is accepted, since any Spec may become a Child, and ignored. It is not an `easing` name.
- **`reducedMotion`** is `'user' | 'always' | 'never'` on the InstanceBinding, defaulting to `'user'`, exported as the `ReducedMotion` type. `'user'` calls `globalThis.matchMedia('(prefers-reduced-motion: reduce)')` at each `play()` (never at import or creation), and with no `matchMedia`, as on a server, the preference is unset, so the Instance moves.
- **Under reduced motion,** `play()` pauses the Playback and seeks it to `restAt × duration`, which draws that frame once and moves no frame loop, then settles. The Playhead is left on the frame shown, so a later `resume()` with motion carries on from it. **Callbacks (decided with the user):** as a play that went straight to its end, so `onStart`, `onUpdate(restAt × duration)`, then `onComplete`.
- **`resume()` and `reverse()` (decided with the user):** they never run a Driver under reduced motion. `resume()` does nothing; `reverse()` jumps to frame 0, where reversing would have run to. `seek()` and `setProgress()` still move the Playhead, since a page calls them on the viewer's own input, such as a slider.
- **Timelines (decided with the user):** a Scope's `timeline({ reducedMotion })` takes the same setting, defaulting to `'user'`. Under reduced motion its `play()` draws every Instance on it once at that Instance's own Resting frame, settles each Instance's `play()` and its own, and runs no Driver; `resume()` and `reverse()` behave as an Instance's.
- **Port unchanged:** the Timeline reads each Instance's Resting frame through `InstanceTarget`, an internal extension of `DriverTarget` its own Instances hand it. The public Driver port does not carry it; the GSAP adapter decides in Phase 2 whether a host Driver needs it.
- **After review:**
  - **Fixed, with a test:** an Instance on a Timeline decided reduced motion itself, so under the viewer's preference its own `play()` drew it and settled before the Timeline played, and drew it twice in all. The Timeline now decides for every Instance on it, whatever their bindings say, which is documented on both.
  - **Fixed, with a test:** a reduced-motion `play()` left the Playhead where motion had put it, so a later `resume()` jumped. It now seeks the Playback to the Resting frame.
  - **Fixed:** a first draft put `rest` on the public `DriverTarget`, and the Timeline's own came out as its end, which a host Driver trusting it would show as an empty frame. It is internal now.
  - **Not changed:** reading `matchMedia` in core. The ticket and ADR-0012 ask for it, it is read lazily from `globalThis` as `requestAnimationFrame` is, and it is safe on a server. The reduced-motion branches of `play()`, `resume()` and `reverse()` are written in both Instance and Timeline, a few lines each.
- **Tests** (`reduced-motion.test.ts`): the Resting frame drawn once with no Driver running; a Burst whose last frame is empty showing Children at `restAt` 0.5; `'user'` read at `play()` through a stubbed `matchMedia`; motion where none exists and under `'never'`; the callbacks in order; `resume()` and `reverse()`; a Timeline; and `restAt` validation.
