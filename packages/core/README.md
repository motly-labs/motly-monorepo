# `@motly/core`

Procedural motion graphics for the web: bursts, shapes and swirls you describe as JSON and motly
generates, samples and paints. The engine has no runtime dependencies and never touches the DOM;
Renderers, in their own entries, do that.

Using GSAP? Install [`@motly/gsap`](https://www.npmjs.com/package/@motly/gsap) instead: it puts
these bursts in GSAP's timelines, scrubbing and cleanup.

The [docs](https://motly-labs.github.io/motly-monorepo/) have every Spec field with a live example.

## Install

```sh
npm install @motly/core
```

## A first burst

```html
<svg id="stage" width="300" height="300"></svg>
```

```js
import { Burst, rand } from '@motly/core';
import { SVGRenderer } from '@motly/core/svg';

const renderer = new SVGRenderer(document.querySelector('#stage'));

const burst = new Burst(
  {
    kind: 'burst',
    count: 12,
    radius: [0, 100],
    restAt: 0.4,
    children: {
      kind: 'circle',
      radius: [rand(4, 9), 0],
      fill: ['deeppink', 'gold'],
      duration: 0.8,
    },
  },
  { renderer, origin: { x: 150, y: 150 } },
);

burst.play();
```

The first argument is the Spec: plain JSON. An array is Keyframes, so `radius: [0, 100]` moves
from 0 to 100 over the burst. A burst lasts as long as its longest-running Child, so changing a
Child's `duration` changes the burst's. `rand(4, 9)` is a Descriptor, not a number: it survives
`JSON.stringify` and resolves from the Instance's Seed, so passing `seed: 7` beside `renderer`
draws the same burst every time. `each([...])`, also from `@motly/core`, hands values out to the
Children in turn.

The second argument binds the Spec to a Renderer and an Origin, in the Renderer's CSS pixels.
`play()` returns a promise that settles when the burst reaches its end, and leaves the last frame
drawn; call `burst.destroy()` when you are done with it, to remove what it drew.

## Renderers

Each Renderer paints into an element you own, and one Renderer can host any number of Instances.

- `SVGRenderer` from `@motly/core/svg`, into an `<svg>`: inspectable, up to a few hundred Elements.
- `CanvasRenderer` from `@motly/core/canvas`, onto a `<canvas>`: for thousands.
- `AutoRenderer` from `@motly/core/auto`, into a container element it layers: picks one of the two
  per Instance by its Element count.

## Reduced motion

A viewer who prefers reduced motion sees the Spec's still Resting frame instead of motion: the
frame at `restAt`, a progress from 0 to 1, or the last frame when it is left out. A burst's last
frame is usually empty, so set `restAt` where it still shows something, as above.
`reducedMotion: 'always'` or `'never'` in the second argument forces either, for a demo or a test.
Under reduced motion `play()` draws that frame and settles at once, so destroying the burst as soon
as `play()` settles would take the frame away with it.
