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
