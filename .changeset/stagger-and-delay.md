---
'@motly/core': minor
---

Add `delay` to a Shape and a Burst, and `stagger` to a Burst. `stagger: 0.05` starts each Child 0.05s after the one before; `stagger: { each: 0.05, easing: expoOut }` spreads the same span along a curve, so a burst lands unevenly on purpose. Each Child is thrown from the Origin when it starts, and holds its first frame until then. An Instance's duration includes every offset.
