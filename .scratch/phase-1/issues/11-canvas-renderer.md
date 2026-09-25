# 11: CanvasRenderer at parity with SVG

Status: ready-for-agent
Blocked by: 04, 10

**What to build:** A developer can swap `SVGRenderer` for `CanvasRenderer` and see the same effect, drawn on a canvas. This is the perf story past SVG's ceiling.

- [ ] `@motly/core/canvas` exports `CanvasRenderer`, constructed with its canvas element.
- [ ] It draws every kind and style `SVGRenderer` does, from the same Draw list, building geometry itself.
- [ ] Several Instances can share one canvas, and destroying one leaves the others drawing.
- [ ] Output is crisp on high-DPR screens.
- [ ] `apps/demos` can switch any demo between the two Renderers.
