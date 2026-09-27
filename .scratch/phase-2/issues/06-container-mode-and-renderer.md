# 06: Container mode and the `renderer` option

**What to build:** `container` in `vars` paints the burst inside the given element instead of the overlay, under core's Renderer rules (it must have a size; a static container is made relative), so a burst scrolls with its section or is clipped by its card, and a ScrollTrigger-scrubbed burst stays attached to its content. Anchors and point targets are converted into the container's coordinates. `renderer: 'svg' | 'canvas' | 'auto'` picks the Renderer for either mode, defaulting to `auto`, which chooses by the burst's size. Spec: `.scratch/phase-2/spec.md`, "The effect call", "Overlay and lifecycle".

**Blocked by:** 05

**Status:** resolved

- [x] With `container`, the burst is painted inside that element and nothing is added to the overlay.
- [x] An Anchor and a point target land where expected in the container's coordinates.
- [x] `container` accepts an element or a selector.
- [x] `renderer` defaults to `auto`; `svg` and `canvas` force a Renderer (tests pin `svg`, since happy-dom has no canvas).
- [x] Release at the ends and on kill or revert works in container mode as it does in the overlay.
- [x] `pnpm lint && pnpm typecheck && pnpm test` green.

## Comments

Resolved: each tween paints into one layer, built by `renderer`: an `<svg>` with SVGRenderer, a `<canvas>` with CanvasRenderer, or, by default, a `<div>` with AutoRenderer. The layer is `position: fixed` over the viewport, or `position: absolute` covering the container; either way it is appended between the ends and removed at them, on kill and on revert, as the overlay was. With the default, the overlay is now a fixed `<div>` holding AutoRenderer's layers rather than a fixed `<svg>`; the changeset says so. Origins are moved into the container at each forward start, measured from inside its border and by its scroll, since an absolute layer scrolls with the content.

Decisions not in the spec:

- A `container` selector that matches nothing warns once and draws over the viewport, where targets' Origins already are.
- `container` is typed `HTMLElement | string`, not the spec's `Element | string`: the layer is appended to it and its `style.position` may be set, and AutoRenderer takes an `HTMLElement`. Ticket 08 owns the final types; `RendererName` is not exported yet either.

Left as they are:

- Invariant 6: with `'svg'` or `'canvas'` in a container, the adapter makes a static container relative and styles its layer to cover it, as core's AutoRenderer does privately. One adapter so far; move it into core if the Motion adapter needs the same.
- A layer at `height: 100%` covers only the visible box of a container that scrolls inside itself, a limit it shares with AutoRenderer.
- CanvasRenderer is built before its canvas is in the document and sizes itself on its ResizeObserver's first callback, which runs before the first paint. The canvas tests stub the 2D context, since happy-dom has none, so this is checked by hand in the pens.

