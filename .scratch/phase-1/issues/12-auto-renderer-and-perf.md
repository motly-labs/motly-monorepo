# 12: `renderer: 'auto'` and measured performance

Status: in-progress
Blocked by: 11

**What to build:** A developer who does not choose a Renderer gets SVG or Canvas picked once, at creation, from the Element count (ADR-0015), and the threshold is a measured number rather than the 200-Element placeholder.

Settle first: ADR-0014 says a Renderer is constructed with the element it paints into, so `'auto'` cannot simply name a Renderer — something has to create the SVG or canvas element, and it must import both Renderers, so it cannot live in the main entry. Decide where `'auto'` lives and what it is given. It is public API that is hard to change later; weigh whether it earns an ADR.

- [ ] The shape of `'auto'` is decided and recorded.
- [ ] `'auto'` resolves once at Instance creation and never switches while playing.
- [ ] A benchmark finds the SVG/Canvas crossover and replaces the 200 threshold. The machine and benchmark are recorded in ADR-0015, as that ADR requires.
- [ ] Frame cost at 500 SVG Elements and 5,000 Canvas Elements is measured against `product.md` §1.6's 60fps targets and written down.
- [ ] If Canvas misses 5,000, a ticket is opened for the typed-array layout ADR-0013 defers. It is not built here.

## Comments

**Progress (ticket 12, part 1).**

- **Shape of `'auto'` (decided with the user):** `@motly/core/auto` exports `AutoRenderer`, built with a container element and passed as `renderer` like any other. On each Instance's first draw it picks SVGRenderer or CanvasRenderer from the Draw list's length, which never changes for an Instance, so nothing switches while playing. It paints into an `<svg>` layer over a `<canvas>` layer, each created inside the container the first time an Instance needs it, and makes a `static` container `relative`. The port is unchanged. To be recorded by amending ADR-0015, which needs the measured threshold anyway.
- **Committed:** `AutoRenderer` with ADR-0015's 200-Element placeholder as `CANVAS_FROM`, the `./auto` entry and export, and `apps/demos/bench.html`, which measures the median main-thread cost of a frame (sample, draw, style, layout and paint, to the first task after the frame) for SVG and Canvas at counts from 25 to 5,000.
- **Still to do:**
  - Run the benchmark in a visible Chrome window: a hidden tab gets no animation frames. The machine is an Apple M2 Pro, 16 GB, macOS 26.6.2.
  - Replace `CANVAS_FROM` with the measured crossover, and amend ADR-0015 with the number, the machine, the browser and the benchmark.
  - Write down the frame cost at 500 SVG and 5,000 Canvas Elements against `product.md` §1.6, and open the typed-array ticket if Canvas misses 5,000.
  - Add AutoRenderer to the demos' Renderer switch, and review.
