import { Burst, rand } from '@motly/core';
import { SVGRenderer } from '@motly/core/svg';

const spec = {
  kind: 'burst',
  count: 12,
  radius: [0, 80],
  // Where the Resting frame is, as a progress from 0 to 1. Its last frame would be empty.
  restAt: 0.4,
  children: { kind: 'circle', radius: [rand(4, 9), 0], fill: 'gold', duration: 1.2 },
};

for (const [id, reducedMotion] of [
  ['#moving', 'never'],
  ['#resting', 'always'],
]) {
  const renderer = new SVGRenderer(document.querySelector(id));
  const burst = new Burst(spec, { renderer, origin: { x: 110, y: 110 }, reducedMotion, seed: 3 });
  burst.play();
}
