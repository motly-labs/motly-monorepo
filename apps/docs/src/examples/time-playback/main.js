import { Burst, rand } from '@motly/core';
import { SVGRenderer } from '@motly/core/svg';

const renderer = new SVGRenderer(document.querySelector('svg'));

const burst = new Burst(
  {
    kind: 'burst',
    count: 14,
    radius: [0, 90],
    restAt: 0.4,
    children: {
      kind: 'star',
      points: 5,
      radius: [rand(5, 11), 0],
      angle: [0, rand(-180, 180)],
      fill: 'gold',
      duration: 2,
    },
  },
  { renderer, origin: { x: 150, y: 100 }, seed: 5 },
);

for (const button of document.querySelectorAll('button')) {
  button.addEventListener('click', () => burst[button.dataset.action]());
}

const slider = document.querySelector('input');
slider.addEventListener('input', () => burst.setProgress(slider.valueAsNumber));
burst.setProgress(slider.valueAsNumber);
