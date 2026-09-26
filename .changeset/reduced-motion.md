---
'@motly/core': minor
---

Honour reduced motion by default. A Shape or Burst Spec takes `restAt`, the progress of its Resting frame (default 1). An Instance's binding, and a Timeline's options, take `reducedMotion: 'user' | 'always' | 'never'`, default `'user'`, which reads `prefers-reduced-motion` at each `play()`. Under reduced motion `play()` draws the Resting frame once and resolves at once, `resume()` does nothing and `reverse()` jumps to the first frame, so no animation runs; a Timeline draws each Instance at its own Resting frame and decides for everything on it.
