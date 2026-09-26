# 11: CanvasRenderer at parity with SVG

Status: resolved
Blocked by: 04, 10

**What to build:** A developer can swap `SVGRenderer` for `CanvasRenderer` and see the same effect, drawn on a canvas. This is the perf story past SVG's ceiling.

- [x] `@motly/core/canvas` exports `CanvasRenderer`, constructed with its canvas element.
- [x] It draws every kind and style `SVGRenderer` does, from the same Draw list, building geometry itself.
- [x] Several Instances can share one canvas, and destroying one leaves the others drawing.
- [x] Output is crisp on high-DPR screens.
- [x] `apps/demos` can switch any demo between the two Renderers.

## Comments

**Implementation notes (ticket 11 build).**

- **Entry:** `@motly/core/canvas` exports `CanvasRenderer`, built with its `<canvas>`. It is a tsdown entry and a `package.json` export beside `./svg`, and it imports on a server without a crash (no DOM access at module load).
- **Geometry:** built from the records through `src/geometry.ts`, the tracer ticket 10 wrote for this: the 2D context is the Pen. A circle is `arc`; a custom path is a `Path2D`, cached per `d` string and dropped when the last Instance is released. The transform, including the device pixel ratio, is one `setTransform` per Element. `miterLimit` is SVG's 4, so corners are cut where SVGRenderer cuts them.
- **Sharing a canvas:** the Renderer keeps a copy of each Instance's last frame, since a Draw list is valid only until its next sample, and repaints all of them on every frame. Copies reuse last frame's objects, so a steady frame allocates nothing. Draws are collected into one repaint per task with a microtask, so the Instances of one Driver, which draw in the same frame callback, share one clear and one repaint. Paint order is the order Instances first drew. `release()` drops the frame and repaints, so the others keep drawing.
- **Size (decided with the user):**
  - Origins are in the canvas's CSS pixels, and the canvas holds `devicePixelRatio` times as many, so it is sharp on high-density screens. Checked in Chrome at DPR 2.
  - A `ResizeObserver` on the canvas follows its size on the page, and uses exact device pixels where the browser reports them. It catches layout changes a window `resize` listener would miss. On a resize the Renderer resizes the backing store, which clears it, and repaints from the kept frames at once.
  - A canvas sized only by its `width` and `height` attributes would grow with its own backing store. The Renderer notices that growth, when it is built or on a later resize, and pins the canvas inline at its size on the page. A canvas the page sizes in CSS is never pinned, and stays responsive. Checked in Chrome: a `width: 100%` canvas followed its container from 300 to 500 CSS pixels, to 1,000 device pixels, and kept drawing.
  - `devicePixelRatio` is also checked on every paint, for zoom and moving between screens where a browser (Safari) does not report device pixels to the observer.
  - The observer runs only while some Instance is drawing: it disconnects when the last one is released and reconnects on the next draw. So `scope.destroy()` leaves no listener behind, and the Renderer port needs no `destroy()`.
  - Origins do not move on a resize: core reads no layout.
- **Known differences from SVG, documented on the class:** `opacity` applies to fill and stroke one after the other (SVG's is group opacity), so a translucent stroke over its fill shows the fill through; and colors must be ones a canvas parses, so no `var()`.
- **Tests:** the Renderer is DOM code, so it has no Vitest test (spec, Testing Decisions); ticket 17's Playwright harness runs the same Specs through both Renderers. Checked by hand in Chrome instead: every kind draws as SVGRenderer does; two Instances on one canvas, one destroyed, leaves the other drawing and nothing of the first; `scope.destroy()` clears the canvas; the resize above.
- **Rough cost:** 5,000 Elements, sampled and painted, take about 5.4 ms of main-thread time a frame in Chrome on the development machine (5.7 ms mixing circles and stars). Ticket 12 owns the measured numbers.
- **After review:**
  - **Fixed, checked in Chrome:** an overshooting easing can take a circle's radius below 0, where `arc` throws; that aborted the paint of every Instance on the canvas, every frame. A circle at radius 0 or less is now skipped, as SVG skips it.
  - **Fixed:** an opacity outside 0–1 is clamped. A canvas ignores such an alpha and keeps the last Element's.
  - **Fixed, checked in Chrome:** a canvas built while hidden or out of the document measures 0. It was sized to 0 × 0 and stayed collapsed; it is now left alone until the observer sees it laid out, then sized and pinned as usual. A canvas hidden later keeps its backing store.
  - **Fixed:** a change of `devicePixelRatio` goes through the same fit-and-pin as a resize, so a canvas sized by its attributes at DPR 1 is pinned at its own size when zoomed, not at double.
  - **Fixed:** the custom path's box, `PATH_BOX` and `pathBoxScale()`, live in `geometry.ts`, shared by both Renderers; the two copies had drifted.
  - **Tidied:** names (`#lists`, `#paintScheduled`, `#sizeBackingStore`), no `ResizeObserver` guard (every browser that runs ES2022 has one), and the demos keep their `role="img"` and labels.
  - **Documented, not changed:**
    - Draws are batched per task, so Instances on one canvas share a repaint when they share a Scope's Driver. Standalone Shapes and Bursts each have their own rAF callback, and each repaints the whole canvas. Batching across Drivers would take a frame callback of the Renderer's own and draw a frame late.
    - The canvas is painted a microtask after `seek()`, still before the browser renders; a test reading pixels awaits a microtask.
    - The inline pin, and the width and height it writes, stay on the canvas after its Instances are released: the canvas belongs to the Renderer's owner.
    - An invalid color, which only a CSS function such as `var()` can be after validation, leaves the previous fill in place on a canvas.
- **Demos:** a Renderer switch at the top of `apps/demos` moves every demo between SVGRenderer and CanvasRenderer, and a new demo shows a canvas sized in CSS following the window.
