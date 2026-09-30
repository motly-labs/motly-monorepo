import { each, Motly, rand } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// each([...]) hands different Children out in turn: circle, star, polygon, circle, …
const shared = { radius: [rand(6, 12), 0], angle: [0, rand(-180, 180)], duration: 1 };

const spec = {
  kind: 'burst',
  count: 12,
  radius: [0, 110],
  restAt: 0.4,
  children: each([
    { kind: 'circle', fill: '#ef476f', ...shared },
    { kind: 'star', points: 5, fill: '#ffd166', ...shared },
    { kind: 'polygon', points: 3, fill: '#06d6a0', ...shared },
  ]),
};

gsap.effects.burst('.origin', { spec, repeat: -1, repeatDelay: 0.5 });
