import { Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// A ring: a circle with no fill and a stroke.
const spec = {
  kind: 'circle',
  radius: [0, 90],
  fill: 'none',
  stroke: 'deeppink',
  strokeWidth: [16, 0],
  duration: 1,
  restAt: 0.4,
};

gsap.effects.shape('.origin', { spec, repeat: -1, repeatDelay: 0.5 });
