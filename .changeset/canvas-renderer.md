---
'@motly/core': minor
---

Add `CanvasRenderer` at `@motly/core/canvas`, constructed with its `<canvas>`. It draws every Element kind and style `SVGRenderer` does, from the same Draw list, and hosts any number of Instances on one canvas: releasing one leaves the others drawing. It stays sharp on high-density screens and follows the canvas's size on the page through a `ResizeObserver`, repainting at once on a resize or a zoom. A canvas sized only by its `width` and `height` attributes is fixed at its first size, inline.
