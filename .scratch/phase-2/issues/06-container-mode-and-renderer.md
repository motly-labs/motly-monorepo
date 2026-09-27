# 06: Container mode and the `renderer` option

**What to build:** `container` in `vars` paints the burst inside the given element instead of the overlay, under core's Renderer rules (it must have a size; a static container is made relative), so a burst scrolls with its section or is clipped by its card, and a ScrollTrigger-scrubbed burst stays attached to its content. Anchors and point targets are converted into the container's coordinates. `renderer: 'svg' | 'canvas' | 'auto'` picks the Renderer for either mode, defaulting to `auto`, which chooses by the burst's size. Spec: `.scratch/phase-2/spec.md`, "The effect call", "Overlay and lifecycle".

**Blocked by:** 05

**Status:** ready-for-agent

- [ ] With `container`, the burst is painted inside that element and nothing is added to the overlay.
- [ ] An Anchor and a point target land where expected in the container's coordinates.
- [ ] `container` accepts an element or a selector.
- [ ] `renderer` defaults to `auto`; `svg` and `canvas` force a Renderer (tests pin `svg`, since happy-dom has no canvas).
- [ ] Release at the ends and on kill or revert works in container mode as it does in the overlay.
- [ ] `pnpm lint && pnpm typecheck && pnpm test` green.
