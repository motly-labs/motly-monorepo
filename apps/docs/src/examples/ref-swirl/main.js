import { each, Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// A Swirl bends the path of the Child it wraps; direction alternates with each([1, -1]).
const spec = {
  kind: 'burst',
  count: 10,
  radius: [0, 120],
  restAt: 0.4,
  children: {
    kind: 'swirl',
    size: 30,
    frequency: 1.5,
    direction: each([1, -1]),
    child: { kind: 'circle', radius: [8, 2], fill: '#8338ec', duration: 1.4 },
  },
};

gsap.effects.burst('.origin', { spec, repeat: -1, repeatDelay: 0.5 });
