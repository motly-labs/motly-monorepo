# Renderers own the DOM; Instances carry an origin

A Renderer is constructed with the element it paints into (`new SVGRenderer(containerEl)`, `new CanvasRenderer(canvasEl)`) and owns all DOM. An Instance is bound to a Renderer and carries an origin `{ x, y }` in that Renderer's coordinate space; core never receives an element. This is what Invariant 1 ("core has no DOM API") means in practice, and it makes one Renderer with many Instances the default shape.

## Consequences

- A click-burst covers the page with one Renderer and creates an Instance per click. Fifty clicks add no DOM.
- The origin is a plain number pair bound to the Instance, not part of the Spec, so one Spec plays at any origin. (Corrected after ticket 05: this line said the origin survives `JSON.stringify` "with the rest of the Spec", but the origin was never in the Spec.)
- Pointer coordinates are converted to the Renderer's space by the caller, or by an adapter. Core does no hit-testing and reads no layout.
- SSR safety falls out: constructing a Renderer is the only step that touches the DOM, so a Spec can be built on the server.
