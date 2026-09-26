---
'@motly/core': minor
---

Add `AutoRenderer` at `@motly/core/auto`, built with a container element. It paints each Instance with SVGRenderer or CanvasRenderer, picked once from its Element count on its first draw, into layers it creates inside the container. The threshold is still the 200-Element placeholder until the benchmark replaces it.
