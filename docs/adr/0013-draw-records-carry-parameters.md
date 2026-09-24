# Draw records carry parameters, not geometry

A draw-list record describes one Element for one frame as `kind`, that kind's own parameters (`points`, `radius`, …), a transform (x, y, angle, scale) and a style (fill, stroke, strokeWidth, opacity). It never carries a built path or vertex list. Renderers build geometry themselves, which lets the SVG renderer keep a live `<polygon>` or `<circle>` and update attributes, and stops core from rebuilding 5,000 paths a frame for Canvas.

Records come from a pool that is reused between frames and grows only when the Element count does (`product.md` §2.2).

## Consequences

- Custom paths are the exception: their geometry is in the Spec, so the record references it rather than describing it.
- A typed-array layout is deferred until a benchmark shows the object pool misses the 5,000-shape target.
