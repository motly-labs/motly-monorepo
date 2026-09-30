import { each, Motly, rand } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// A Burst whose Children are Bursts: each one opens where its parent threw it.
const spec = {
  kind: 'burst',
  count: 6,
  radius: [0, 90],
  restAt: 0.5,
  children: {
    kind: 'burst',
    count: 8,
    radius: [0, rand(20, 35)],
    delay: 0.25,
    children: {
      kind: 'circle',
      radius: [rand(3, 5), 0],
      fill: each(['#ffd166', '#ef476f', '#118ab2']),
      duration: 0.8,
    },
  },
};

gsap.effects.burst('.origin', { spec, repeat: -1, repeatDelay: 0.5 });
