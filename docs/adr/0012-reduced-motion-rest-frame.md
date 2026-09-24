# Reduced motion shows `restAt`, not the last frame

Under reduced motion an Instance renders one static frame, `sample(restAt * duration)`. `restAt` is a Spec field defaulting to 1. A Burst usually ends with its children at radius 0 or opacity 0, so the plan's "render the final resting state" (`product.md` §1.5) would show reduced-motion users an empty frame for the flagship primitive. Presets set `restAt` to a frame that actually shows something.

## Consequences

- `restAt` is part of the Spec, so it serializes and an editor can expose it.
- `reducedMotion: 'user' | 'always' | 'never'` stays on the Instance: it is a property of the viewer, not of the effect.
