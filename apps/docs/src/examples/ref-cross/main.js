import { Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// A cross encloses nothing, so it is stroked by default: deeppink, 2 px wide.
const spec = {
  kind: 'cross',
  radius: [10, 60],
  angle: [0, 90],
  strokeWidth: [10, 0],
  duration: 0.9,
  restAt: 0.4,
};

gsap.effects.shape('.origin', { spec, repeat: -1, repeatDelay: 0.5 });
