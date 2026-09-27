---
'@motly/gsap': minor
---

A viewer who prefers reduced motion sees a burst's still Resting frame, the Spec's `restAt`, instead of motion, while its tween keeps its full length, so everything after it in a timeline keeps its timing. The preference is read each time the tween starts from 0 moving forward, so changing the setting takes effect without a reload. `reducedMotion: 'always' | 'never'` in `vars` forces either, for a demo or a test; it defaults to `'user'`.
