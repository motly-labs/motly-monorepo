---
'@motly/gsap': minor
---

Add `Motly`, motly's GSAP plugin. After `gsap.registerPlugin(Motly)`, `gsap.effects.burst(element, { spec })` returns an ordinary tween as long as the burst, drawn from the element's centre, and `tl.burst(element, { spec }, position)` places one in a timeline. The burst is painted in an overlay above the page that catches no clicks, in the document only while the tween is between its ends, so scrubbing back in draws it again. The element's centre is read each time the tween starts from 0. Importing the package registers nothing, and registering works in Node.
