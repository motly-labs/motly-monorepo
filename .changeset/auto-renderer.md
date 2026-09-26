---
'@motly/core': minor
---

Add `AutoRenderer` at `@motly/core/auto`, built with a container element. It paints each Instance with SVGRenderer or CanvasRenderer, picked once from its Element count on its first draw, into layers it creates inside the container. Instances of 50 Elements or more go on the canvas; smaller ones stay SVG, where the two measured the same within noise.
