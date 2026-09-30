import { Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// A ring that lasts 1 second on its own.
const ring = {
  kind: 'circle',
  radius: [8, 90],
  fill: 'none',
  stroke: 'deeppink',
  strokeWidth: [10, 0],
  duration: 1,
  restAt: 0.3,
};

// Every key beside `spec` is GSAP's: squeeze it to 0.6 s, ease its time, repeat it forever.
gsap.effects.shape('.dot', {
  spec: ring,
  duration: 0.6,
  ease: 'power2.out',
  repeat: -1,
  repeatDelay: 0.4,
});
