# 13: Reduced motion — the Resting frame at `restAt`

Status: ready-for-agent
Blocked by: 02

**What to build:** A viewer with `prefers-reduced-motion: reduce` sees one static Resting frame instead of motion — not a blank page — with no configuration by the developer (Invariant 10, ADR-0012).

- [ ] `restAt` is a Spec field, defaulting to 1.
- [ ] `reducedMotion: 'user' | 'always' | 'never'` is set on the Instance, not the Spec, defaulting to `'user'`.
- [ ] `'user'` reads `matchMedia` from `globalThis` at `play()`, never at import. With none available, it treats the preference as unset.
- [ ] Under reduced motion, the Instance renders `sample(restAt * duration)` once, never starts the Driver, and `play()` resolves at once.
- [ ] A Burst whose final frame is empty shows Children at a `restAt` below 1.
