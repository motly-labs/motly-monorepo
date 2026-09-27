---
'@motly/gsap': minor
---

`container` in `vars`, an element or a selector, paints a burst inside that element instead of over the viewport, so it scrolls with its section, is clipped by its card, and stays on its content when ScrollTrigger scrubs it. Anchors and points are placed in the container's coordinates. The container must have a size; a static one is made relative. A selector that matches nothing warns once and returns a tween as long as the Spec that draws nothing, as targets that match nothing do. `renderer: 'svg' | 'canvas' | 'auto'` picks the Renderer in either mode. It defaults to `'auto'`, which keeps small bursts in SVG and paints large ones on a canvas, so the overlay is now a `<div>` holding the Renderer's layer rather than an `<svg>`.
