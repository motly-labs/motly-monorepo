import { Motly } from '@motly/gsap';
import { gsap } from 'gsap';

gsap.registerPlugin(Motly);

const spec = {
  kind: 'polygon',
  points: 6,
  radius: [20, 90],
  angle: [0, 60],
  fill: 'none',
  stroke: 'gold',
  strokeWidth: 4,
  opacity: [1, 0],
  duration: 1.2,
  restAt: 0.4,
};

gsap.effects.shape('.origin', { spec, repeat: -1, repeatDelay: 0.5 });
