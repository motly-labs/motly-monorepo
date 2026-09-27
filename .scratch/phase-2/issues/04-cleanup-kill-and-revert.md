# 04: Cleanup on kill and revert

**What to build:** A burst never outlives the tween that drew it, wherever GSAP reaches the tween. Revert of any kind (`tween.revert()`, `tl.revert()`, `gsap.context().revert()`, and so `useGSAP` on unmount) renders the plugin at ratio 0, which releases the overlay. `tween.kill()` mid-flight reaches only `onInterrupt`, which the adapter chains before the user's own and uses to release. `tl.kill()` on a parent timeline reaches neither; it is documented, not worked around, and pinned by a test so a GSAP change that closes the gap is noticed. Spec: `.scratch/phase-2/spec.md`, "Overlay and lifecycle"; the probe table in `.scratch/phase-2/phase2-explore.md`.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] One test per probe-table row, each mid-flight: `tween.kill()`, `tween.revert()`, `tl.revert()` and `gsap.context().revert()` leave nothing drawn.
- [ ] `tl.kill()` mid-flight leaves the burst drawn (the documented gap).
- [ ] The user's `onInterrupt` is still called, after the adapter's release.
- [ ] A burst fired many times and left to finish leaves no overlay in the document.
- [ ] `pnpm lint && pnpm typecheck && pnpm test` green.
