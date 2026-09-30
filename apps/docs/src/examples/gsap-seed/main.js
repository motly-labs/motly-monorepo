import { each, Motly, rand } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

const spec = {
  kind: 'burst',
  count: 9,
  radius: [0, rand(40, 70)],
  restAt: 0.4,
  children: {
    kind: 'star',
    points: 5,
    radius: [rand(4, 10), 0],
    angle: [0, rand(-180, 180)],
    fill: each(['gold', 'deeppink', 'white']),
    duration: rand(0.5, 0.9),
  },
};

// One burst per matching element; the ith draws from seed + i, so the three differ from each
// other but are the same on every click and every page load.
document.querySelector('#seeded').addEventListener('click', () => {
  gsap.effects.burst('.icon', { spec, seed: 7 });
});

// Without a seed, every call draws a fresh random burst.
document.querySelector('#random').addEventListener('click', () => {
  gsap.effects.burst('.icon', { spec });
});
