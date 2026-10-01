# @motly/core

## 0.2.0

### Minor Changes

- 0898cb5: A Burst can now be aimed and fanned, and its Children turned to face their throw. `angle` turns the rays, `spread` narrows them to an arc centred on `angle` (a cannon at 60–120, a jet at 0), and `orient: true` points each Child along its ray. Specs that set none of them draw exactly as before.

## 0.1.1

### Patch Changes

- 52f42ba: Link the docs site, with a live example for every Spec field, from the README and `homepage`.

## 0.1.0

### Minor Changes

- bfeeb87: Initial release: procedural motion graphics for the web. You describe bursts and shapes as JSON Specs; an engine with no runtime dependencies generates and samples them, and Renderers in their own entries paint them.
  
  - **Primitives.** `Shape` draws one Element: `circle`, `polygon`, `star`, `cross`, `line`, `zigzag` or `path`, each taking only its own parameters. `Burst` throws `count` Children around the Origin at an animatable `radius`, and a Child may be another Burst or a Swirl, which bends the path it is thrown along. A Burst lasts as long as its longest-running Child.
  - **Specs stay JSON.** An array is Keyframes of any length. Colors, lengths and angles interpolate with their units, and times take units too. `rand(min, max)` and `each([...])` are Descriptors, not numbers, and resolve from the Instance's `seed`, so the same Seed draws the same burst on any machine. Every Spec is validated when an Instance is created, with one error naming the bad value's place.
  - **Timing.** `delay` on a Shape or Burst, `stagger` across a Burst's Children, and `easing` per property: CSS keywords, cubic-beziers, SVG path strings, and 30 named curves such as `backOut` that tree-shake when unused.
  - **Playback.** `play()`, `pause()`, `resume()`, `reverse()`, `seek(t)` and `setProgress(p)` on every Instance, with `onStart`, `onUpdate` and `onComplete`; on a Timeline, the Timeline's own do this for all of them. `createScope()` owns Instances and releases them together; `scope.timeline()` sequences them on one Playhead. The Driver that moves the Playhead is replaceable, so a host such as GSAP can decide its time.
  - **Renderers.** `SVGRenderer` (`@motly/core/svg`), `CanvasRenderer` (`@motly/core/canvas`) and `AutoRenderer` (`@motly/core/auto`), which picks one of the two per Instance by its Element count.
  - **Reduced motion.** By default, a viewer who prefers reduced motion sees the Spec's still Resting frame, at `restAt`, instead of motion. `reducedMotion: 'always' | 'never'` forces either. `isMotionReduced()` and `Instance.restingPlayhead` let an adapter whose host moves the Playhead do the same.
