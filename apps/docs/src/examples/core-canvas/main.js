import { Burst, each, rand } from '@motly/core';
import { CanvasRenderer } from '@motly/core/canvas';

const renderer = new CanvasRenderer(document.querySelector('#stage'));

// 24 bursts of 12: 288 Elements, which a canvas paints faster than SVG would.
const burst = new Burst(
  {
    kind: 'burst',
    count: 24,
    radius: [0, 90],
    children: {
      kind: 'burst',
      count: 12,
      radius: [0, rand(20, 45)],
      delay: rand(0, 0.3),
      children: {
        kind: 'circle',
        radius: [rand(2, 4), 0],
        fill: each(['#ffd166', '#ef476f', '#06d6a0', '#118ab2']),
        duration: rand(0.6, 1),
      },
    },
  },
  { renderer, origin: { x: 180, y: 150 } },
);

burst.play();
