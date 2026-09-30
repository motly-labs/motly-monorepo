import { Motly, rand } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

const spec = {
  kind: 'burst',
  count: 8,
  // The Burst's own radius: how far its Children are from the Origin.
  radius: [10, 110],
  easing: 'ease-out',
  restAt: 0.4,
  children: { kind: 'circle', radius: [rand(6, 12), 0], fill: 'deeppink', duration: 1 },
};

gsap.effects.burst('.origin', { spec, repeat: -1, repeatDelay: 0.5 });
