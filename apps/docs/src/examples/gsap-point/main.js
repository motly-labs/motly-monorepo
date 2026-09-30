import { each, Motly, rand } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

const spec = {
  kind: 'burst',
  count: 10,
  radius: [0, 60],
  restAt: 0.4,
  children: {
    kind: 'circle',
    radius: [rand(3, 7), 0],
    fill: each(['#ffd166', '#ef476f', '#06d6a0', '#118ab2']),
    duration: rand(0.5, 0.8),
  },
};

// A point in viewport pixels, as clientX and clientY give, instead of an element.
addEventListener('pointerdown', (event) => {
  gsap.effects.burst({ x: event.clientX, y: event.clientY }, { spec });
});
