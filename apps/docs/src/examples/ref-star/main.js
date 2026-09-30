import { Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

// innerRadius is a fraction of radius: 0.2 is spiky, 0.8 is nearly a polygon.
const spec = {
  kind: 'star',
  points: 6,
  radius: 80,
  innerRadius: [0.2, 0.8, 0.2],
  angle: [0, 60],
  fill: 'gold',
  duration: 1.6,
  restAt: 0.25,
};

gsap.effects.shape('.origin', { spec, repeat: -1, repeatDelay: 0.5 });
