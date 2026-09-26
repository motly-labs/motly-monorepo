# `renderer: 'auto'` resolves once, on first draw

An Instance painted by `'auto'` gets SVG or Canvas picked from its Element count, once, on its first draw. It never switches while playing. A Renderer owns DOM (ADR-0014), so switching mid-flight would mean tearing one down and building another mid-animation.

`'auto'` is a Renderer, not a string: `@motly/core/auto` exports `AutoRenderer`, built with a container element and passed as `renderer` like any other, so the Renderer port is unchanged. A Renderer is built with the element it paints into, and `'auto'` must import both Renderers, so it cannot live in the main entry. It picks from the Draw list's length, which never changes for an Instance. It paints into an `<svg>` layer over a `<canvas>` layer, each created inside the container the first time an Instance needs it.

The threshold is 50 Elements, set in Phase 1 from the measurement below; it replaced a 200-Element placeholder.

## Measurement

`apps/demos/bench.html` plays one Burst of animated circles (radius, opacity and color all moving) through each Renderer, for 120 frames after 30 of warm-up. For each frame it takes the main-thread time from the start of the `requestAnimationFrame` callback to the first task after it: sampling, drawing, style, layout and paint. It reports the median and 95th percentile of that, and how many gaps between frame callbacks passed 25 ms, which is a frame missed at 60 fps whatever its cause, raster work off the main thread included.

Apple M2 Pro, 16 GB, macOS 26.6.2, Chrome 153, `devicePixelRatio` 2, a 120 Hz display. The page was not cross-origin isolated, so its timer resolution was 0.1 ms. Two runs; each cell gives the range across them, in ms.

| Elements | SVG median | SVG p95 | Canvas median | Canvas p95 |
| ---: | ---: | ---: | ---: | ---: |
| 5 | 0.4–0.5 | 1.3–1.4 | 0.6 | 0.9–1.0 |
| 10 | 0.6–0.8 | 1.4–1.6 | 0.6 | 0.9 |
| 15 | 0.8–0.9 | 1.5 | 0.6 | 0.9–1.0 |
| 25 | 0.6–1.1 | 1.6 | 0.6 | 0.9–1.0 |
| 50 | 0.9–1.5 | 2.1 | 0.4–0.7 | 1.0–1.1 |
| 100 | 1.5–2.1 | 2.3–3.3 | 0.6–0.8 | 1.0–1.1 |
| 150 | 1.8–2.4 | 2.1–3.9 | 0.8 | 1.3–1.5 |
| 200 | 1.9–2.4 | 2.1–3.0 | 0.8–1.0 | 1.3–1.6 |
| 300 | 2.2–2.5 | 2.5–3.2 | 1.1–1.2 | 1.9–2.0 |
| 400 | 2.6 | 3.1 | 1.4–1.5 | 2.0–2.3 |
| 500 | 2.6–2.7 | 3.1–3.3 | 1.5–1.8 | 2.7 |
| 750 | 3.2–3.3 | 3.6–3.8 | 1.4–1.7 | 2.1–3.1 |
| 1,000 | 3.9 | 4.3 | 1.8 | 2.2–2.9 |
| 2,000 | 7.8–7.9 | 9.5–9.8 | 2.3 | 2.5 |
| 5,000 | – | – | 4.4–4.5 | 4.6–4.8 |

No frame missed 60 fps at any count, with either Renderer.

Canvas costs about 0.6 ms a frame however few Elements it paints, since it clears and repaints its whole backing store; SVG costs about 4 µs an Element. Their medians cross near 15 Elements, and Canvas has the lower p95 at every count. But below about 100 Elements the gap is under the benchmark's run-to-run noise (SVG at 25 Elements measured 0.6 ms in one run and 1.1 ms in the other), so the crossover does not decide the threshold on its own. It was set at 50 with the user: most click and hover effects, 10 to 40 Elements, stay SVG, where they can be inspected and styled at no cost anyone would notice, and anything bigger goes to canvas well before a device several times slower than this one would struggle with SVG. Canvas cost no more than SVG at 50 in any run.

Against `product.md` §1.6's 60 fps targets, a 16.7 ms frame: 500 SVG Elements cost 2.6–2.7 ms median and 3.3 ms at worst at p95, and 5,000 Canvas Elements 4.4–4.5 ms median and 4.8 ms at worst at p95, with no frame missed. Both meet them on this machine, so the typed-array Draw list ADR-0013 defers is not needed yet.

## Consequences

- Instances in one Scope may use different Renderers. They paint unrelated Elements, so this is allowed.
- The threshold rests on a measurement. Record the machine and the benchmark alongside it when it changes, and re-measure on a slow phone before moving it far.
- Bursts of 50 Elements or more land on the canvas, where they cannot be inspected or styled with CSS. A developer who wants SVG names `SVGRenderer`.
