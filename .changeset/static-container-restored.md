---
'@motly/gsap': patch
---

A static `container` is set back to its own `position` once the last burst drawn in it is cleared, at its end, on kill or on revert. It used to stay `relative` after the burst.
