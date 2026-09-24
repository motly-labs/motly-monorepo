# motly

A procedural motion-graphics library for the web: it generates the thing being animated
(bursts, swirls, shapes) rather than animating existing DOM.

## Language

### What gets drawn

**Element**:
A single procedurally generated drawable (circle, polygon, star, cross, zigzag, path). `Shape` is the Element primitive.
_Avoid_: Primitive (too broad), node, particle

**Emitter**:
A primitive that spawns N children and places them by angle and radius. `Burst` is the Emitter primitive.
_Avoid_: Spawner, generator

**Modifier**:
A primitive that wraps exactly one child and alters its motion without drawing anything itself. `Swirl` is the Modifier primitive.
_Avoid_: Wrapper, decorator, effect

**Child**:
An Element, Emitter or Modifier owned by an Emitter or Modifier.
_Avoid_: Particle, item

**Preset**:
A named, parameterised composition of primitives built only from the public API (`Confetti`, `HeartBurst`).
_Avoid_: Effect, template

### Description vs live object

**Spec**:
The JSON-serializable description of a primitive: no functions, no renderer, no target. Randomness and distribution appear in it as tagged descriptors.
_Avoid_: Config, options, props

**Descriptor**:
A tagged object inside a Spec (`{ __motly: 'rand', ... }`, `{ __motly: 'each', ... }`) standing for a value resolved per Instance and per Child.
_Avoid_: Helper value, lazy value

**Distribution**:
A Descriptor that hands successive values to successive Children of an Emitter (`each([...])`).
_Avoid_: Array syntax, cycle

**Keyframes**:
A property value written as an array: successive values over one Child's duration.
_Avoid_: Steps

**Instance**:
A Spec bound to a Seed, a Renderer, an Origin and a Driver; the thing that plays and is destroyed. One Spec may back many Instances.
_Avoid_: Effect, animation, object

**Scope**:
An explicitly created owner of a set of Instances and the one Driver they share, released together by `destroy()`.
_Avoid_: Context (that is GSAP's ambient version), registry

**Seed**:
The number an Instance resolves its Descriptors from. Each Child derives its own from the Instance Seed and its index, so adding a Child leaves the earlier ones unchanged.
_Avoid_: Random state

**Resting frame**:
The single frame an Instance renders under reduced motion, at the Spec's `restAt` progress.
_Avoid_: Final state, end frame

### Time

**Playhead**:
The time `t` at which an Instance is sampled. Set only by a Driver.
_Avoid_: Current time, progress (progress is Playhead ÷ duration)

**Driver**:
Whatever advances the Playhead: core's rAF loop standalone, GSAP's ticker, or Motion. Owns play, pause, reverse and seek.
_Avoid_: Ticker (that is one kind of Driver), clock, scheduler

**Stagger**:
The offset of each Child's start time within an Emitter, shaped by an easing curve. An option of an Emitter, not a primitive.
_Avoid_: Delay (that is a single Child's offset)

**Timeline**:
A Driver that maps its own Playhead onto several Instances' Playheads.
_Avoid_: Sequence

### Output

**Renderer**:
The owner of a piece of DOM (an SVG container, a canvas) that paints a Draw list into it. The only part of the library that touches the DOM.
_Avoid_: Backend, painter

**Origin**:
The point in a Renderer's coordinate space an Instance is placed at.
_Avoid_: Target, anchor, position

**Draw list**:
The renderer-agnostic, per-frame description of everything to paint, produced by sampling an Instance.
_Avoid_: Render commands, scene, frame data
