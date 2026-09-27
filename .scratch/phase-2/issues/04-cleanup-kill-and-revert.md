# 04: Cleanup on kill and revert

**What to build:** A burst never outlives the tween that drew it, wherever GSAP reaches the tween. Revert of any kind (`tween.revert()`, `tl.revert()`, `gsap.context().revert()`, and so `useGSAP` on unmount) renders the plugin at ratio 0, which releases the overlay. `tween.kill()` mid-flight reaches only `onInterrupt`, which the adapter chains before the user's own and uses to release. `tl.kill()` on a parent timeline reaches neither; it is documented, not worked around, and pinned by a test so a GSAP change that closes the gap is noticed. Spec: `.scratch/phase-2/spec.md`, "Overlay and lifecycle"; the probe table in `.scratch/phase-2/phase2-explore.md`.

**Blocked by:** 02

**Status:** resolved

- [x] One test per probe-table row, each mid-flight: `tween.kill()`, `tween.revert()`, `tl.revert()` and `gsap.context().revert()` leave nothing drawn.
- [x] `tl.kill()` mid-flight leaves the burst drawn (the documented gap).
- [x] The user's `onInterrupt` is still called, after the adapter's release.
- [x] A burst fired many times and left to finish leaves no overlay in the document.
- [x] `pnpm lint && pnpm typecheck && pnpm test` green.

## Comments

Resolved: the revert rows needed no code; the plugin sees them at ratio 0, as ADR-0018 intends, and the tests pin it. `kill()` is covered by an `onInterrupt` the adapter puts on the tween: it releases the burst, then calls the user's own with GSAP's scope and params.

An `onInterrupt` set with `gsap.defaults()` is called as on any tween, since the adapter's own would otherwise take its place.

Known gap, for the README (ticket 11) alongside `tl.kill()`: replacing the callback later with `tween.eventCallback('onInterrupt', fn)` drops the adapter's release, so a `kill()` after that leaves the burst drawn; and reading it back, through `eventCallback('onInterrupt')` or `tween.vars`, returns the adapter's wrapper, not the function given. Pass `onInterrupt` in `vars` instead.
