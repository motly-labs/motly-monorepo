# 12: `renderer: 'auto'` and measured performance

Status: resolved
Blocked by: 11

**What to build:** A developer who does not choose a Renderer gets SVG or Canvas picked once, at creation, from the Element count (ADR-0015), and the threshold is a measured number rather than the 200-Element placeholder.

Settle first: ADR-0014 says a Renderer is constructed with the element it paints into, so `'auto'` cannot simply name a Renderer — something has to create the SVG or canvas element, and it must import both Renderers, so it cannot live in the main entry. Decide where `'auto'` lives and what it is given. It is public API that is hard to change later; weigh whether it earns an ADR.

- [x] The shape of `'auto'` is decided and recorded.
- [x] `'auto'` resolves once at Instance creation and never switches while playing.
- [x] A benchmark finds the SVG/Canvas crossover and replaces the 200 threshold. The machine and benchmark are recorded in ADR-0015, as that ADR requires.
- [x] Frame cost at 500 SVG Elements and 5,000 Canvas Elements is measured against `product.md` §1.6's 60fps targets and written down.
- [x] If Canvas misses 5,000, a ticket is opened for the typed-array layout ADR-0013 defers. It is not built here.

## Comments

**Progress (ticket 12, part 1).**

- **Shape of `'auto'` (decided with the user):** `@motly/core/auto` exports `AutoRenderer`, built with a container element and passed as `renderer` like any other. On each Instance's first draw it picks SVGRenderer or CanvasRenderer from the Draw list's length, which never changes for an Instance, so nothing switches while playing. It paints into an `<svg>` layer over a `<canvas>` layer, each created inside the container the first time an Instance needs it, and makes a `static` container `relative`. The port is unchanged. To be recorded by amending ADR-0015, which needs the measured threshold anyway.
- **Committed:** `AutoRenderer` with ADR-0015's 200-Element placeholder as `CANVAS_FROM`, the `./auto` entry and export, and `apps/demos/bench.html`, which measures the median main-thread cost of a frame (sample, draw, style, layout and paint, to the first task after the frame) for SVG and Canvas at counts from 25 to 5,000.
- **Still to do:**
  - Run the benchmark in a visible Chrome window: a hidden tab gets no animation frames. The machine is an Apple M2 Pro, 16 GB, macOS 26.6.2.
  - Replace `CANVAS_FROM` with the measured crossover, and amend ADR-0015 with the number, the machine, the browser and the benchmark.
  - Write down the frame cost at 500 SVG and 5,000 Canvas Elements against `product.md` §1.6, and open the typed-array ticket if Canvas misses 5,000.
  - Add AutoRenderer to the demos' Renderer switch, and review.

**Implementation notes (ticket 12, part 2).**

- **Benchmark:** run in the development machine's Chrome, visible and in front: Apple M2 Pro, 16 GB, macOS 26.6.2, Chrome 153, `devicePixelRatio` 2, 120 Hz display, not cross-origin isolated, so the timer resolution is 0.1 ms.
  - The first run gave only the median main-thread cost, from 25 Elements up.
  - After review, `bench.html` also reports the 95th percentile and counts frames that missed 60 fps, from the gaps between frame callbacks. Those gaps also catch raster work off the main thread. It now starts at 5 Elements. It was run twice more.
  - The full table is in ADR-0015.
- **Threshold, decided with the user: 50.**
  - The medians cross near 15 Elements, and Canvas has the lower p95 everywhere.
  - Below about 100 Elements the gap is under the run-to-run noise: SVG at 25 Elements measured 0.6, 1.1 and 0.6 ms across the three runs. So the crossover alone does not set the threshold.
  - 50 keeps the usual click and hover effects as SVG, which can be inspected, at no cost anyone would notice. Anything bigger goes to canvas before a slow device would struggle with SVG.
  - Canvas cost no more than SVG at 50 in any run.
- **§1.6 targets, a 16.7 ms frame at 60 fps:**
  - 500 SVG Elements cost 2.6–2.7 ms median and at most 3.3 ms at p95.
  - 5,000 Canvas Elements cost 4.4–4.5 ms median and at most 4.8 ms at p95.
  - No frame missed 60 fps at any count. Both targets pass on this machine, so no typed-array ticket is opened. Re-measure on a slow phone before moving the threshold far.
- **ADR-0015 amended:** the shape of `'auto'`, the threshold and why, the machine, the browser, the method and the numbers. Its title now says it resolves on first draw, which is what it does. Recorded in `spec.md` too.
- **After review:**
  - **Fixed, checked in Chrome:** `AutoRenderer` read the container's `position` when it was built. That is normally before the container is in the document, where it has no computed style, so a `static` container was never made `relative` and the layers escaped it. It now reads it when it makes its first layer. The container must be in the document by the first draw, as documented.
  - **Fixed:** the layers let pointer events through to the container's content.
  - **Fixed:** the SVG layer clips at the container's edges as the canvas does, so an Instance looks the same on either side of the threshold.
  - **Fixed:** `CANVAS_FROM` is not exported, since it changes whenever the benchmark is re-run.
  - **Tidied:** `fill()` renamed `cover()`, and stale demo comments corrected.
  - **Documented, not changed:** the `<svg>` layer is always over the `<canvas>` layer, whatever order Instances were created in. Layers stay in the container, empty, when their Instances are released, and go with the container.
- **Demos:** the Renderer switch offers AutoRenderer, and a 400-Element Burst shows it choosing the canvas.
  - Checked in Chrome: every smaller demo gets an `<svg>` layer, and the large one a `<canvas>` of 800 × 600 device pixels.
  - 49 Elements go to SVG and 50 to canvas. A container with both has the canvas under the SVG. `scope.destroy()` clears both.
- **Tests:** AutoRenderer is DOM code, so it has no Vitest test (spec, Testing Decisions). It was checked by hand as above.
