import { each, Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// each() hands values out in turn: colors on one cycle of three, points on a cycle of two.
const spec = {
  kind: 'burst',
  count: 12,
  radius: [0, 100],
  restAt: 0.4,
  children: {
    kind: 'star',
    points: each([4, 6]),
    radius: [12, 0],
    fill: each(['#ef476f', '#ffd166', '#118ab2']),
    duration: 1,
  },
};

gsap.effects.burst('.origin', { spec, repeat: -1, repeatDelay: 0.5 });
