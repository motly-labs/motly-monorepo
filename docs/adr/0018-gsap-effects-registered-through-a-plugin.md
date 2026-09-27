# `@motly/gsap` registers effects, and draws through a property plugin

`@motly/gsap` adds `burst` and `shape` with `gsap.registerEffect()`, GSAP's mechanism for named effects: `gsap.effects.burst(targets, vars)`, and, with `extendTimeline: true`, `tl.burst(targets, vars, position)` on every timeline. Each effect builds one Instance per target and returns one tween. The tween is the Driver (ADR-0009), so the effect nests in a timeline, scrubs and reverses with no change to core.

The tween animates a private proxy object, not the targets, and draws through a property plugin: the plugin's `render(ratio)` samples the Instances at `ratio` × their duration. The targets are only read, for the Origin. A property plugin is used because its `render` runs on every render of the tween, including the ones GSAP makes with events suppressed: `tl.revert()` reaches a child tween's plugin at ratio 0 and reaches none of its callbacks. So a burst reverted with its timeline is cleared like any burst that reaches its start. `kill()` still reaches only `onInterrupt`.

The adapter is what the developer passes to `gsap.registerPlugin()`: one object that is that property plugin and whose `register(core)` hook calls `core.registerEffect()`. GSAP calls `register` with its own core, so registration uses whichever copy of GSAP the host registered it with, never one the adapter imported, and it reads like every other GSAP plugin: `gsap.registerPlugin(Motly)`.

Checked against the source of gsap 3.15.0 (`registerEffect`, `registerPlugin`, `_createPlugin`, `Animation.revert`, `_interrupt` and `Context` in `gsap-core.js`), the `gsap.registerEffect()` docs page, and a probe run in Node that recorded which hooks each of `tween.kill()`, `tween.revert()`, `tl.kill()`, `tl.revert()` and a context's `revert()` reaches. GreenSock no longer publishes the plugin-authoring guide `product.md` §4 asked for; the source is the authority.

## Considered Options

- **A property plugin as the public API, `gsap.to(el, { burst: { … } })`.** Rejected: it would not give `gsap.effects.burst()` or `tl.burst()`, and a Burst has no property of the element to animate.
- **Draw from the tween's `onUpdate`, with no property plugin.** Rejected: `tl.revert()` renders child tweens with events suppressed, so a burst reverted with its timeline would stay on screen, and the overlay is the adapter's, so the user could not remove it.
- **Tween the targets themselves.** Rejected: GSAP animates every unreserved `vars` key on the targets, so a stray key would move the element the burst comes from; the cost is that `gsap.killTweensOf(el)` does not find the burst.
- **An exported `registerMotly(gsap)` that calls `registerEffect()`.** Works the same, but is not how any GSAP plugin is registered, for no gain.

## Consequences

- The plugin's key works in any tween, `gsap.to(x, { motly: … })`. It is undocumented and not part of the API.
- `tl.kill()` reaches nothing on its children, neither callbacks nor plugin: a burst killed with its timeline mid-flight stays drawn. The docs say to kill or revert the burst's own tween, or revert a context.
- `registerPlugin()` queues a plugin until a `window` exists unless the plugin sets `headless: true`. Registering in Node, for the adapter's tests and SSR imports, needs it; gsap has had it since at least 3.13.0.
- GSAP types `gsap.effects` and timeline methods loosely (`[key: string]: any`). The adapter augments those interfaces so `gsap.effects.burst` and `tl.burst` take a typed Spec (Invariant 9).
