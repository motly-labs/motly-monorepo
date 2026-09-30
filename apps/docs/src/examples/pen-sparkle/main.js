import { each, Motly, rand } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

const sparkle = {
  kind: 'burst',
  count: 9,
  radius: [0, rand(40, 70)],
  stagger: 0.02,
  restAt: 0.4,
  children: {
    kind: 'star',
    points: 4,
    innerRadius: 0.3,
    radius: [rand(6, 11), 0],
    angle: [0, rand(-90, 90)],
    fill: each(['#ffd60a', '#ffffff', '#90e0ef']),
    duration: rand(0.4, 0.7),
  },
};

// A point is { x, y } in viewport pixels, exactly what clientX and clientY give.
addEventListener('pointerdown', (event) => {
  gsap.effects.burst({ x: event.clientX, y: event.clientY }, { spec: sparkle });
});
