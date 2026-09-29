# `@motly/gsap`

motly's procedural bursts as GSAP effects. `gsap.effects.burst(button, { spec })` returns an
ordinary tween, so a burst sits in a timeline, scrubs, reverses, repeats, is driven by
ScrollTrigger and is cleaned up by `gsap.context()` and `useGSAP`. You describe the burst as a JSON
Spec; motly generates the shapes and draws them.

## Install

With a bundler:

```sh
npm install @motly/gsap gsap
```

```js
import { gsap } from 'gsap';
import { Motly } from '@motly/gsap';

gsap.registerPlugin(Motly);
```

Importing registers nothing; `registerPlugin` does.

With script tags, as on CodePen, load GSAP first. The script build then registers itself and makes
`Motly` a global:

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@motly/gsap@0.1"></script>
```

Loaded before GSAP, it only defines `Motly`; call `gsap.registerPlugin(Motly)` yourself.

## A first burst

```js
import { gsap } from 'gsap';
import { Motly, rand } from '@motly/gsap';

gsap.registerPlugin(Motly);

const spec = {
  kind: 'burst',
  count: 12,
  radius: [0, 90],
  restAt: 0.4,
  children: { kind: 'circle', radius: [rand(4, 9), 0], fill: 'deeppink', duration: 0.8 },
};

const button = document.querySelector('button');
button.addEventListener('click', () => gsap.effects.burst(button, { spec }));

// Or in a timeline, placed with GSAP's position parameter. This one plays as the page loads:
gsap
  .timeline()
  .to(button, { scale: 0.9, yoyo: true, repeat: 1, duration: 0.1 })
  .burst(button, { spec }, '<');
```

`spec` is the whole burst: pass a Spec exported from an editor as it is. `rand`, `each` and the
named curves are exported from this package; with script tags they are `Motly.rand` and so on.
`gsap.effects.shape()` and `tl.shape()` draw a single Element the same way, from a Spec such as
`{ kind: 'star', points: 5, radius: [0, 40] }`.

## The vocabulary rule

Beside `spec`, `vars` takes four keys of motly's, `seed`, `container`, `renderer` and
`reducedMotion`, described below. Every other key means what it means in any GSAP tween, and
motly's own words for the burst live only in `spec`:

- `delay` holds back the whole tween; `spec.delay` is a wait at the start of the burst, inside the
  tween's length, as it is when the Spec plays without GSAP.
- `ease` warps the burst's time; `spec.easing` gives each property its curve. `ease` is `'none'`
  unless you give one, so a Spec runs at its own pace rather than under GSAP's default ease.
- `duration` stretches or squeezes the whole burst; without it, the tween lasts as long as the
  Spec.
- `repeat`, `yoyo`, `paused`, `onStart`, `onUpdate`, `onComplete` and `scrollTrigger` work as on
  any tween.

`keyframes`, `startAt`, `runBackwards` and `stagger` do not apply to a burst: the types reject
them, and given anyway they are ignored with a warning. Stagger bursts with a loop or with
timeline positions.

## Where a burst comes from

- An element, a selector or a list: one burst from each element's centre, each with its own Seed.
  The centre is read when the tween starts from 0 moving forward, not per frame, so a burst stays
  where it began if the page scrolls.
- `{ x, y }` in viewport pixels, as `clientX` and `clientY` give:

```js
addEventListener('pointerdown', (event) => {
  gsap.effects.burst({ x: event.clientX, y: event.clientY }, { spec });
});
```

- `seed: 7` draws the same bursts on every page load: the `i`th element or point draws from
  `seed + i`. Without it, each call draws a random Seed, which a repeat, a restart and a scrub all
  keep.
- A selector or list that matches nothing warns and gives a tween as long as the Spec that draws
  nothing, so a timeline keeps its timing.

## Where a burst is painted

By default, in an overlay the tween owns: fixed over the viewport, above the page, catching no
clicks, and in the document only while the tween is between its ends.

`container: '.card'`, an element or a selector, paints it inside that element instead, so it
scrolls with it and is clipped by it: what a burst scrubbed by ScrollTrigger in a pinned section
needs. The container must have a size; a static one is made relative while a burst is drawn in it,
and set back once the last one is cleared. A selector that matches nothing warns and gives a tween
as long as the Spec that draws nothing.

`renderer` is `'auto'` by default, which keeps bursts under 50 Elements in SVG and paints larger
ones on a canvas. `'svg'` or `'canvas'` forces one.

## Cleanup

A burst never outlives its tween where GSAP reaches the tween:

- At either end, nothing is left drawn.
- `tween.kill()`, `tween.revert()`, `tl.revert()` and `gsap.context().revert()`, and so `useGSAP`
  when a component unmounts, clear a burst mid-flight.
- **`tl.kill()` on a timeline does not.** GSAP does not tell a killed timeline's children, so a
  burst mid-flight stays drawn. Revert the timeline or its context instead, or kill the burst's own
  tween.
- Give `onInterrupt` in `vars`. motly chains its own clear-up before yours there; replacing it
  later with `tween.eventCallback('onInterrupt', fn)` drops the clear-up, so a later `kill()`
  leaves the burst drawn. For the same reason, reading it back, through `eventCallback()` or
  `tween.vars`, gives motly's wrapper rather than your function.

## Reduced motion

A viewer who prefers reduced motion sees the Spec's still Resting frame, at `spec.restAt`, for the
tween's full length, so everything after it in a timeline keeps its timing. The preference is read
each time the tween starts from 0, so changing it needs no reload; a `repeat` keeps the one it
started with. `reducedMotion: 'always'` or `'never'` in `vars` forces either, for a demo or a test.

This covers the bursts only. Your own tweens around them keep moving; wrap those in
`gsap.matchMedia()` with `(prefers-reduced-motion: reduce)`.

## Types

Importing the package types `gsap.effects.burst`, `gsap.effects.shape`, `tl.burst` and `tl.shape`:
`spec` must be a Spec of the right kind. `BurstVars`, `ShapeVars`, `MotlyVars` and `RendererName`
are exported for vars built apart from the call.
