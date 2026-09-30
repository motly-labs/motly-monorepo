import { Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// Each Child starts 0.05 s after the one before it, clockwise from 12 o'clock.
const spec = {
  kind: 'burst',
  count: 16,
  stagger: 0.05,
  radius: [0, 100],
  restAt: 0.6,
  children: { kind: 'circle', radius: [7, 0], fill: '#06d6a0', duration: 0.7 },
};

gsap.effects.burst('.origin', { spec, repeat: -1, repeatDelay: 0.5 });
