# `@motly/gsap` registers effects, through `registerPlugin`

`@motly/gsap` adds `burst` and `swirl` with `gsap.registerEffect()`, GSAP's mechanism for named effects: `gsap.effects.burst(targets, vars)`, and, with `extendTimeline: true`, `tl.burst(targets, vars, position)` on every timeline. Each effect builds an Instance and returns one tween of the Instance's duration whose `onUpdate` samples the Instance at the tween's time. The tween is the Driver (ADR-0009), so the effect nests in a timeline, scrubs and reverses with no change to core. There is no property plugin: a property plugin animates a property of a tween's existing targets, and a Burst has none to animate.

The adapter is still what the developer passes to `gsap.registerPlugin()`: an object with a `name` and a `register(core)` hook and no `init`. GSAP calls `register` with its own core, and the hook calls `core.registerEffect()`. So registration uses whichever copy of GSAP the host registered it with, never one the adapter imported, and it reads like every other GSAP plugin: `gsap.registerPlugin(Motly)`.

Checked against the source of gsap 3.15.0 (`registerEffect`, `registerPlugin` and `_createPlugin` in `gsap-core.js`) and the `gsap.registerEffect()` docs page. GreenSock no longer publishes the plugin-authoring guide `product.md` §4 asked for; the source is the authority.

## Considered Options

- **A property plugin, `gsap.to(el, { burst: { … } })`.** Rejected: it would need a target whose property it animates, and would not give `gsap.effects.burst()` or `tl.burst()`.
- **An exported `registerMotly(gsap)` that calls `registerEffect()`.** Works the same, but is not how any GSAP plugin is registered, for no gain.

## Consequences

- An effect's first argument is `targets`, which GSAP passes through `toArray()`: a selector becomes elements, and a plain `{ x, y }` becomes a one-item array. The `gsap.effects.burst(origin, vars)` shape assumed before this was checked does not fit; whether `targets` is the element painted into or the element burst from is for the Phase 2 spec.
- `registerPlugin()` queues a plugin until a `window` exists unless the plugin sets `headless: true`. Registering in Node, for the adapter's tests and SSR imports, needs it.
- GSAP types `gsap.effects` and timeline methods as `[key: string]: any`. The adapter augments those interfaces so `gsap.effects.burst` and `tl.burst` take a typed Spec (Invariant 9).
